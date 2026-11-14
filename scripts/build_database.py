#!/usr/bin/env python3
"""Build a real-name season database from the published Transfermarkt dataset.

Uses only season appearances and valuation records dated within the 2024/25
window. This does not invent players or clubs. Ratings/potential and budgets are
not included in the source; rating fields are explicitly marked as estimates.
"""
from __future__ import annotations
import csv, datetime as dt, gzip, io, json, math, os, sys, tempfile, urllib.request, zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
URL = 'https://pub-e682421888d945d684bcae8890b0ec20.r2.dev/data/transfermarkt-datasets.zip'
OUT = ROOT / 'database.generated.js'
START = dt.date(2024, 7, 1)
END = dt.date(2025, 6, 30)


def say(message): print(message, flush=True)

def table_from_zip(zf, table):
    wanted = {f'{table}.csv', f'{table}.csv.gz'}
    matches = [n for n in zf.namelist() if Path(n).name in wanted]
    if not matches:
        raise RuntimeError(f'Missing {table}.csv(.gz) in source archive')
    raw = zf.read(matches[0])
    if matches[0].endswith('.gz'):
        raw = gzip.decompress(raw)
    return list(csv.DictReader(io.TextIOWrapper(io.BytesIO(raw), encoding='utf-8-sig', newline='')))

def date_value(value):
    try: return dt.date.fromisoformat((value or '')[:10])
    except (ValueError, TypeError): return None

def number(value, default=0):
    try: return int(float(value or 0))
    except (ValueError, TypeError): return default

def slug(value):
    import unicodedata, re
    value = unicodedata.normalize('NFKD', value or '').encode('ascii','ignore').decode().lower()
    return re.sub(r'(^-|-$)','',re.sub(r'[^a-z0-9]+','-',value))

def age_at(dob, when=END):
    birth = date_value(dob)
    return when.year - birth.year - ((when.month, when.day) < (birth.month, birth.day)) if birth else None

def js(value): return json.dumps(value, ensure_ascii=False, separators=(',', ':'))

def position(row):
    pos = (row.get('sub_position') or row.get('position') or 'Unknown').strip()
    aliases = {'Centre-Forward':'ST','Second Striker':'CF','Left Winger':'LW','Right Winger':'RW','Attacking Midfield':'CAM','Central Midfield':'CM','Defensive Midfield':'CDM','Left Midfield':'LM','Right Midfield':'RM','Centre-Back':'CB','Left-Back':'LB','Right-Back':'RB','Goalkeeper':'GK'}
    return aliases.get(pos, pos)

