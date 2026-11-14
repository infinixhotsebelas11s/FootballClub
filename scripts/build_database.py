#!/usr/bin/env python3
"""Build the broadest real 2024/25 club/player database available upstream.

Exports clubs from domestic leagues represented in the source snapshot's
2024/25 fixtures and assigns a tier only from source metadata, a recognizable
competition name, or a numeric domestic competition code. It does not invent
clubs or claim complete worldwide coverage. At most four tiers per country are
included in the browser game's selectable database.
"""
from __future__ import annotations
import csv, datetime as dt, gzip, io, json, math, re, sys, tempfile, urllib.request, zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
URL = 'https://pub-e682421888d945d684bcae8890b0ec20.r2.dev/data/transfermarkt-datasets.zip'
OUT = ROOT / 'database.generated.js'
START = dt.date(2024, 7, 1)
END = dt.date(2025, 6, 30)


def say(message):
    print(message, flush=True)


def table_from_zip(zf, table):
    wanted = {f'{table}.csv', f'{table}.csv.gz'}
    matches = [name for name in zf.namelist() if Path(name).name in wanted]
    if not matches:
        raise RuntimeError(f'Missing {table}.csv(.gz) in source archive')
    raw = zf.read(matches[0])
    if matches[0].endswith('.gz'):
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
    value = unicodedata.normalize('NFKD', value or '').encode('ascii', 'ignore').decode().lower()
    return re.sub(r'(^-|-$)', '', re.sub(r'[^a-z0-9]+', '-', value))


def age_at(dob, when=END):
    birth = date_value(dob)
    return when.year - birth.year - ((when.month, when.day) < (birth.month, birth.day)) if birth else None


def js(value):
    return json.dumps(value, ensure_ascii=False, separators=(',', ':'))


def position(row):
    pos = (row.get('sub_position') or row.get('position') or 'Unknown').strip()
    aliases = {
        'Centre-Forward': 'ST', 'Second Striker': 'CF', 'Left Winger': 'LW',
        'Right Winger': 'RW', 'Attacking Midfield': 'CAM', 'Central Midfield': 'CM',
        'Defensive Midfield': 'CDM', 'Left Midfield': 'LM', 'Right Midfield': 'RM',
        'Centre-Back': 'CB', 'Left-Back': 'LB', 'Right-Back': 'RB', 'Goalkeeper': 'GK',
    }
    return aliases.get(pos, pos)


def competition_tier(comp):
    """Return 1..4 and provenance; None means don't guess the division."""
    for key in ('division_level', 'division', 'league_level', 'level', 'tier', 'competition_level'):
        raw = str(comp.get(key) or '').strip()
        match = re.fullmatch(r'(?:division|tier|level)?\s*([1-4])', raw, re.I)
        if match:
            return int(match.group(1)), f'source field: {key}'

    name = str(comp.get('name') or '')
    checks = [
        (4, r'\b(league two|league 2|fourth division|division 4|4th tier|serie d|iv liga)\b'),
        (3, r'\b(league one|league 1|third division|division 3|3rd tier|serie c|iii liga|3\. liga|ligue 3|j3 league)\b'),
        (2, r'\b(championship|second division|division 2|2nd tier|serie b|ii liga|2\. bundesliga|ligue 2|segunda división|segunda division|j2 league)\b'),
        (1, r'\b(premier league|first division|division 1|1st tier|serie a|bundesliga|ligue 1|j1 league)\b'),
    ]
    for tier, pattern in checks:
        if re.search(pattern, name, re.I):
            return tier, 'recognized competition name'

    # Transfermarkt domestic league codes commonly end in their tier number
    # (for example, GB1/GB2); only use this for domestic league competitions.
    code = str(comp.get('competition_id') or '').strip()
    match = re.fullmatch(r'[A-Za-z]{2,5}([1-4])', code)
    if match:
        return int(match.group(1)), 'numeric domestic competition code'
    return None, 'tier unavailable in source'


