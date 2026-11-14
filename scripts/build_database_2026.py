#!/usr/bin/env python3
"""Build the game's 2025/26 (2026 season) club and player database.

Uses the public dcaribou/transfermarkt-datasets archive. Players with league
appearances in the selected season are included, then current-club catalogue
entries are added for covered clubs when no season appearance record exists.
Catalogue-only entries are labeled as roster snapshots, not season appearances.
"""
from __future__ import annotations

import csv
import datetime as dt
import gzip
import io
import json
import math
import re
import sys
import tempfile
import urllib.request
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
URL = 'https://pub-e682421888d945d684bcae8890b0ec20.r2.dev/data/transfermarkt-datasets.zip'
ARCHIVE = Path(tempfile.gettempdir()) / 'touchline-transfermarkt-datasets.zip'
OUT = ROOT / 'database.generated.js'
START = dt.date(2025, 7, 1)
END = dt.date(2026, 6, 30)


def say(message):
    print(message, flush=True)


def table_from_zip(zf, table):
    wanted = {f'{table}.csv', f'{table}.csv.gz'}
    matches = [name for name in zf.namelist() if Path(name).name in wanted]
    if not matches:
        raise RuntimeError(f'Missing {table}.csv(.gz) in source archive')
    name = matches[0]
    raw = zf.read(name)
    if name.endswith('.gz'):
        raw = gzip.decompress(raw)
    return list(csv.DictReader(io.TextIOWrapper(io.BytesIO(raw), encoding='utf-8-sig', newline='')))


def date_value(value):
    try:
        return dt.date.fromisoformat((value or '')[:10])
    except (ValueError, TypeError):
        return None


def number(value, default=0):
    try:
        return int(float(value or 0))
    except (ValueError, TypeError):
        return default


def slug(value):
    import unicodedata
    normalized = unicodedata.normalize('NFKD', value or '').encode('ascii', 'ignore').decode().lower()
    return re.sub(r'(^-|-$)', '', re.sub(r'[^a-z0-9]+', '-', normalized))


def age_at(dob):
    birth = date_value(dob)
    if not birth:
        return None
    return END.year - birth.year - ((END.month, END.day) < (birth.month, birth.day))


def position(row):
    raw = (row.get('sub_position') or row.get('position') or 'Unknown').strip()
    aliases = {
        'Centre-Forward': 'ST', 'Second Striker': 'CF', 'Left Winger': 'LW',
        'Right Winger': 'RW', 'Attacking Midfield': 'CAM', 'Central Midfield': 'CM',
        'Defensive Midfield': 'CDM', 'Left Midfield': 'LM', 'Right Midfield': 'RM',
        'Centre-Back': 'CB', 'Left-Back': 'LB', 'Right-Back': 'RB', 'Goalkeeper': 'GK',
    }
    return aliases.get(raw, raw)


def continent(country):
    regions = {
        'Asia': {'China','Japan','South Korea','Saudi Arabia','United Arab Emirates','Qatar','Indonesia','Thailand','Vietnam','Cambodia','Malaysia','Singapore','Philippines','India','Iran','Iraq'},
        'Africa': {'South Africa','Nigeria','Ivory Coast','Morocco','Egypt','Tunisia','DR Congo','Algeria','Angola','Cameroon','Ghana','Kenya','Senegal','Tanzania','Zambia'},
        'Europe': {'England','Spain','Italy','Germany','France','Netherlands','Portugal','Turkey','Russia','Belgium','Ireland','Scotland','Austria','Denmark','Norway','Sweden','Switzerland','Croatia','Greece','Poland','Ukraine','Czech Republic','Czechia'},
        'North America': {'United States','Mexico','Canada','Costa Rica','Honduras','Jamaica','Panama','Guatemala'},
        'South America': {'Brazil','Argentina','Colombia','Chile','Ecuador','Paraguay','Peru','Uruguay','Venezuela'},
        'Oceania': {'Australia','New Zealand','New Caledonia','French Polynesia','Fiji','Papua New Guinea'},
    }
    return next((region for region, countries in regions.items() if country in countries), 'Unknown')


def js(value):
    return json.dumps(value, ensure_ascii=False, separators=(',', ':'))


