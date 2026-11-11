# Sweety — Blood Glucose Tracker

Sweety is a personal glucose journal built with React, Node.js, Express and
PostgreSQL for the Kenpath assignment. Record up to four readings a day and review
daily, month-to-date and previous-month reports.

![Sweety desktop dashboard](docs/screenshots/dashboard-desktop.jpg)

## Requirements

- **Docker setup:** Docker Engine/Desktop with Docker Compose v2. No host Node.js
  or PostgreSQL installation is needed.
- **Manual setup:** Node.js 22.12 or newer, npm, and PostgreSQL 17.

## Run the entire app with Docker

After cloning this repository:

```sh
cp .env.example .env
openssl rand -hex 32
```

Replace `JWT_SECRET` in the root `.env` with the generated value. The placeholder
is intentionally rejected by the API. Then start the whole application:

```sh
docker compose up --build -d --wait
```

Open **http://localhost:8080**. Compose starts these services in order:

1. `db`: PostgreSQL 17 with a persistent named volume.
2. `migrate`: applies pending SQL migrations once and exits successfully.
3. `api`: Express with production dependencies, running as the non-root Node user.
4. `web`: Nginx serving the production React build and forwarding `/api` to `api`.

The API starts only after the database is healthy and migrations succeed; the web
service waits for the API health check. Frontend requests use the same origin,
so no browser-visible container hostnames or separate API port are needed.

Add the optional demo account and readings explicitly:

```sh
docker compose exec -e NODE_ENV=development api node server/scripts/seed.js
```

The API container normally runs with `NODE_ENV=production`. The override applies
only to this demo seed command; the running API keeps its production setting.
Seeding is not automatic and does not overwrite existing readings.

Useful commands:

```sh
docker compose ps
docker compose logs -f api web
docker compose logs migrate
docker compose down
```

`down` stops/removes containers while retaining the database volume. Starting the
stack again restores the same readings. Adding `--volumes` would delete that data;
the disposable CI job uses that option only for its own test project.

Docker settings are listed in the root [.env.example](.env.example):

| Variable | Purpose |
| --- | --- |
| `JWT_SECRET` | Required random signing secret, at least 32 characters |
| `JWT_EXPIRES_IN` | Token lifetime, default `1d` |
| `POSTGRES_USER` | Database user, default `sweety` |
| `POSTGRES_PASSWORD` | Local database password, default `sweety` |
| `POSTGRES_DB` | Database name, default `sweety` |
| `WEB_PORT` | Host web port, default `8080` |
| `DB_PORT` | Host PostgreSQL port, default `5432` |
| `APP_TIMEZONE` | Shared API/frontend timezone, default `Asia/Kolkata` |
| `CLIENT_ORIGIN` | Frontend origin, default `http://localhost:8080` |

For a busy port, change `WEB_PORT` or `DB_PORT`; update `CLIENT_ORIGIN` if the web
origin changes. Rebuild after changing `APP_TIMEZONE` because the frontend setting
is compiled into its bundle. Database credentials initialize a new volume; changing
the variables later does not change the credentials already stored in PostgreSQL.
The entrypoint encodes credentials safely when constructing the database URL.

Docker reads root `.env` values through Compose. It does not copy `server/.env`
or `client/.env` into images. JWT/database secrets are runtime settings; the React
build receives only `/api` and the timezone. The Docker database is separate from
the temporary PGlite database used during the earlier local UI testing session.

This Compose configuration binds web and database ports to localhost for local
review. Public deployment still needs the hosting platform's networking and TLS
configuration.

## Manual install and run

```sh
git clone https://github.com/sartha555k/kenpath_assignement_sarthak_patel.git
cd kenpath_assignement_sarthak_patel
npm ci
cp server/.env.example server/.env
```

Generate a secret and replace `JWT_SECRET` in `server/.env` with the output:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Start PostgreSQL with Docker:

```sh
docker compose up -d --wait db
```

Alternatively, use an existing PostgreSQL installation: create a user and database,
then set `DATABASE_URL` in `server/.env` to its connection URL.
The Docker credentials in the example are for local development only.

Apply migrations, add optional demo data, and start the API:

```sh
npm run db:migrate
npm run db:seed
npm run dev
```

