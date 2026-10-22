#!/usr/bin/env bash
#
# TINKL. production build — minify + pre-compress the PWA shell.
#
#   ./build.sh [src_dir] [dist_dir]        (defaults: .  ./dist)
#
# Steps:
#   1. Copy src -> dist (excluding backend/, _extract/, build outputs)
#   2. Minify CSS  (npx clean-css-cli  | fallback: python csscompressor | fallback: copy)
#   3. Minify JS   (npx terser         | fallback: copy unminified + warn)
#   4. Minify HTML (npx html-minifier-terser | fallback: copy)
#   5. Pre-compress text assets to .gz (gzip -9) and .br (brotli -q 11, if present)
#   6. Print a size report proving the savings.
#
# The service worker precaches by URL (not hash), so minified files keep
# their names — just bump CACHE_VERSION in sw.js on every deploy.
#
set -euo pipefail

SRC="${1:-.}"
DIST="${2:-./dist}"
ROOT="$(cd "$(dirname "$0")" && pwd)"
SRC="$(cd "$SRC" && pwd)"

echo "==> TINKL. build: $SRC -> $DIST"
rm -rf "$DIST"
mkdir -p "$DIST"

# ---- 1. copy (prune build-only dirs) ----
rsync -a --prune-empty-dirs \
  --exclude 'backend/' --exclude '_extract/' --exclude 'dist/' \
  --exclude 'node_modules/' --exclude '.git/' \
  "$SRC/" "$DIST/"

have() { command -v "$1" >/dev/null 2>&1; }

# ---- 2. CSS ----
echo "==> minifying CSS"
if have npx; then
  for f in "$DIST"/css/*.css; do
    [ -e "$f" ] || continue
    npx --yes clean-css-cli -o "$f" "$f" 2>/dev/null || true
  done
elif python3 -c "import csscompressor" 2>/dev/null; then
  python3 - "$DIST" <<'EOF'
import csscompressor, glob, sys
for f in glob.glob(sys.argv[1] + '/css/*.css'):
    src = open(f, encoding='utf-8').read()
    open(f, 'w', encoding='utf-8').write(csscompressor.compress(src))
    print('  minified', f)
EOF
else
  echo "  !! no CSS minifier found (npx/csscompressor) — shipping unminified CSS"
fi

# ---- 3. JS (skip vendor + legacy reference) ----
echo "==> minifying JS"
if have npx; then
  while IFS= read -r -d '' f; do
    npx --yes terser "$f" --compress --mangle --comments false -o "$f" 2>/dev/null || true
  done < <(find "$DIST/js" -name '*.js' -not -path '*/vendor/*' -print0)
else
  echo "  !! npx/terser not found — shipping unminified JS"
fi

# ---- 4. HTML ----
echo "==> minifying HTML"
if have npx; then
  for f in "$DIST"/*.html; do
    [ -e "$f" ] || continue
    npx --yes html-minifier-terser --collapse-whitespace --remove-comments \
      --minify-css true --minify-js true -o "$f" "$f" 2>/dev/null || true
  done
else
  echo "  !! npx/html-minifier-terser not found — shipping unminified HTML"
fi

# ---- 5. pre-compress ----
echo "==> pre-compressing (gzip -9, brotli -q 11)"
while IFS= read -r -d '' f; do
  gzip -9 -k -f "$f"
  if have brotli; then
    brotli -q 11 -k -f "$f" 2>/dev/null || true
  fi
done < <(find "$DIST" \( -name '*.html' -o -name '*.css' -o -name '*.js' \
  -o -name '*.json' -o -name '*.svg' -o -name '*.webmanifest' \) -print0)
have brotli || echo "  !! brotli CLI not found — .gz only (install: apt install brotli)"

# ---- 6. size report ----
echo ""
echo "== size report (bytes) =="
printf "%-46s %10s %10s %10s\n" "file" "orig" "gzip" "brotli"
find "$DIST" \( -name '*.html' -o -name '*.css' -o -name '*.js' -o -name '*.json' \) \
  -not -name '*.gz' -not -name '*.br' | sort | while read -r f; do
  rel="${f#$DIST/}"
  o=$(stat -c%s "$f")
  g=$(stat -c%s "$f.gz" 2>/dev/null || echo "-")
  b=$(stat -c%s "$f.br" 2>/dev/null || echo "-")
  printf "%-46s %10s %10s %10s\n" "$rel" "$o" "$g" "$b"
done
echo ""
echo "done -> $DIST"
echo "NEXT: bump CACHE_VERSION in sw.js, then deploy the CONTENTS of dist/."
