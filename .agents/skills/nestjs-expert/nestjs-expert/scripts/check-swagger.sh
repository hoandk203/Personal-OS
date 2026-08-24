#!/usr/bin/env bash
# Find controller endpoints missing mandatory Swagger / validation decorators.
#
# CLAUDE.md requires @ApiOperation + @ApiResponse on every endpoint, and a
# ParseUUIDPipe on UUID route params. Nothing enforces it — tsc and eslint are
# both perfectly happy with an undocumented, unvalidated route. This is the
# enforcement.
#
# Usage: bash .claude/skills/nestjs-expert/scripts/check-swagger.sh [path]
# Exit:  0 = clean, 1 = findings, 2 = the scanner itself failed

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
TARGET="${1:-$ROOT/apps/api-server/src}"
[ -e "$TARGET" ] || { echo "✗ not found: $TARGET"; exit 2; }

# Route params that are NOT UUIDs — extend when you add another.
NON_UUID_PARAMS="jobId"

files=$(find "$TARGET" -name '*.controller.ts' 2>/dev/null | sort)
[ -n "$files" ] || { echo "no controller files under $TARGET"; exit 0; }

tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
: > "$tmp/found"; : > "$tmp/err"

# awk accumulates the decorator block preceding each method, then evaluates it
# against the method's full (possibly multi-line) signature.
#
# Two awk traps this code works around:
#   - a literal ' would close the shell-quoted program, so it arrives via -v q
#   - awk regex is POSIX ERE: \b is a backspace, never a word boundary
echo "$files" | while read -r f; do
  awk -v file="$f" -v q="'" -v notuuid="$NON_UUID_PARAMS" '
    /^  (async )?[a-zA-Z_][a-zA-Z0-9_]*\(/ {
      # gather the whole signature, which may span several lines
      first = $0; sig = $0
      while (sig !~ /\{[ \t]*$/ && (getline nextline) > 0) sig = sig " " nextline

      if (block ~ /@(Get|Post|Patch|Put|Delete)\(/) {
        miss = ""
        if (block !~ /@ApiOperation/) miss = miss "@ApiOperation "
        if (block !~ /@ApiResponse/)  miss = miss "@ApiResponse "
        # Only params that really carry a UUID need the pipe: `:jobId` is a Bull
        # id and `:email` is an email — flagging those would be pure noise.
        if (rparam != "") {
          uuidish = (rparam == "id" || rparam ~ /Id$/)
          if (index(" " notuuid " ", " " rparam " ") > 0) uuidish = 0
          if (uuidish && sig !~ /ParseUUIDPipe/) miss = miss "ParseUUIDPipe "
        }
        if (miss != "") {
          name = first; sub(/^ +/, "", name); sub(/\(.*/, "", name)
          printf "%s:%d  %s()  missing: %s\n", file, (start ? start : NR), name, miss
        }
      }
      block = ""; start = 0; rparam = ""; next
    }

    # Only method-level decorators count: they sit at exactly 2-space indent.
    # Parameter decorators (@Body, @Param) are indented 4 and would otherwise be
    # mistaken for the start of the next block, skewing every line number.
    /^  @/ {
      if (start == 0) start = NR
      block = block "\n" $0
      if ($0 ~ /^  @(Get|Post|Patch|Put|Delete)\(/) {
        if (match($0, q "[^" q "]*")) {              # the quoted route string
          route = substr($0, RSTART + 1, RLENGTH - 1)
          if (match(route, /:[a-zA-Z]+/)) rparam = substr(route, RSTART + 1, RLENGTH - 1)
        }
      }
    }
  ' "$f" >> "$tmp/found" 2>> "$tmp/err"
done

if [ -s "$tmp/err" ]; then
  echo "✗ scanner failed — do NOT read a clean result from this run:"
  sort -u "$tmp/err" | sed 's/^/    /'
  exit 2
fi

total=$(echo "$files" | wc -l)
if [ ! -s "$tmp/found" ]; then
  echo "✓ $total controller(s) scanned: endpoints documented and UUID params validated"
  exit 0
fi

echo "✗ endpoints missing mandatory decorators ($total controllers scanned):"
echo
sed "s|$ROOT/||; s|^|  |" "$tmp/found"
echo
echo "  → @ApiOperation({ summary }) + @ApiResponse per realistic status (incl. 401/403/404/409)"
echo "  → @Param('id', ParseUUIDPipe) on UUID route params"
echo "  → see .claude/skills/nestjs-expert/references/api-design.md"
exit 1