def continent(country):
    regions = {
        'Asia': {'China','Japan','South Korea','Saudi Arabia','United Arab Emirates','Qatar','Indonesia','Thailand','Vietnam','Cambodia','Malaysia','Singapore','Philippines','India','Iran','Iraq','Jordan','Lebanon','Oman','Uzbekistan','Kazakhstan'},
        'Africa': {'South Africa','Nigeria','Ivory Coast','Morocco','Egypt','Tunisia','DR Congo','Algeria','Angola','Cameroon','Ghana','Kenya','Senegal','Tanzania','Zambia'},
        'Europe': {'England','Spain','Italy','Germany','France','Netherlands','Portugal','Turkey','Russia','Belgium','Ireland','Scotland','Austria','Denmark','Norway','Sweden','Switzerland','Croatia','Greece','Poland','Serbia','Ukraine','Wales','Czech Republic'},
        'North America': {'United States','Mexico','Canada','Costa Rica','Honduras','Jamaica','Panama','Guatemala'},
        'South America': {'Brazil','Argentina','Colombia','Chile','Ecuador','Paraguay','Peru','Uruguay','Venezuela'},
        'Oceania': {'Australia','New Zealand','New Caledonia','French Polynesia','Fiji','Papua New Guinea'},
    }
    for region, countries in regions.items():
        if country in countries:
            return region
    return 'Unknown'


