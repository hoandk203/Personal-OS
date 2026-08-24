#!/usr/bin/env bash
# Catch the three accessibility misses this codebase actually makes.
#
# Of 153 component files, 19 use any aria-* attribute. The upstream Vercel rules
# in rules/ are a performance guide and will never prompt you about this, so
# nothing else in the toolchain does either.
#
# Checks:
#   1. icon-only <Button> without aria-label   → announced as just "button"
#   2. <img> without an alt attribute          → alt="" is correct for decorative
#   3. <DialogContent> in a file with no DialogTitle → Radix requires an
#      accessible name; use <span className="sr-only"> if there is no visible one
#
# Usage: bash .claude/skills/web-client-expert/scripts/check-a11y.sh [path]
# Exit:  0 = clean, 1 = findings, 2 = the scanner itself failed

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
TARGET="${1:-$ROOT/apps/web-client/src}"
[ -e "$TARGET" ] || { echo "✗ not found: $TARGET"; exit 2; }
command -v perl >/dev/null || { echo "✗ perl required"; exit 2; }

files=$(find "$TARGET" -name '*.tsx' 2>/dev/null | sort)
[ -n "$files" ] || { echo "no .tsx files under $TARGET"; exit 0; }

tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
: > "$tmp/found"; : > "$tmp/err"

# JSX tags span lines and contain `>` inside arrow functions (onClick={() => x}),
# so a naive /<Button[^>]*>/ is wrong. Scan forward tracking quote and brace
# depth to find the real end of the opening tag.
echo "$files" | while read -r f; do
  perl -e '
    my $file = $ARGV[0];
    open my $fh, "<", $file or exit 0;
    my $src = do { local $/; <$fh> };

    sub tag_at {
      my ($src, $from) = @_;
      my ($i, $depth, $inq) = ($from, 0, "");
      while ($i < length($src)) {
        my $c = substr($src, $i, 1);
        # chr(39) is a single quote — writing it literally would close the
        # shell quoting around this perl program.
        if ($inq ne "")                        { $inq = "" if $c eq $inq }
        elsif ($c eq q{"} || $c eq chr(39))    { $inq = $c }
        elsif ($c eq "{")                    { $depth++ }
        elsif ($c eq "}")                    { $depth-- }
        elsif ($c eq ">" && $depth == 0)     { last }
        $i++;
      }
      return substr($src, $from, $i - $from + 1);
    }
    sub line_of { my ($src, $pos) = @_; return 1 + (substr($src, 0, $pos) =~ tr/\n//) }

    # True icon-only means: sized as an icon AND its children are nothing but
    # nested elements. A <Button size="icon">{page}</Button> renders visible text
    # and is already announced — flagging it would be a false positive.
    sub is_icon_only {
      my ($src, $tag_end) = @_;
      my $close = index($src, "</Button>", $tag_end);
      return 0 if $close < 0;
      my ($i, $text) = ($tag_end + 1, "");
      while ($i < $close) {
        if (substr($src, $i, 1) eq "<") { $i += length(tag_at($src, $i)); next }
        $text .= substr($src, $i, 1); $i++;
      }
      return $text !~ /\S/;
    }

    while ($src =~ /<Button\b/g) {
      my $start = pos($src) - 7;
      my $tag = tag_at($src, $start);
      next unless $tag =~ /size=\"icon/;
      next if $tag =~ /aria-label/ || $tag =~ /aria-labelledby/;
      next unless is_icon_only($src, $start + length($tag) - 1);
      # title= is a weak accessible name: unreliable across AT, invisible on touch.
      my $note = $tag =~ /\btitle\s*=/
        ? "icon-only <Button> named only by title= (weak — add aria-label)"
        : "icon-only <Button> with no accessible name";
      printf "%s:%d  %s\n", $file, line_of($src, $start), $note;
    }

    while ($src =~ /<img\b/g) {
      my $start = pos($src) - 4;
      my $tag = tag_at($src, $start);
      next if $tag =~ /\balt\s*=/;
      printf "%s:%d  <img> without alt\n", $file, line_of($src, $start);
    }

    if ($src =~ /<DialogContent\b/ && $src !~ /DialogTitle/) {
      my $p = index($src, "<DialogContent");
      printf "%s:%d  <DialogContent> with no DialogTitle (Radix needs an accessible name)\n",
        $file, line_of($src, $p);
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
  echo "✓ $total component file(s) scanned: no icon-button, img-alt or dialog-title misses"
  exit 0
fi

echo "✗ accessibility findings ($total files scanned):"
echo
sort -t: -k1,1 -k2,2n "$tmp/found" | sed "s|$ROOT/||; s|^|  |"
echo
echo "  → see .claude/skills/web-client-expert/references/accessibility.md"
echo "  → decorative images take alt=\"\" (empty), not a missing attribute"
exit 1