def main():
    cache = Path(tempfile.gettempdir()) / 'touchline-transfermarkt-datasets.zip'
    if not cache.exists() or cache.stat().st_size < 1000:
        say('Downloading public dataset snapshot (large archive; this may take a while)...')
        request = urllib.request.Request(URL, headers={'User-Agent':'TouchlineDatabaseBuilder/1.0'})
        with urllib.request.urlopen(request, timeout=180) as response, cache.open('wb') as out:
            while True:
                chunk=response.read(1024*1024)
                if not chunk: break
                out.write(chunk)
    say(f'Reading source archive: {cache}')
    with zipfile.ZipFile(cache) as zf:
        comps=table_from_zip(zf,'competitions')
        clubs_src=table_from_zip(zf,'clubs')
        players_src=table_from_zip(zf,'players')
        games=table_from_zip(zf,'games')
        appearances=table_from_zip(zf,'appearances')
        valuations=table_from_zip(zf,'player_valuations')

    comp_by_id={str(c.get('competition_id')):c for c in comps}
    # Only domestic league competitions, and only matches inside the selected season window.
    league_comp_ids={cid for cid,c in comp_by_id.items() if 'league' in (c.get('type') or '').lower() and 'cup' not in (c.get('name') or '').lower()}
    games_in_window={str(g.get('game_id')):g for g in games if (d:=date_value(g.get('date'))) and START<=d<=END and str(g.get('competition_id')) in league_comp_ids}
    if not games_in_window:
        raise RuntimeError('No league fixtures found in 2024/25 window; source schema or snapshot may have changed.')
    active_apps=[a for a in appearances if str(a.get('game_id')) in games_in_window]
    comp_ids={str(g.get('competition_id')) for g in games_in_window.values()}
    club_ids=set()
    appearances_by_player={}
    for a in active_apps:
        cid=str(a.get('player_club_id') or '')
        if cid: club_ids.add(cid)
        pid=str(a.get('player_id') or '')
        if pid: appearances_by_player[pid]=appearances_by_player.get(pid,0)+1
    club_by_id={str(c.get('club_id')):c for c in clubs_src}
    player_by_id={str(p.get('player_id')):p for p in players_src}
    # Keep one historical league assignment per player based on their most frequent season club.
    player_club_counts={}
    for a in active_apps:
        pid=str(a.get('player_id') or ''); cid=str(a.get('player_club_id') or '')
        if pid and cid: player_club_counts.setdefault(pid,{}); player_club_counts[pid][cid]=player_club_counts[pid].get(cid,0)+1
    player_club={pid:max(counts,key=counts.get) for pid,counts in player_club_counts.items() if counts}
    latest_value={}
    for v in valuations:
        d=date_value(v.get('date'));pid=str(v.get('player_id') or '')
        if d and START<=d<=END and pid and (pid not in latest_value or d>latest_value[pid][0]):
            latest_value[pid]=(d,number(v.get('market_value_in_eur')))

    generated_clubs=[]
    for cid in sorted(club_ids):
        src=club_by_id.get(cid)
        if not src: continue
        comp_id=str(src.get('domestic_competition_id') or '')
        # A club only belongs in this export if it appeared in a selected league competition.
        if comp_id not in comp_ids: continue
        comp=comp_by_id.get(comp_id,{})
        country=comp.get('country_name') or ''
        cap=number(src.get('stadium_seats'),0)
        generated_clubs.append({'id':slug(src.get('name')),'name':src.get('name') or '', 'country':country,
          'league':comp.get('name') or comp_id,'stadium':src.get('stadium_name') or 'Unknown stadium',
          'capacity':cap,'primaryKit':None,'transferBudgetEUR':0,'transferBudgetSource':'not available',
          'sourceId':cid,'dataSource':'Transfermarkt dataset; 2024/25 appearance; club metadata snapshot'})
    club_name_by_id={str(c.get('club_id')):c.get('name') or '' for c in clubs_src}
    generated_players=[]
    for pid,appearance_count in appearances_by_player.items():
        p=player_by_id.get(pid);cid=player_club.get(pid);club_name=club_name_by_id.get(cid or '')
        if not p or not club_name: continue
        comp=comp_by_id.get(str((club_by_id.get(cid) or {}).get('domestic_competition_id') or ''),{})
        value=latest_value.get(pid,(None,number(p.get('market_value_in_eur'))))[1]
        age=age_at(p.get('date_of_birth'))
        # Ratings are a transparent value-based gameplay estimate, never an EA FC rating.
        estimate=max(45,min(88,round(48+7.5*(math.log10(max(1,value))-5)))) if value>0 else 55
        generated_players.append({'id':slug(p.get('name')),'name':p.get('name') or '', 'age':age,
          'position':position(p),'club':club_name,'country':p.get('country_of_citizenship') or '',
          'ovr':estimate,'potential':estimate,'marketValueEUR':value,'weeklyWageEUR':0,
          'wonderkid':bool(age is not None and age<=21 and estimate>=75), 'sourceId':pid,
          'league':comp.get('name') or '', 'appearances2024_25':appearance_count,
          'ratingSource':'estimated from market value; not EA FC','potentialSource':'not available',
          'marketValueDate':latest_value.get(pid,(None,None))[0].isoformat() if latest_value.get(pid,(None,None))[0] else None,
          'dataSource':'Transfermarkt dataset; 2024/25 league appearances'})
    generated_leagues=[]
    for cid in sorted(comp_ids):
        c=comp_by_id.get(cid,{})
        if c and c.get('name'):
            generated_leagues.append({'name':c['name'],'country':c.get('country_name') or '', 'competitionId':cid,'divisions':1,'dataSource':'2024/25 competition appearances'})
    generated_players.sort(key=lambda p:(p.get('league') or '',p.get('club') or '',p.get('name') or ''))
    generated_clubs.sort(key=lambda c:(c['country'],c['league'],c['name']))
    meta={'source':'dcaribou/transfermarkt-datasets (derived from Transfermarkt)', 'sourceUrl':'https://github.com/dcaribou/transfermarkt-datasets', 'sourceLicense':'See upstream repository LICENSE and review underlying-source terms before redistribution/commercial use', 'seasonWindow':f'{START.isoformat()}..{END.isoformat()}', 'generatedAt':dt.datetime.now(dt.timezone.utc).isoformat(), 'clubCount':len(generated_clubs),'playerCount':len(generated_players),'ratingNote':'OVR is a game estimate based on market value; not EA SPORTS FC data. Potential and wages are not supplied by this dataset.'}
    OUT.write_text('// Generated by scripts/build_database.py; do not edit by hand.\nexport const generatedMetadata = '+js(meta)+';\nexport const generatedClubs = '+js(generated_clubs)+';\nexport const generatedPlayers = '+js(generated_players)+';\nexport const generatedLeagues = '+js(generated_leagues)+';\n',encoding='utf-8')
    say(f'Wrote {OUT}: {len(generated_clubs)} real clubs, {len(generated_players)} real players, {len(generated_leagues)} competitions.')
    say('Coverage reflects the upstream dataset only; unsupported countries/divisions are not fabricated.')

if __name__=='__main__':
    try: main()
    except Exception as exc:
        print(f'Database build failed: {exc}',file=sys.stderr);sys.exit(1)