The API runs at `http://localhost:4000/api`. `GET /api/health` checks database
connectivity. `npm start` runs without the development file watcher.
Migrations are transactional, tracked in `schema_migrations`, and safe to rerun.

In a **second terminal**, start the React frontend:

```sh
npm run dev:client
```

Open the local URL printed by Vite, normally `http://127.0.0.1:5173`.
Vite proxies `/api` requests to the backend on port 4000. Optional client settings
are in [client/.env.example](client/.env.example); copy it to `client/.env` if
you need a different API URL, proxy target or timezone.

```sh
npm run build        # Production frontend output: client/dist
npm run test:client  # React Testing Library tests
```

For deployment, serve `client/dist` and route `/api` to the Express server, or set
`VITE_API_URL` to the public API base URL before building and configure the server's
`CLIENT_ORIGIN` for the frontend origin. Vite's proxy is development-only.

Demo login: **demo@sweety.example** / **SweetyDemo123!**.
The seed adds readings for the last seven days and three dates in the previous
month. Rerunning it preserves existing accounts and readings. Use it only in a
development database; it is disabled when `NODE_ENV=production`.

## Environment

All application settings are listed in [server/.env.example](server/.env.example).
The server reads `server/.env` regardless of the working directory. Existing
environment variables take precedence. Never commit `server/.env`.

| Variable | Purpose |
| --- | --- |
| `PORT` | HTTP port, default `4000` |
| `DATABASE_URL` | Required PostgreSQL connection URL |
| `JWT_SECRET` | Required random signing secret, at least 32 characters |
| `JWT_EXPIRES_IN` | Token lifetime, default `1d` |
| `CLIENT_ORIGIN` | Allowed frontend origin, default `http://localhost:5173` |
| `APP_TIMEZONE` | Timezone defining today, default `Asia/Kolkata` |
| `NODE_ENV` | `development` locally; `production` disables demo seeding |
| `TEST_DATABASE_URL` | Optional separate database URL for PostgreSQL-backed tests |

Client settings (public at build time): `VITE_API_URL` defaults to `/api`;
`VITE_APP_TIMEZONE` defaults to `Asia/Kolkata` and must match the server timezone.
`API_PROXY_TARGET` is a Vite development-server setting only and defaults to
`http://127.0.0.1:4000`. No secrets belong in `VITE_` variables.

## Frontend

- Light, minimalist cornflower-blue journal with locally served Manrope type and Lucide icons.
- Signup/login, password visibility control, demo login and logout.
- Animated calendar and time-slot popups, four daily slots, add/edit form and inline delete confirmation.
- Daily summaries and month-to-date line chart using actual readings.
- History grouped by date, with complete days kept together across pages, and all three required report periods.
- Inline validation, retryable connection errors, empty states and loading placeholders.
- Session tokens live in `sessionStorage` and are verified on reload. Expired
  sessions return to login. Closing the tab ends the browser session.
- Responsive sidebar on desktop and bottom navigation on mobile; visible keyboard
  focus, labelled controls, screen-reader feedback and reduced-motion support.
- Report/history add and edit actions open an animated dialog without navigating
  away. Closing it returns focus to the original action.
- Saving refreshes reports in the background without replacing the journal with
  loading placeholders. Changing dates never autofocuses the glucose input.
- Signin/signup shows an animated welcome while the journal loads, with rotating
  encouragement. Invalid credentials return to the form with the server error.

The chart plots individual readings in chronological slot order (not continuous
monitoring). It includes the entire selected month through the selected day,
fetching a second page when there are more than 100 readings.
Tap a point (or the nearby chart area) to see the reading's date, slot and value.
Keyboard users can focus the chart and use Left/Right, Home and End to inspect readings.

