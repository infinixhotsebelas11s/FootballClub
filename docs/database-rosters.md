# Club and player database refresh

## Refresh from GitHub Actions

1. Open the repository on GitHub and select **Actions**.
2. Select **Refresh club and player database** in the workflow list.
3. Click **Run workflow**, choose branch `refresh-complete-club-rosters` (or the branch you want to validate), then confirm **Run workflow**.
4. Open the run and wait for the **Refresh club and player data** and **Verify app build** steps to finish successfully.
5. Download the `refreshed-football-database` artifact from the run's **Artifacts** section. It contains the generated `database.generated.js`.
6. To use the result in the repository, replace `database.generated.js` on your branch with the artifact and commit it. The workflow validates and exports the generated file; it deliberately does not push commits or deploy GitHub Pages.

## Refresh locally

From the repository root, run:

```bash
npm install
npm run database:build
npm run build
```

Review `database.generated.js` before committing. The Pages deploy workflow also runs `npm run database:build` before bundling the app.

## What the data means

- This is not a complete worldwide club census. Results are limited to competitions and clubs available in the upstream snapshot and the repository's curated lists.
- Season appearance records refer to 2024/25 league appearances. Roster-only additions use the catalogue's current-club snapshot and are not proof that a player belonged to that club during 2024/25.
- Names are not synthesized to fill a squad. Clubs without source matches remain without added players and are recorded in `generatedMetadata.rosterCatalogueClubsWithoutPlayers`.
- Ratings are gameplay estimates derived from market value, not official game ratings. Missing player attributes should not be treated as official data.
- The in-app **Data permainan** screen renders fields from `dataStatus`, including the generated date, source window, club/player totals, matched roster-club totals, and clubs without matched players. Full app-level coverage is exported as `clubRosterCoverage` and `clubsWithoutPlayers` from `database.js`.
