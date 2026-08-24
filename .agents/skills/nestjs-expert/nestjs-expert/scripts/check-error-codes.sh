#!/usr/bin/env bash
# Verify the three-way error-code contract is in sync:
#
#   1. api-server        withCode(msg, 'CODE')
#   2. shared-types      packages/shared-types/src/error-codes.ts   ERROR_CODES[]
#   3. web-client        apps/web-client/src/lib/error-messages.ts  ERROR_MESSAGES{}
#
# Both mismatches are eventually compile errors, but only in the *other* app —
# you can finish an api-server change, see it compile, and still have broken the
# web-client build. This catches it in under a second without a build.
#
# Usage: bash .claude/skills/nestjs-expert/scripts/check-error-codes.sh
# Exit:  0 = in sync, 1 = drift found

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
API_SRC="$ROOT/apps/api-server/src"
DECL="$ROOT/packages/shared-types/src/error-codes.ts"
TRANS="$ROOT/apps/web-client/src/lib/error-messages.ts"

for f in "$DECL" "$TRANS"; do
  [ -f "$f" ] || { echo "✗ not found: $f"; exit 1; }
done
[ -d "$API_SRC" ] || { echo "✗ not found: $API_SRC"; exit 1; }

tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT

# 1. codes actually passed to withCode() — perl slurps so multi-line calls match
grep -rl "withCode(" "$API_SRC" --include='*.ts' 2>/dev/null | while read -r f; do
  perl -0777 -ne "while (/withCode\(.*?,\s*'([A-Z][A-Z0-9_]*)'\s*[,)]/gs) { print \"\$1\n\" }" "$f"
done | sort -u > "$tmp/used"

# 2. declared union members
grep -oE "^\s*'[A-Z][A-Z0-9_]*'" "$DECL" | tr -d " '" | sort -u > "$tmp/declared"

# 3. translated keys
grep -oE "^\s*[A-Z][A-Z0-9_]*:" "$TRANS" | tr -d " :" | sort -u > "$tmp/translated"

printf 'used in api-server: %s\ndeclared in shared-types: %s\ntranslated in web-client: %s\n\n' \
  "$(wc -l < "$tmp/used")" "$(wc -l < "$tmp/declared")" "$(wc -l < "$tmp/translated")"

fail=0

report() { # $1=file of codes, $2=headline, $3=fix hint, $4=fatal(1/0)
  if [ -s "$1" ]; then
    [ "$4" = "1" ] && fail=1
    printf '%s %s\n' "$([ "$4" = 1 ] && echo '✗' || echo '·')" "$2"
    sed 's/^/    /' "$1"
    printf '  → %s\n\n' "$3"
  fi
}

comm -23 "$tmp/used" "$tmp/declared" > "$tmp/undeclared"
report "$tmp/undeclared" "used but NOT declared — api-server will not compile:" \
  "add to packages/shared-types/src/error-codes.ts" 1

comm -23 "$tmp/declared" "$tmp/translated" > "$tmp/untranslated"
report "$tmp/untranslated" "declared but NOT translated — web-client build WILL FAIL:" \
  "add a Vietnamese entry to apps/web-client/src/lib/error-messages.ts" 1

comm -13 "$tmp/declared" "$tmp/translated" > "$tmp/orphan"
report "$tmp/orphan" "translated but NOT declared — dead entry:" \
  "remove from error-messages.ts, or add the code to error-codes.ts" 1

comm -13 "$tmp/used" "$tmp/declared" > "$tmp/unused"
report "$tmp/unused" "declared but never thrown (informational, not a failure):" \
  "fine if a planned/external code; otherwise consider removing" 0

if [ "$fail" = "0" ]; then
  echo "✓ error-code contract in sync"
else
  echo "✗ error-code contract has drift — fix before declaring done"
fi
exit "$fail"