def main():
    cache = Path(tempfile.gettempdir()) / 'touchline-transfermarkt-datasets.zip'
    if not cache.exists() or cache.stat().st_size < 1000:
        say('Downloading public dataset snapshot (large archive; this may take a while)...')
        request = urllib.request.Request(URL, headers={'User-Agent': 'FootballClubDatabaseBuilder/1.0'})
        with urllib.request.urlopen(request, timeout=180) as response, cache.open('wb') as out:
            while True:
                chunk = response.read(1024 * 1024)
                if not chunk:
                    break
                out.write(chunk)
    say(f'Reading source archive: {cache}')
    with zipfile.ZipFile(cache) as zf:
        comps = table_from_zip(zf, 'competitions')
        clubs_src = table_from_zip(zf, 'clubs')
        players_src = table_from_zip(zf, 'players')
        games = table_from_zip(zf, 'games')
        appearances = table_from_zip(zf, 'appearances')
        valuations = table_from_zip(zf, 'player_valuations')

    comp_by_id = {str(c.get('competition_id')): c for c in comps}
    league_comp_ids = {
        cid for cid, comp in comp_by_id.items()
        if 'league' in (comp.get('type') or '').lower()
        and 'cup' not in (comp.get('name') or '').lower()
    }
    games_in_window = {
        str(game.get('game_id')): game
        for game in games
        if (date := date_value(game.get('date')))
        and START <= date <= END
        and str(game.get('competition_id')) in league_comp_ids
    }
    if not games_in_window:
        raise RuntimeError('No league fixtures found in 2024/25 window; source schema or snapshot may have changed.')

    active_apps = [app for app in appearances if str(app.get('game_id')) in games_in_window]
    comp_ids = {str(game.get('competition_id')) for game in games_in_window.values()}
    comp_tiers = {cid: competition_tier(comp_by_id.get(cid, {})) for cid in comp_ids}
    club_by_id = {str(club.get('club_id')): club for club in clubs_src}
    player_by_id = {str(player.get('player_id')): player for player in players_src}

    # Include every listed club in each covered competition, with explicit tier metadata.
    generated_clubs = []
    for club in clubs_src:
        comp_id = str(club.get('domestic_competition_id') or '')
        if comp_id not in comp_ids:
            continue
        comp = comp_by_id.get(comp_id, {})
        country = comp.get('country_name') or ''
        tier, tier_source = comp_tiers.get(comp_id, (None, 'tier unavailable in source'))
        if tier is not None and tier > 4:
            continue
        generated_clubs.append({
            'id': slug(club.get('name')), 'name': club.get('name') or '',
            'country': country, 'continent': continent(country),
            'league': comp.get('name') or comp_id,
            'division': tier, 'divisionSource': tier_source,
            'stadium': club.get('stadium_name') or 'Unknown stadium',
            'capacity': number(club.get('stadium_seats'), 0), 'primaryKit': None,
            'transferBudgetEUR': 0, 'transferBudgetSource': 'not available',
            'sourceId': str(club.get('club_id') or ''),
            'dataSource': 'Upstream club catalogue; domestic league represented in 2024/25 fixtures',
        })

    player_club_counts = {}
    appearances_by_player = {}
    for app in active_apps:
        player_id = str(app.get('player_id') or '')
        club_id = str(app.get('player_club_id') or '')
        if player_id:
            appearances_by_player[player_id] = appearances_by_player.get(player_id, 0) + 1
        if player_id and club_id:
            counts = player_club_counts.setdefault(player_id, {})
            counts[club_id] = counts.get(club_id, 0) + 1
    player_club = {player_id: max(counts, key=counts.get) for player_id, counts in player_club_counts.items() if counts}

    latest_value = {}
    for valuation in valuations:
        date = date_value(valuation.get('date'))
        player_id = str(valuation.get('player_id') or '')
        if date and START <= date <= END and player_id and (player_id not in latest_value or date > latest_value[player_id][0]):
            latest_value[player_id] = (date, number(valuation.get('market_value_in_eur')))

    generated_players = []
    for player_id, appearance_count in appearances_by_player.items():
        player = player_by_id.get(player_id)
        club_id = player_club.get(player_id)
        club_name = (club_by_id.get(club_id or '') or {}).get('name') or ''
        if not player or not club_name:
            continue
        comp_id = str((club_by_id.get(club_id) or {}).get('domestic_competition_id') or '')
        comp = comp_by_id.get(comp_id, {})
        value = latest_value.get(player_id, (None, number(player.get('market_value_in_eur'))))[1]
        age = age_at(player.get('date_of_birth'))
        estimate = max(45, min(88, round(48 + 7.5 * (math.log10(max(1, value)) - 5)))) if value > 0 else 55
        valuation_date = latest_value.get(player_id, (None, None))[0]
        generated_players.append({
            'id': slug(player.get('name')), 'name': player.get('name') or '', 'age': age,
            'position': position(player), 'club': club_name,
            'country': player.get('country_of_citizenship') or '',
            'ovr': estimate, 'potential': estimate, 'marketValueEUR': value, 'weeklyWageEUR': 0,
            'wonderkid': bool(age is not None and age <= 21 and estimate >= 75),
            'sourceId': player_id, 'league': comp.get('name') or '',
            'appearances2024_25': appearance_count,
            'ratingSource': 'estimated from market value; not an official game rating',
            'potentialSource': 'not available',
            'marketValueDate': valuation_date.isoformat() if valuation_date else None,
            'dataSource': 'Upstream season dataset; 2024/25 league appearances',
        })

    generated_leagues = []
    for comp_id in sorted(comp_ids):
        comp = comp_by_id.get(comp_id, {})
        if not comp or not comp.get('name'):
            continue
        tier, tier_source = comp_tiers.get(comp_id, (None, 'tier unavailable in source'))
        if tier is not None and tier > 4:
            continue
        country = comp.get('country_name') or ''
        generated_leagues.append({
            'name': comp['name'], 'country': country, 'continent': continent(country),
            'competitionId': comp_id, 'division': tier, 'divisions': tier or 1,
            'divisionSource': tier_source,
            'dataSource': '2024/25 domestic league fixtures in source dataset',
        })

    generated_players.sort(key=lambda p: (p.get('league') or '', p.get('club') or '', p.get('name') or ''))
    generated_clubs.sort(key=lambda c: (c['continent'], c['country'], c['division'] or 99, c['league'], c['name']))
    coverage = {}
    for item in generated_clubs:
        key = item['country']
        coverage.setdefault(key, set())
        if item['division'] is not None:
            coverage[key].add(item['division'])
    metadata = {
        'source': 'dcaribou/transfermarkt-datasets (derived from Transfermarkt)',
        'sourceUrl': 'https://github.com/dcaribou/transfermarkt-datasets',
        'seasonWindow': f'{START.isoformat()}..{END.isoformat()}',
        'generatedAt': dt.datetime.now(dt.timezone.utc).isoformat(),
        'clubCount': len(generated_clubs), 'playerCount': len(generated_players),
        'leagueCount': len(generated_leagues), 'maximumSelectableDivision': 4,
        'tierCoverageByCountry': {country: sorted(tiers) for country, tiers in sorted(coverage.items())},
        'coverageNote': 'Source coverage only, limited to included 2024/25 competitions; not every country, division, or club worldwide. Unknown division tiers remain unclassified.',
    }
    OUT.write_text(
        '// Generated by scripts/build_database.py; do not edit by hand.\n'
        + 'export const generatedMetadata = ' + js(metadata) + ';\n'
        + 'export const generatedClubs = ' + js(generated_clubs) + ';\n'
        + 'export const generatedPlayers = ' + js(generated_players) + ';\n'
        + 'export const generatedLeagues = ' + js(generated_leagues) + ';\n',
        encoding='utf-8',
    )
    say(f'Wrote {OUT}: {len(generated_clubs)} clubs, {len(generated_players)} players, {len(generated_leagues)} leagues.')
    say('Tier labels use source metadata/name/code where available. Coverage is not a complete worldwide census.')


if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        print(f'Database build failed: {exc}', file=sys.stderr)
        sys.exit(1)
