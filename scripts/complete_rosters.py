#!/usr/bin/env python3
"""Complete generated club squads from the upstream registered-player catalogue.

The main database builder includes players with 2024/25 league appearances.
This supplement also adds catalogue players whose current club is represented
in the generated club set, so registered players without a season appearance
are not omitted. Source catalogue membership is not a historical registration
snapshot and is marked accordingly in each added record.
"""
from __future__ import annotations

import csv
import datetime as dt
import gzip
import io
import json
import math
import re
import tempfile
import urllib.request
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
URL = 'https://pub-e682421888d945d684bcae8890b0ec20.r2.dev/data/transfermarkt-datasets.zip'
ARCHIVE = Path(tempfile.gettempdir()) / 'touchline-transfermarkt-datasets.zip'
OUTPUT = ROOT / 'database.generated.js'


def say(message: str) -> None:
    print(message, flush=True)


def table_from_zip(zf: zipfile.ZipFile, table: str) -> list[dict[str, str]]:
    matches = [name for name in zf.namelist() if Path(name).name in {f'{table}.csv', f'{table}.csv.gz'}]
    if not matches:
        raise RuntimeError(f'Missing {table}.csv(.gz) in source archive')
    name = matches[0]
    raw = zf.read(name)
    if name.endswith('.gz'):
        raw = gzip.decompress(raw)
    return list(csv.DictReader(io.TextIOWrapper(io.BytesIO(raw), encoding='utf-8-sig', newline='')))


def number(value, default=0):
    try:
        return int(float(value or 0))
    except (ValueError, TypeError):
        return default


def slug(value: str) -> str:
    import unicodedata
    normalized = unicodedata.normalize('NFKD', value or '').encode('ascii', 'ignore').decode().lower()
    return re.sub(r'(^-|-$)', '', re.sub(r'[^a-z0-9]+', '-', normalized))


def date_value(value):
    try:
        return dt.date.fromisoformat((value or '')[:10])
    except (ValueError, TypeError):
        return None


def age_at(value):
    birth = date_value(value)
    if not birth:
        return None
    today = dt.date.today()
    return today.year - birth.year - ((today.month, today.day) < (birth.month, birth.day))


def position(row):
    raw = (row.get('sub_position') or row.get('position') or 'Unknown').strip()
    aliases = {
        'Centre-Forward': 'ST', 'Second Striker': 'CF', 'Left Winger': 'LW',
        'Right Winger': 'RW', 'Attacking Midfield': 'CAM', 'Central Midfield': 'CM',
        'Defensive Midfield': 'CDM', 'Left Midfield': 'LM', 'Right Midfield': 'RM',
        'Centre-Back': 'CB', 'Left-Back': 'LB', 'Right-Back': 'RB', 'Goalkeeper': 'GK',
    }
    return aliases.get(raw, raw)


def js(value):
    return json.dumps(value, ensure_ascii=False, separators=(',', ':'))


def exports(text: str, name: str):
    match = re.search(rf'^export const {re.escape(name)} = (.+);$', text, re.M)
    if not match:
        raise RuntimeError(f'Could not find generated {name} export')
    return match, json.loads(match.group(1))


