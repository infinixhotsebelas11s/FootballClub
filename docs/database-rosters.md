# Club and player database refresh

Run a full refresh from the repository root with:

```bash
npm run database:build
npm run build
```

`database:build` runs `scripts/build_database.py` and then `scripts/complete_rosters.py`. The first step rebuilds club, league, and player records from the upstream 2024/25 dataset. The second augments generated season player records with registered players from that dataset's current-club catalogue and tries to match both generated clubs and clubs curated by the app (including historic FIFA Club World Cup participants and English EFL clubs).

## What the data means

- This is not a complete worldwide club census. Results are limited to competitions and clubs available in the upstream snapshot and the repository's curated lists.
- Season appearance records refer to 2024/25 league appearances. Roster-only additions use the catalogue's current-club snapshot and are not proof that a player belonged to that club during 2024/25.
- Names are not synthesized to fill a squad. Clubs without source matches remain without added players and are recorded in `generatedMetadata.rosterCatalogueClubsWithoutPlayers`.
- Ratings are gameplay estimates derived from market value, not official game ratings. Missing player attributes should not be treated as official data.
- App-level coverage is exposed in `database.js` as `clubRosterCoverage`, `clubsWithoutPlayers`, and fields on `dataStatus`.

The deploy workflow runs `npm run database:build` before bundling the app, so the deployed build refreshes the generated dataset. To refresh and commit generated data locally, run the commands above and review `database.generated.js` before committing.
