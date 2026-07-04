#!/usr/bin/env bash
# Pre-deploy check for exam-center-genius9
# Validates HTML / JS in staged/unstaged .html files BEFORE pushing to GitHub Pages.
# Goal: catch broken tags, syntax errors, dangling references — locally — so users
# don't see a half-rendered page on https://peatlaonado-star.github.io/c9-exam-prep/.
#
# Usage:
#   ./scripts/pre-check.sh                 # checks all .html in repo
#   ./scripts/pre-check.sh bmis.html ...   # checks only these files
# Exit codes: 0 = pass, 1 = fail (will block deploy)

set -u
fail=0
checked=0

say()   { printf '\033[1;36m[check]\033[0m %s\n' "$*"; }
ok()    { printf '\033[1;32m  ✓\033[0m %s\n' "$*"; }
err()   { printf '\033[1;31m  ✗\033[0m %s\n' "$*"; fail=1; }
warn()  { printf '\033[1;33m  !\033[0m %s\n' "$*"; }

# Pick file list: user arg OR all .html in cwd
if [ "$#" -gt 0 ]; then
  files=("$@")
else
  files=(*.html)
fi

if [ "${#files[@]}" -eq 0 ]; then
  err "no .html files to check"
  exit 1
fi

for f in "${files[@]}"; do
  [ -f "$f" ] || continue
  checked=$((checked + 1))
  say "checking $f"

  # 1. Basic HTML sanity — paired <html> / <body> / <head>
  open_html=$(grep -c '<html' "$f" || true)
  close_html=$(grep -c '</html>' "$f" || true)
  if [ "$open_html" != "1" ] || [ "$close_html" != "1" ]; then
    err "$f: <html> not exactly once (open=$open_html close=$close_html)"
  fi

  # 2. <script> blocks balanced + extract them for JS lint
  script_blocks=$(awk '
    /<script>/   { capture = 1; buf = ""; next }
    /<\/script>/ { if (capture) print buf; capture = 0; next }
    capture      { buf = buf $0 "\n" }
  ' "$f")
  script_count=$(printf '%s' "$script_blocks" | grep -c '^' || true)

  if [ -n "$script_blocks" ]; then
    # 3. Quick JS lint via node --check if node exists
    if command -v node >/dev/null 2>&1; then
      if printf '%s' "$script_blocks" > /tmp/precheck-js-$$.js; then
        if node --check /tmp/precheck-js-$$.js 2>/tmp/precheck-js-err-$$; then
          ok "$f: inline JS syntax OK ($script_count script blocks)"
        else
          err "$f: JS syntax error:"
          sed 's/^/      /' /tmp/precheck-js-err-$$
        fi
        rm -f /tmp/precheck-js-$$.js /tmp/precheck-js-err-$$
      fi
    else
      warn "$f: node not installed — skipped JS lint"
    fi
  fi

  # 4. Broken local links: <a href="*.html"> where target file doesn't exist
  #    (skip anchors, mailto, http(s), absolute paths)
  while IFS= read -r href; do
    case "$href" in
      ""|"#"*|http*|mailto:*|tel:*|javascript:*|"/"*) continue ;;
      *.html|*/index.html)
        # strip query/anchor
        path="${href%%#*}"
        path="${path%%\?*}"
        [ -f "$path" ] || warn "$f: link → $path (file missing)"
        ;;
    esac
  done < <(grep -oE 'href="[^"]+"' "$f" | sed 's/href="//; s/"$//')

  # 5. Image src / script src pointing to local files
  while IFS= read -r src; do
    case "$src" in
      ""|http*|"/"*) continue ;;
      *.html|*.js|*.css|*.png|*.jpg|*.svg|*.ico)
        [ -f "$src" ] || warn "$f: src → $src (file missing)"
        ;;
    esac
  done < <(grep -oE 'src="[^"]+"' "$f" | sed 's/src="//; s/"$//')

done

echo ""
if [ "$fail" -eq 0 ]; then
  printf '\033[1;32m✅ pre-check OK\033[0m · %d file(s) checked\n' "$checked"
  exit 0
else
  printf '\033[1;31m❌ pre-check FAILED\033[0m · fix errors above before deploy\n'
  exit 1
fi