def main():
    if not ARCHIVE.exists() or ARCHIVE.stat().st_size < 1000:
        say('Downloading public player and club catalogue (large archive; this may take a while)...')
        request = urllib.request.Request(URL, headers={'User-Agent': 'FootballClubDatabaseBuilder/1.0'})
        with urllib.request.urlopen(request, timeout=180) as response, ARCHIVE.open('wb') as out:
            while chunk := response.read(1024 * 1024):
                out.write(chunk)

    say(f'Reading source archive: {ARCHIVE}')
    with zipfile.ZipFile(ARCHIVE) as zf:
        source_players = table_from_zip(zf, 'players')
        source_clubs = table_from_zip(zf, 'clubs')

    text = OUTPUT.read_text(encoding='utf-8')
    metadata_match, metadata = exports(text, 'generatedMetadata')
    players_match, current_players = exports(text, 'generatedPlayers')
    clubs_match, generated_clubs = exports(text, 'generatedClubs')
    # Membership is limited to clubs the app actually exposes from this source dataset.
    source_club_by_id = {str(item.get('club_id')): item for item in source_clubs if item.get('club_id')}
    target_by_source_id = {str(item.get('sourceId')): item for item in generated_clubs if item.get('sourceId')}
    target_by_normalized_name = {slug(item.get('name', '')): item for item in generated_clubs if item.get('name')}

    # The source snapshot may identify a player's current club by ID or by name.
    # Only use a name match when the source club ID itself is unavailable/unmapped.
    existing_by_source = {}
    for player in current_players:
        source_id = str(player.get('sourceId') or '')
        if source_id:
            existing_by_source.setdefault(source_id, []).append(player)

    appended = []
    covered_catalogue_ids = set()
    for source_player in source_players:
        source_id = str(source_player.get('player_id') or '')
        if not source_id:
            continue
        club_id = str(source_player.get('current_club_id') or source_player.get('player_club_id') or '')
        source_club = source_club_by_id.get(club_id)
        target_club = target_by_source_id.get(club_id)
        if not target_club:
            candidate_name = source_player.get('current_club_name') or (source_club or {}).get('name') or ''
            target_club = target_by_normalized_name.get(slug(candidate_name))
        if not target_club:
            continue
        covered_catalogue_ids.add(source_id)
        if any(item.get('club') == target_club.get('name') for item in existing_by_source.get(source_id, [])):
            continue

        name = (source_player.get('name') or '').strip()
        if not name:
            continue
        value = number(source_player.get('market_value_in_eur'))
        estimate = max(45, min(88, round(48 + 7.5 * (math.log10(max(1, value)) - 5)))) if value > 0 else 55
        age = age_at(source_player.get('date_of_birth'))
        # If the player appeared for another team during 2024/25, retain the
        # season record and add a separate current-roster entry for this club.
        suffix = '-roster' if existing_by_source.get(source_id) else ''
        appended.append({
            'id': f'{slug(name)}-{source_id}{suffix}',
            'name': name,
            'age': age,
            'position': position(source_player),
            'club': target_club.get('name') or '',
            'country': source_player.get('country_of_citizenship') or '',
            'ovr': estimate,
            'potential': estimate,
            'marketValueEUR': value,
            'weeklyWageEUR': 0,
            'wonderkid': bool(age is not None and age <= 21 and estimate >= 75),
            'sourceId': source_id,
            'league': target_club.get('league') or '',
            'appearances2024_25': 0,
            'rosterOnly': True,
            'ratingSource': 'estimated from market value; not an official game rating',
            'potentialSource': 'not available',
            'marketValueDate': None,
            'dataSource': 'Upstream registered-player catalogue; current club snapshot, no 2024/25 appearance recorded for this club',
        })

    # Idempotently remove previously generated roster-only rows before replacing
    # them, so rerunning database:build does not accumulate duplicate entries.
    current_players = [player for player in current_players if not player.get('rosterOnly')]
    current_players.extend(appended)
    current_players.sort(key=lambda player: (player.get('league') or '', player.get('club') or '', player.get('name') or '', player.get('id') or ''))
    metadata['playerCount'] = len(current_players)
    metadata['rosterCataloguePlayerCount'] = len(appended)
    metadata['rosterCatalogueNote'] = 'Roster-only additions use the upstream player catalogue current-club snapshot and are not evidence of 2024/25 appearances; source catalogue coverage varies.'

    text = text[:metadata_match.start()] + f'export const generatedMetadata = {js(metadata)};' + text[metadata_match.end():]
    # Re-find player export after the metadata string replacement (length may change).
    text = re.sub(r'^export const generatedPlayers = .+;$', f'export const generatedPlayers = {js(current_players)};', text, count=1, flags=re.M)
    OUTPUT.write_text(text, encoding='utf-8')
    say(f'Added {len(appended)} registered roster records; database now contains {len(current_players)} player records.')
    say('Roster completion is limited to generated clubs matched in the upstream player/club catalogue; no names are invented.')


if __name__ == '__main__':
    main()