Initial visual references: the restrained composition and clear hierarchy in
[Oura Ring on Awwwards](https://www.awwwards.com/sites/oura-ring) and the
[Awwwards clean collection](https://www.awwwards.com/websites/clean/).
The requested award MCP was not available; public reference pages were used.
No third-party brand assets were copied.
The initial olive palette was replaced with cornflower blue following user feedback.

### Screenshots

Captured using synthetic demo data; these contain no real patient information.

| Desktop | Mobile |
| --- | --- |
| [Login](docs/screenshots/login-desktop.jpg) | [Login](docs/screenshots/login-mobile.jpg) |
| [Dashboard](docs/screenshots/dashboard-desktop.jpg) | [Dashboard](docs/screenshots/dashboard-mobile.jpg) |
| [Reports](docs/screenshots/reports-desktop.jpg) | [Reports](docs/screenshots/reports-mobile.jpg) |
| [Grouped history](docs/screenshots/history-desktop.jpg) | [Grouped history](docs/screenshots/history-mobile.jpg) |
| [Contextual reading form](docs/screenshots/reading-form-desktop.jpg) | [Contextual reading form](docs/screenshots/reading-form-mobile.jpg) |
| [Calendar](docs/screenshots/calendar-desktop.jpg) | |
| [Welcome animation](docs/screenshots/welcome-desktop.jpg) | |
| [Signup](docs/screenshots/signup-desktop.jpg) | |

## API

Send JSON with `Content-Type: application/json`. Registration and login return
`{ user: { id, name, email }, token }`. Protected endpoints require
`Authorization: Bearer <token>`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Database readiness |
| POST | `/api/auth/register` | Register with `name`, `email`, `password` |
| POST | `/api/auth/login` | Login with `email`, `password` |
| GET | `/api/auth/me` | Current user (protected) |
| POST | `/api/readings` | Create a reading (protected) |
| GET | `/api/readings?page=1&limit=20&date=2024-10-15` | Paginated readings; date filter is optional (protected) |
| GET | `/api/readings/:id` | View one reading (protected) |
| PUT | `/api/readings/:id` | Replace date, slot and value (protected) |
| DELETE | `/api/readings/:id` | Delete; returns `204` (protected) |
| GET | `/api/reports?date=2024-10-15` | All three reports; date defaults to today (protected) |

Reading request example:

```json
{ "date": "2024-10-15", "slot": "after_lunch", "value": 135 }
```

Slots: `morning` (Morning / fasting), `after_breakfast`, `after_lunch`,
`after_dinner`. Values must be JSON integers from 40 to 600. Dates must be valid
calendar dates in `YYYY-MM-DD` format and cannot be in the future.
Pagination defaults to page 1 and limit 20; the maximum limit is 100.
Readings are ordered by date descending and then by slot in daily order.
Optional inclusive `from=YYYY-MM-DD` and `to=YYYY-MM-DD` filters support the
monthly chart. Invalid/future dates or a start date after the end date return 400.
All date filters and pagination remain scoped to the authenticated user.
For grouped history, use `?groupBy=date&page=1&limit=7`. In this mode, `limit`
counts distinct dates and all readings for each selected date are returned.
`pagination.total`/`totalPages` count dates, `totalReadings` counts readings, and
`unit` is `dates`. Without grouping, `unit` is `readings` and pagination retains
its original reading-based behavior.

Example report response:

```json
{
  "date": "2024-10-15",
  "reports": {
    "daily": {
      "startDate": "2024-10-15", "endDate": "2024-10-15",
      "count": 1, "highest": 135, "lowest": 135, "average": 135,
      "readings": [{ "id": 1, "date": "2024-10-15", "slot": "after_lunch", "value": 135 }]
    },
    "monthToDate": {
      "startDate": "2024-10-01", "endDate": "2024-10-15",
      "count": 1, "highest": 135, "lowest": 135, "average": 135
    },
    "monthly": {
      "startDate": "2024-09-01", "endDate": "2024-09-30",
      "count": 0, "highest": null, "lowest": null, "average": null,
      "message": "No readings yet for this period. Add a reading to get started."
    }
  }
}
```

Averages are rounded to one decimal numerically; JSON may omit a trailing zero.
The frontend should format averages with `toFixed(1)`.
The monthly report always covers the entire month **before the selected date's
month**. All report summaries use one database snapshot.

Errors use `{ "error": { "message": "...", "field": "value" } }`.
The optional `field` identifies a form field. Status codes: `400` invalid input,
`401` authentication failure, `404` missing or unowned resource, `409` duplicate
email/slot or full day, and `429` too many authentication attempts.
Never send a user ID: ownership comes from the verified token.

Quick login example:

```sh
curl -X POST http://localhost:4000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"demo@sweety.example","password":"SweetyDemo123!"}'
```

Copy the returned token and use it for subsequent requests:

```sh
curl http://localhost:4000/api/reports \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

## Tests

```sh
npm test
npm run test:client
npm run build
```

By default the API tests run against PGlite, an embedded PostgreSQL engine, so
no external database or application `.env` is required. Tests exercise the
Express HTTP layer, password hashing, JWT authentication, SQL constraints,
ownership, CRUD, validation, pagination, report boundaries and repeatable seeds.

To run the same suite against standalone PostgreSQL, create a dedicated test
database and export its URL:

```sh
TEST_DATABASE_URL=postgresql://sweety:sweety@localhost:5432/sweety_test npm test
```

Tests create a unique schema for each case and drop it afterward. The test user
needs permission to create schemas. Use a dedicated test database.
GitHub Actions runs this suite against PostgreSQL 17 and also exercises migration
reruns, the seed script, frontend tests and the production frontend build.

A separate Docker job builds both images, starts the full Compose stack, checks
frontend assets and API requests through Nginx, reruns migrations, seeds the demo,
and verifies authentication, reading CRUD, validation, ownership and reports.
It then removes/recreates containers **without** deleting the volume and checks
that a saved reading and its authentication token still work. Docker is not
installed on the development machine; container execution is verified in CI.
The smoke checks live in [scripts/docker-smoke.mjs](scripts/docker-smoke.mjs).

Frontend tests cover registration, login errors, required/range/integer validation,
duplicate slots, future dates, server validation feedback and editing a slot
without conflicting with itself. Browser QA also exercised signup/login,
add/edit/delete with live report updates, history pagination and empty reports.
Responsive checks covered widths 320, 390, 768, 1280 and 1440 pixels.
Browser QA used the real Express API backed by disposable PGlite data because no
standalone PostgreSQL server was installed locally; CI uses PostgreSQL 17.
Regression tests also cover focus stability, mounted rows during refresh,
context-preserving report entry, complete-day pagination, date grouping, chart
click/keyboard details, calendar selection and rotating welcome thoughts.

## Git workflow

Each feature branch starts from the current `main`, receives focused commits,
and is merged back with a merge commit to preserve its history:

- `feat/backend-setup`
- `feat/authentication`
- `feat/readings`
- `feat/reports`
- `feat/demo-seed`
- `feat/backend-documentation`
- `feat/frontend-foundation`
- `feat/frontend-authentication`
- `feat/frontend-dashboard`
- `feat/frontend-quality`
- `fix/reading-focus-and-refresh`
- `feat/grouped-history-and-chart-details`
- `feat/smooth-reading-controls`
- `feat/welcome-animation`
- `feat/blue-theme-and-motion-polish`
- `feat/docker-full-stack`

New features use `feat/…`; bug fixes use `fix/…`. Future changes can use pull
requests for review before merging. Initial backend feature branches are merged
locally with their histories preserved.

## Notes and assumptions

- PostgreSQL is used as explicitly required; MongoDB is not needed despite the
  assignment's MERN label.
- Reading dates are calendar dates, not timestamps. `APP_TIMEZONE` defines today
  for every user; individual timezone preferences can be added later.
- A unique `(user_id, date, slot)` constraint and four allowed slots enforce the
  four-readings-per-day limit even for concurrent writes. Duplicate slots get a
  slot-specific error; once a day is full, another insert gets the daily limit error.
- Passwords require at least 8 characters and at most 72 UTF-8 bytes because of
  bcrypt's input limit. Emails are normalized to lowercase.
- Tokens expire after one day by default. Logout will discard the frontend token;
  refresh tokens, server-side revocation and password recovery are future improvements.
- HTTPS and an appropriate production database connection are deployment concerns.
  The Compose stack runs PostgreSQL, migrations, the API and the built frontend
  locally; public deployment needs hosting-specific configuration.
- Frontend calendars use DayPicker with Radix popovers; slot menus and contextual
  dialogs use Radix. Stored/API dates always use `YYYY-MM-DD`. Calendar selection
  converts local calendar components explicitly, avoiding UTC date shifts.
- Report numbers are descriptive; the app does not assign clinical target ranges
  or recommend treatment.
- With more time: patient timezone settings, token rotation, structured logging,
  deployment configuration and broader automated browser coverage.