def main():
    if not ARCHIVE.exists() or ARCHIVE.stat().st_size < 1000:
        say('Downloading public Transfermarkt-derived dataset archive...')
        request = urllib.request.Request(URL, headers={'User-Agent': 'FootballClubDatabaseBuilder/1.0'})
        with urllib.request.urlopen(request, timeout=180) as response, ARCHIVE.open('wb') as out:
            while chunk := response.read(1024 * 1024):
                out.write(chunk)

    say(f'Reading source archive: {ARCHIVE}')
    with zipfile.ZipFile(ARCHIVE) as zf:
        competitions = table_from_zip(zf, 'competitions')
        source_clubs = table_from_zip(zf, 'clubs')
        source_players = table_from_zip(zf, 'players')
        games = table_from_zip(zf, 'games')
        appearances = table_from_zip(zf, 'appearances')
        valuations = table_from_zip(zf, 'player_valuations')

    competition_by_id = {str(item.get('competition_id')): item for item in competitions}
    league_competition_ids = {
        cid for cid, comp in competition_by_id.items()
        if 'league' in (comp.get('type') or '').lower()
        and 'cup' not in (comp.get('name') or '').lower()
    }
    season_games = {
        str(game.get('game_id')): game for game in games
        if (match_date := date_value(game.get('date')))
        and START <= match_date <= END
        and str(game.get('competition_id')) in league_competition_ids
    }
    if not season_games:
        raise RuntimeError(
            f'The upstream archive has no league fixtures in {START}..{END}. '
            'It may not yet contain the 2025/26 season; no old-season fallback was generated.'
        )

    season_appearances = [row for row in appearances if str(row.get('game_id')) in season_games]
    competition_ids = {str(game.get('competition_id')) for game in season_games.values()}
    club_by_id = {str(row.get('club_id')): row for row in source_clubs if row.get('club_id')}
    player_by_id = {str(row.get('player_id')): row for row in source_players if row.get('player_id')}
    games_by_id = season_games

    generated_clubs = []
    for club in source_clubs:
        competition_id = str(club.get('domestic_competition_id') or '')
        if competition_id not in competition_ids:
            continue
        comp = competition_by_id.get(competition_id, {})
        country = comp.get('country_name') or ''
        generated_clubs.append({
            'id': slug(club.get('name')),
            'name': club.get('name') or '',
            'country': country,
            'continent': continent(country),
            'league': comp.get('name') or competition_id,
            'division': None,
            'divisionSource': 'not classified in 2025/26 importer',
            'stadium': club.get('stadium_name') or 'Unknown stadium',
            'capacity': number(club.get('stadium_seats')),
            'primaryKit': None,
            'transferBudgetEUR': 0,
            'transferBudgetSource': 'not available',
            'sourceId': str(club.get('club_id') or ''),
            'dataSource': 'Transfermarkt-derived upstream club catalogue; 2025/26 domestic league fixture present',
        })

    appearances_by_player = {}
    player_club_counts = {}
    for row in season_appearances:
        player_id = str(row.get('player_id') or '')
        club_id = str(row.get('player_club_id') or '')
        if player_id:
            appearances_by_player[player_id] = appearances_by_player.get(player_id, 0) + 1
        if player_id and club_id:
            counts = player_club_counts.setdefault(player_id, {})
            counts[club_id] = counts.get(club_id, 0) + 1
    season_club_by_player = {
        player_id: max(counts, key=counts.get)
        for player_id, counts in player_club_counts.items() if counts
    }

    latest_value = {}
    for valuation in valuations:
        match_date = date_value(valuation.get('date'))
        player_id = str(valuation.get('player_id') or '')
        if match_date and START <= match_date <= END and player_id:
            if player_id not in latest_value or match_date > latest_value[player_id][0]:
                latest_value[player_id] = (match_date, number(valuation.get('market_value_in_eur')))

    target_by_source_id = {str(club['sourceId']): club for club in generated_clubs if club.get('sourceId')}
    target_by_name = {slug(club['name']): club for club in generated_clubs if club.get('name')}
    generated_players = []
    included_source_player_ids = set()

    def make_player(player, player_id, club, appearances_count, roster_only, value=None, value_date=None):
        market_value = number(value if value is not None else player.get('market_value_in_eur'))
        rating = max(45, min(88, round(48 + 7.5 * (math.log10(max(1, market_value)) - 5)))) if market_value else 55
        age = age_at(player.get('date_of_birth'))
        return {
            'id': f'{slug(player.get("name"))}-{player_id}',
            'name': player.get('name') or '',
            'age': age,
            'position': position(player),
            'club': club.get('name') or '',
            'country': player.get('country_of_citizenship') or '',
            'ovr': rating,
            'potential': rating,
            'marketValueEUR': market_value,
            'weeklyWageEUR': 0,
            'wonderkid': bool(age is not None and age <= 21 and rating >= 75),
            'sourceId': player_id,
            'league': club.get('league') or '',
            'appearances2025_26': appearances_count,
            'rosterOnly': roster_only,
            'ratingSource': 'estimated from market value; not an official game rating',
            'potentialSource': 'not available',
            'marketValueDate': value_date.isoformat() if value_date else None,
            'dataSource': 'Transfermarkt-derived upstream current-club catalogue snapshot' if roster_only else 'Transfermarkt-derived upstream 2025/26 league appearances',
        }

    for player_id, count in appearances_by_player.items():
        player = player_by_id.get(player_id)
        club_id = season_club_by_player.get(player_id)
        club = target_by_source_id.get(str(club_id))
        if not player or not club or not player.get('name'):
            continue
        value_date, value = latest_value.get(player_id, (None, None))
        generated_players.append(make_player(player, player_id, club, count, False, value, value_date))
        included_source_player_ids.add(player_id)

    # Include registered catalogue players for covered clubs even when they had
    # no 2025/26 league appearance. Prefer IDs, then exact normalized club name.
    source_club_by_id = {str(row.get('club_id')): row for row in source_clubs if row.get('club_id')}
    for player in source_players:
        player_id = str(player.get('player_id') or '')
        if not player_id or player_id in included_source_player_ids or not player.get('name'):
            continue
        club_id = str(player.get('current_club_id') or player.get('player_club_id') or '')
        club = target_by_source_id.get(club_id)
        if not club:
            source_club = source_club_by_id.get(club_id)
            club_name = player.get('current_club_name') or (source_club or {}).get('name') or ''
            club = target_by_name.get(slug(club_name))
        if club:
            generated_players.append(make_player(player, player_id, club, 0, True))
            included_source_player_ids.add(player_id)

    generated_players.sort(key=lambda row: (row.get('league') or '', row.get('club') or '', row.get('name') or ''))
    generated_clubs.sort(key=lambda row: (row['continent'], row['country'], row['league'], row['name']))
    generated_leagues = []
    for competition_id in sorted(competition_ids):
        comp = competition_by_id.get(competition_id, {})
        if comp.get('name'):
            country = comp.get('country_name') or ''
            generated_leagues.append({
                'name': comp['name'], 'country': country, 'continent': continent(country),
                'competitionId': competition_id, 'division': None, 'divisions': 1,
                'dataSource': 'Transfermarkt-derived upstream 2025/26 domestic league fixtures',
            })

    clubs_with_players = {player['club'] for player in generated_players}
    metadata = {
        'source': 'dcaribou/transfermarkt-datasets (derived from Transfermarkt)',
        'sourceUrl': 'https://github.com/dcaribou/transfermarkt-datasets',
        'season': '2025/26 (2026 season)',
        'seasonWindow': f'{START.isoformat()}..{END.isoformat()}',
        'generatedAt': dt.datetime.now(dt.timezone.utc).isoformat(),
        'clubCount': len(generated_clubs),
        'playerCount': len(generated_players),
        'seasonAppearancePlayerCount': sum(not player['rosterOnly'] for player in generated_players),
        'rosterCataloguePlayerCount': sum(player['rosterOnly'] for player in generated_players),
        'leagueCount': len(generated_leagues),
        'clubsWithPlayersCount': len(clubs_with_players),
        'clubsWithoutPlayers': sorted(club['name'] for club in generated_clubs if club['name'] not in clubs_with_players),
        'coverageNote': 'Source coverage is limited to 2025/26 competitions in the upstream archive; not every country, division, or club worldwide. Roster-only players use a current-club snapshot and are not season appearance records. Ratings are gameplay estimates.',
    }
    OUT.write_text(
        '// Generated by scripts/build_database_2026.py; do not edit by hand.\n'
        + 'export const generatedMetadata = ' + js(metadata) + ';\n'
        + 'export const generatedClubs = ' + js(generated_clubs) + ';\n'
        + 'export const generatedPlayers = ' + js(generated_players) + ';\n'
        + 'export const generatedLeagues = ' + js(generated_leagues) + ';\n',
        encoding='utf-8',
    )
    say(f'Wrote {OUT}: {len(generated_clubs)} clubs, {len(generated_players)} players, {len(generated_leagues)} leagues.')
    say(f'2025/26 appearance players: {metadata["seasonAppearancePlayerCount"]}; catalogue-only players: {metadata["rosterCataloguePlayerCount"]}.')
    say('The source archive must contain 2025/26 matches; the builder never silently falls back to older seasons.')


if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        print(f'Database build failed: {exc}', file=sys.stderr)
        sys.exit(1)
