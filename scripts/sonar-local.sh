#!/usr/bin/env sh
set -eu

if [ -f .env.sonar.local ]; then
  set -a
  . ./.env.sonar.local
  set +a
fi

if [ -z "${SONAR_TOKEN:-}" ]; then
  echo "SONAR_TOKEN lipseste. Genereaza un token in http://localhost:9000/account/security" >&2
  echo "si salveaza-l in .env.sonar.local: SONAR_TOKEN=squ_..." >&2
  exit 1
fi

exec npx --no-install sonar-scanner "$@"
