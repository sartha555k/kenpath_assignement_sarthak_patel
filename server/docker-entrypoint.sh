#!/bin/sh
set -eu

# Compose supplies separate credentials. Build the URL with proper escaping,
# including passwords with @, :, / or other URL-reserved characters.
# An explicit DATABASE_URL still works when running the image independently.
if [ -z "${DATABASE_URL:-}" ]; then
  DATABASE_URL="$(node --input-type=module -e '
    const url = new URL("postgresql://db:5432/");
    url.username = encodeURIComponent(process.env.POSTGRES_USER || "sweety");
    url.password = encodeURIComponent(process.env.POSTGRES_PASSWORD || "sweety");
    url.pathname = "/" + encodeURIComponent(process.env.POSTGRES_DB || "sweety");
    process.stdout.write(url.toString());
  ')"
  export DATABASE_URL
fi

exec "$@"
