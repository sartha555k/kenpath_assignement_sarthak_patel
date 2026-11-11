# Sweety — Blood Glucose Tracker

Backend for the Kenpath assignment. Built with Node.js, Express and PostgreSQL.
The React frontend will be implemented next.

## Requirements

- Node.js 22 or newer and npm.
- PostgreSQL 17, or Docker with Compose to run the included database service.

## Install and run

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
reruns and the seed script.

## Git workflow

Each feature branch starts from the current `main`, receives focused commits,
and is merged back with a merge commit to preserve its history:

- `feat/backend-setup`
- `feat/authentication`
- `feat/readings`
- `feat/reports`
- `feat/demo-seed`
- `feat/backend-documentation`

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
  The Docker service is a local development database.
- Frontend screens, UI error messages and screenshots are pending the React phase.
- With more time: patient timezone settings, token rotation, structured logging,
  deployment configuration and frontend form tests. Charts are optional.
