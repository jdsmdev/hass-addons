# Portfolio Builder

This add-on runs the Portfolio Builder frontend, API, SQLite database, and optional earnings pipeline on Home Assistant.

## Before installation

The container image must exist at `ghcr.io/jdsmdev/portfolio-builder-addon` with a tag matching the add-on version. The package must be publicly readable so Home Assistant can pull it.

## First start

1. Install the add-on.
2. Leave **Earnings pipeline enabled** and **eToro demo trading enabled** off.
3. Set an invite code if this is a fresh database and an administrator account must be registered.
4. Start the add-on and open its web interface.
5. Register or sign in, then verify assets, portfolios, and earnings pages.

The add-on generates and retains its JWT signing secret in persistent storage. Its SQLite database is stored at `/data/portfolio-builder.db` and survives upgrades.

## Existing database migration

Do not run GitHub Actions and this add-on as simultaneous writers.

1. Keep **Earnings pipeline enabled**, **eToro demo trading enabled**, and **Import database on start** off in the add-on.
2. Stop any local backend or GitHub workflow that can write the source database.
3. From the source repository, run `npm run addon:export-db`. This creates a consistent snapshot at `~/Downloads/portfolio-builder-import.db` without modifying the source database.
4. Copy that file into Home Assistant's `share` folder with Samba, Studio Code Server, SSH, or another trusted file-transfer method. Its final Home Assistant path must be `/share/portfolio-builder-import.db`.
5. Stop the Portfolio Builder add-on if it is running.
6. Enable **Import database on start**, then start the add-on.
7. Confirm the log says that the database was imported and that the application is listening. The importer validates SQLite integrity first and preserves any previous add-on database as `/data/portfolio-builder.pre-import.db`.
8. Disable **Import database on start** and restart the add-on. A checksum marker prevents the same snapshot from being imported twice, but the option should not remain enabled.
9. Sign in with the account from the imported database and verify assets, portfolios, strategies, earnings records, and paper trades. Existing login sessions do not transfer, because the add-on has its own JWT signing secret.
10. Delete `/share/portfolio-builder-import.db` after validation because it contains private application data, then create and download a Home Assistant backup.

Do not replace the import file with a newer snapshot while **Import database on start** remains enabled: a new checksum intentionally triggers a new import and overwrites changes made in the add-on since the previous import.

## Earnings configuration

A Gemini key is needed when the configured provider is Gemini. eToro credentials are needed only for eToro demo execution.

A Finnhub API key is optional. When configured, it supplies company news to the earnings agent and additional stock fundamentals during enrichment. Without it, Finnhub-backed data is skipped and the application continues with its other data sources.

StockAnalysis.com scraping is disabled by default. Enable it only when you want enrichment to fill data that the market-data APIs did not provide.

Keep eToro demo execution disabled until local scheduling, persistence, reconciliation, and backups have been observed successfully over multiple sessions.

The initial add-on release retains the application's current interval scheduler. It is not yet the minute-aligned durable scheduler required for narrow broker entry windows, so broker execution must remain disabled during this implementation phase.

## Backups

The add-on requests cold backups so SQLite is not being written while its persistent data is captured. Keep at least one recent Home Assistant backup outside the Green.
