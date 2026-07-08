#!/usr/bin/env bash
# update-stats.sh — auto-update hero-stats (สรุป/ชุดแบบทดสอบ/ข้อสอบ) ใน index.html
#
# What it does:
#   1. Count summary cards (data-cat="summary") in index.html
#   2. Count quiz sets (data-cat="quiz") in index.html
#   3. Count questions across ALL html/js files (q: + showAns + q-num patterns)
#   4. Update hero-stat-num values
#   5. Optional: commit + push + verify (use --deploy)
#
# Usage:
#   ./scripts/update-stats.sh                # local update only
#   ./scripts/update-stats.sh --deploy       # update + commit + push + verify live
#   ./scripts/update-stats.sh --dry-run      # print counts without modifying files
#
# Verify-before-ship:
#   - Run with --dry-run first to confirm counts match expectations
#   - Then run plain to apply changes
#   - Then run with --deploy to ship

set -u

# === Config ===
INDEX_FILE="index.html"
DRY_RUN=0
DEPLOY=0

# Patterns for counting questions (refined 8 July 2026 after dry-run)
# Cover 4 patterns seen on c9-exam-prep-live:
# 1. {q:  or "q":  → JS object literal start with `q:` (credit-quiz-*.html, quiz-500-ch*.js)
# 2. "num":N      → JS object literal with num key (loan-products-quiz.html, praw-law)
# 3. q-num>ข้อ    → ONLY number-prefixed q-num (regulates HTML-rendered quizzes via .q-num{...})
QUESTION_PATTERNS='\{q:|"q":|"num":[0-9]+|q-num>ข้อ'

# Pretty-print
say()  { printf '\033[1;36m[stats]\033[0m %s\n' "$*"; }
ok()   { printf '\033[1;32m  ✓\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m  !\033[0m %s\n' "$*"; }
err()  { printf '\033[1;31m  ✗\033[0m %s\n' "$*"; }

# === CLI args ===
for arg in "$@"; do
  case "$arg" in
    --dry-run)   DRY_RUN=1 ;;
    --deploy)    DEPLOY=1 ;;
    -h|--help)
      sed -n '2,18p' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *)
      err "unknown flag: $arg"; exit 1 ;;
  esac
done

if [ ! -f "$INDEX_FILE" ]; then
  err "no $INDEX_FILE in cwd (run from repo root)"
  exit 1
fi

# === Count: summary cards ===
SUMMARY_COUNT=$(grep -c 'data-cat="summary"' "$INDEX_FILE" 2>/dev/null || echo 0)

# === Count: quiz cards on index ===
QUIZ_COUNT=$(grep -c 'data-cat="quiz"' "$INDEX_FILE" 2>/dev/null || echo 0)

# === Count: questions across all *.html + *.js ===
# Use grep -oE for accuracy on patterns (different files use different styles)
TOTAL_Q=0
# Count questions in 2 buckets (HTML = inline script, JS = data file):
for f in *.html *.js; do
  [ -f "$f" ] || continue
  case "$f" in
    "$INDEX_FILE") continue ;;  # skip index.html (cards, not questions)
    *.html)
      # HTML files: count {q: or "q": (credit quizzes)
      # PLUS "num":N (loan-products-quiz, praw-law)
      n=$(grep -oE '\{q:|"q":|"num":[0-9]+' "$f" 2>/dev/null | wc -l)
      ;;
    *.js)
      # JS data files: same patterns
      n=$(grep -oE '\{q:|"q":|"num":[0-9]+' "$f" 2>/dev/null | wc -l)
      ;;
    *) continue ;;
  esac
  TOTAL_Q=$((TOTAL_Q + n))
done

say "counts (dry-run=${DRY_RUN}, deploy=${DEPLOY}):"
say "  📖 สรุปเนื้อหา  : $SUMMARY_COUNT"
say "  📝 ชุดแบบทดสอบ: $QUIZ_COUNT"
say "  ❓ ข้อสอบ     : $TOTAL_Q+"
echo ""

# === Dry-run: stop here ===
if [ "$DRY_RUN" = "1" ]; then
  say "(dry-run mode — not modifying any file)"
  exit 0
fi

# === Apply: update hero-stat-num values ===
# Pattern: <div class="hero-stat-num">N</div>  after <div class="hero-stat-label">LABEL</div>
# Use awk to safely rewrite blocks labeled "สรุปเนื้อหา", "ชุดแบบทดสอบ", "ข้อสอบ"

TMP=$(mktemp)
cp "$INDEX_FILE" "$TMP"

# Helper: replace N in <div class="hero-stat-num">N</div> that comes RIGHT BEFORE
# the matching <div class="hero-stat-label">LABEL</div>.
# Note: we do this with sed because awk has issues with UTF-8 multi-byte strings,
# and our label contains UTF-8 (Thai text "สรุปเนื้อหา", "ชุดแบบทดสอบ", "ข้อสอบ").
#
# Strategy: find the line number of `class="hero-stat-label"` containing our label,
# then edit the LAST `class="hero-stat-num">...</div>` line BEFORE it.
update_stat() {
  local label="$1"
  local new_value="$2"
  # Find line numbers in $INDEX_FILE where the label line and the previous num line appear
  local label_line
  label_line=$(grep -n 'class="hero-stat-label"' "$INDEX_FILE" | grep -F "$label" | head -1 | cut -d: -f1)
  if [ -z "$label_line" ]; then
    err "label '$label' not found"
    exit 1
  fi
  # Find LAST hero-stat-num line BEFORE label_line (since num appears before label in this DOM)
  local num_line
  num_line=$(awk -v end="$label_line" 'NR < end && /class="hero-stat-num"/ { last = NR } END { print last }' "$INDEX_FILE")
  if [ -z "$num_line" ]; then
    err "hero-stat-num line before '$label' not found"
    exit 1
  fi
  # Replace the matched num_line
  sed -i "${num_line}s|>.*</div>|>$new_value</div>|" "$INDEX_FILE"
  ok "updated '$label' → $new_value"
}

update_stat "สรุปเนื้อหา" "$SUMMARY_COUNT"
update_stat "ชุดแบบทดสอบ" "$QUIZ_COUNT"
# Add "+" suffix for question count to hint at "more questions available"
update_stat "ข้อสอบ" "${TOTAL_Q}+"

ok "✓ all stats updated in $INDEX_FILE"
say "diff:"
git diff --stat "$INDEX_FILE" 2>/dev/null || true

# === Deploy ===
if [ "$DEPLOY" = "1" ]; then
  say "step 2: deploy via ./scripts/deploy.sh"
  ./scripts/deploy.sh --check-only || {
    err "pre-check failed — fix before deploying"; exit 1
  }
  ./scripts/deploy.sh
fi
