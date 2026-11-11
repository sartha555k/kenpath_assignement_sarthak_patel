# Sweety — Blood Glucose Tracker

A personal glucose journal built with React, Node.js, Express and PostgreSQL.
Record up to four readings a day and review daily, month-to-date and previous-month reports.

**[Open the live app](https://sweety-ecru.vercel.app/)** · **[API health](https://sweety-api-ylwl.onrender.com/api/health)**

**Demo login:** `demo@sweety.example` / `SweetyDemo123!`

## Features

- Register and log in with bcrypt-hashed passwords and JWT authentication. Users can access only their own readings.
- Add, edit and delete readings in four slots: Morning (fasting), After breakfast, After lunch and After dinner.
- Validate whole-number glucose values from **40–600 mg/dl**, prevent future dates and duplicate slots, and allow at most four readings per day.
- View history grouped by date, with pagination that keeps each day's readings together.
- Review report summaries and an interactive monthly chart with reading details.
- Use the responsive desktop and mobile layouts, with keyboard-accessible controls, empty states and loading feedback.

| Report | Period |
| --- | --- |
| Daily | Selected date, including each reading and its slot |
| Month-to-date | First day of the selected month through the selected date |
| Monthly | Entire month before the selected date's month |

Each report includes the highest, lowest, average (one decimal place) and number of readings.

## Screenshots

Screenshots use synthetic demo data. Click an image to view it at full size.

**Dashboard — daily readings, quick entry and monthly trend**

[![Desktop dashboard with daily readings and a monthly glucose chart](docs/screenshots/dashboard-desktop.jpg)](docs/screenshots/dashboard-desktop.jpg)

| Reports | History grouped by date |
| --- | --- |
| [![Daily, month-to-date and previous-month report summaries](docs/screenshots/reports-desktop.jpg)](docs/screenshots/reports-desktop.jpg) | [![Reading history separated into dated groups](docs/screenshots/history-desktop.jpg)](docs/screenshots/history-desktop.jpg) |

**Mobile — sign in and record a reading**

<p>
  <a href="docs/screenshots/login-mobile.jpg"><img src="docs/screenshots/login-mobile.jpg" alt="Mobile login with demo access" width="230"></a>
  <a href="docs/screenshots/reading-form-mobile.jpg"><img src="docs/screenshots/reading-form-mobile.jpg" alt="Mobile reading form with date, time slot and glucose value" width="230"></a>
</p>

[View all screenshots](docs/screenshots/README.md), including the mobile dashboard, history, calendar and signup screen.

## Run locally

### Option 1: Docker

Requires Docker Engine/Desktop with Docker Compose v2.

```sh
git clone https://github.com/sartha555k/kenpath_assignement_sarthak_patel.git
cd kenpath_assignement_sarthak_patel
cp .env.example .env
openssl rand -hex 32
```

Set `JWT_SECRET` in the root `.env` to the generated value, then run:

```sh
docker compose up --build -d --wait
# Optional: create the demo account and sample readings.
docker compose run --rm --no-deps -e NODE_ENV=development api node server/scripts/seed.js
```

Open **http://localhost:8080**. Compose starts PostgreSQL, applies migrations,
starts the API and serves the frontend through Nginx.

```sh
docker compose logs -f api web   # View logs.
docker compose down              # Stop; database volume is retained.
```

Port and database settings are listed in [.env.example](.env.example).
`docker compose down --volumes` deletes the local database.

### Option 2: Node.js and PostgreSQL

Requires **Node.js 22.12+**, npm and **PostgreSQL 17** (local or hosted on Neon).
Clone the repository as above, then:

```sh
npm ci
cp server/.env.example server/.env
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

In `server/.env`, set:

- `DATABASE_URL` to a PostgreSQL connection URL. With the default Docker database:
  `postgresql://sweety:sweety@localhost:5432/sweety`.
- `JWT_SECRET` to the generated secret.
- `CLIENT_ORIGIN` to `http://127.0.0.1:5173` for the local frontend.

For a local database, create the PostgreSQL user/database yourself or start only
PostgreSQL with `docker compose up -d --wait db`. The Docker database credentials
come from the root `.env` or the defaults in Compose.

```sh
npm run db:migrate
npm run db:seed       # Optional demo account and sample readings.
npm run dev          # API: http://localhost:4000/api
```

In a second terminal:

```sh
npm run dev:client   # Frontend: http://127.0.0.1:5173
```

The frontend proxies `/api` to the local backend by default. If an existing
`client/.env` points to the hosted API, set `VITE_API_URL=/api` and restart Vite
to use your local database instead.

`npm start` runs the API without a watcher. `npm run build` produces `client/dist`.

## Environment variables

| File | Purpose |
| --- | --- |
| [.env.example](.env.example) | Docker ports, database credentials, JWT secret and timezone |
| [server/.env.example](server/.env.example) | API port, database URLs, JWT settings, allowed frontend origin, timezone and proxy settings |
| [client/.env.example](client/.env.example) | Public API URL, timezone and local proxy target |

Copy the relevant examples to `.env` files. Real `.env` files are ignored by Git.
Database credentials and JWT secrets belong only on the server; `VITE_` values
are public in the frontend bundle.

## Demo data

`npm run db:seed` creates the demo login above, readings for the last seven days
and three dates in the previous month. Rerunning it preserves existing accounts
and reading values. Seeds are disabled with `NODE_ENV=production`.

To seed an inclusive date range with all four daily slots:

```sh
npm run db:seed:range -- --from 2026-11-12 --to 2026-12-01 --allow-future
```

This optional fixture contains 80 slots across 20 days. Future fixtures require
`--allow-future`; normal API validation and report date selectors still reject
future dates. The script preserves existing slots and reports inserted/preserved counts.

## Tests

```sh
npm test              # Backend integration tests.
npm run test:client   # React Testing Library tests.
npm run build         # Production frontend build.
```

Backend tests use embedded PGlite by default, so no running database or application
`.env` is required. They cover authentication, ownership, CRUD, validation,
concurrent duplicate writes, pagination, report boundaries, repeatable seeds and
proxy-aware rate limiting. Frontend tests cover forms, error feedback, date
selection, editing, history, chart interactions and loading behavior.

To test against PostgreSQL instead, create a dedicated test database:

```sh
TEST_DATABASE_URL=postgresql://sweety:sweety@localhost:5432/sweety_test npm test
```

Tests create and remove isolated schemas; the database user needs permission to
create schemas. GitHub Actions also checks PostgreSQL migrations, frontend tests,
the production build and Docker startup, API behavior and data persistence.

## API

Send JSON requests. Register/login returns `{ user, token }`; protected endpoints
require `Authorization: Bearer <token>`. Ownership comes from the token.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Database readiness |
| POST | `/api/auth/register` | Register with name, email and password |
| POST | `/api/auth/login` | Log in with email and password |
| GET | `/api/auth/me` | Current user |
| GET | `/api/readings` | List readings |
| POST | `/api/readings` | Add a reading |
| GET / PUT / DELETE | `/api/readings/:id` | View, replace or delete a reading |
| GET | `/api/reports?date=2026-11-12` | Daily, month-to-date and previous-month reports |

Example reading body:

```json
{ "date": "2026-11-12", "slot": "after_lunch", "value": 135 }
```

Slots: `morning`, `after_breakfast`, `after_lunch`, `after_dinner`.
Dates use `YYYY-MM-DD`; values must be JSON integers from 40 to 600.

Reading filters: `date`, inclusive `from`/`to`, and `page`/`limit` (default 20,
maximum 100). Add `groupBy=date` to paginate complete days instead of individual
readings. Reports default to today when no date is supplied.

Errors use `{ "error": { "message": "...", "field": "value" } }`, with an
optional field. Status codes include `400` validation, `401` authentication,
`404` missing/unowned record, `409` duplicate/full day and `429` rate limiting.

## Deployment

The live frontend runs on **Vercel**, the API on **Render**, and PostgreSQL on **Neon**.

- **Neon:** set the direct URL as `DATABASE_URL` and the pooled URL as
  `DATABASE_URL_POOLED` on Render, with TLS enabled. Migrations/seeds use the direct
  URL; the API prefers the pooled URL. Changing URLs does not migrate local data.
- **Render:** create a Blueprint from [render.yaml](render.yaml) on `main`. Supply
  both database URLs and `CLIENT_ORIGIN=https://sweety-ecru.vercel.app`.
  The Blueprint generates a JWT secret, applies migrations before startup and
  checks `/api/health`. Production deployments do not run seeds.
- **Vercel:** import this repository with root `./`, framework **Vite**, install
  command `npm ci`, build command `npm run build`, output `client/dist`, and Node
  **22.x**. Set `VITE_API_URL=https://sweety-api-ylwl.onrender.com/api` and
  `VITE_APP_TIMEZONE=Asia/Kolkata` before building.

If the frontend URL changes, update Render's `CLIENT_ORIGIN` to that exact origin
without a trailing slash. The initial request to a sleeping free Render service
can take longer.

## Notes and assumptions

- PostgreSQL follows the assignment's explicit requirement; MongoDB is not used.
- Dates are calendar dates in a shared `Asia/Kolkata` timezone. The monthly report
  covers the month before the selected date's month.
- A unique `(user_id, date, slot)` constraint and four allowed slots enforce the
  daily limit, including concurrent writes.
- Passwords require at least 8 characters and at most 72 UTF-8 bytes for bcrypt.
  JWTs expire after one day by default; the frontend keeps them in `sessionStorage`.
- The chart shows recorded readings, not continuous glucose monitoring. Report
  values are descriptive and do not provide treatment recommendations.
- Features use `feat/…` branches and fixes use `fix/…`, merged into `main` with
  merge commits to retain history.
- With more time: password recovery, refresh-token rotation, individual timezone
  preferences, structured logging and broader automated browser coverage.
