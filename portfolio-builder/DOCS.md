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

1. Disable eToro execution in GitHub Actions.
2. Stop the GitHub earnings schedule.
3. Back up the existing SQLite database.
4. Stop this add-on.
5. Restore the database as `/data/portfolio-builder.db` using a controlled Home Assistant backup or add-on data import.
6. Start this add-on with both scheduling and eToro execution disabled.
7. Validate the data before enabling scheduling.

## Earnings configuration

A Gemini key is needed when the configured provider is Gemini. eToro credentials are needed only for eToro demo execution.

Keep eToro demo execution disabled until local scheduling, persistence, reconciliation, and backups have been observed successfully over multiple sessions.

The initial add-on release retains the application's current interval scheduler. It is not yet the minute-aligned durable scheduler required for narrow broker entry windows, so broker execution must remain disabled during this implementation phase.

## Backups

The add-on requests cold backups so SQLite is not being written while its persistent data is captured. Keep at least one recent Home Assistant backup outside the Green.
