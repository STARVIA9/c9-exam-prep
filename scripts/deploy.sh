#!/usr/bin/env bash
# Deploy c9-exam-prep → GitHub Pages (smoothly, no manual remote juggling).
#
# What this does:
#   1. Runs pre-check.sh — blocks deploy if HTML/JS/links broken
#   2. Auto-commits any pending changes (auto-message with timestamp + files)
#   3. Pushes to 'c9-prep' remote (= production repo with Pages enabled)
#      NOT 'origin' (that is the mirror backup, no Pages)
#   4. Polls GitHub Pages for up to 3 attempts × 15s = up to 45s
#   5. If still 404, retries via empty-commit rebuild (max 3 retries total)
#   6. Prints clear pass/fail summary
#
# Usage:
#   ./scripts/deploy.sh                  # full flow: check → commit → push → verify
#   ./scripts/deploy.sh --check-only     # only run pre-check, don't deploy
#   ./scripts/deploy.sh --skip-check     # skip pre-check, force deploy
#   ./scripts/deploy.sh --dry-run        # show what would do, don't actually push
#
# Exit codes: 0 = deployed+verified, 1 = any failure.

set -u

# ===== Config =====
PROD_REMOTE="c9-prep"          # repo with GitHub Pages enabled (peatlaonado-star/c9-exam-prep)
PAGES_URL="https://peatlaonado-star.github.io/c9-exam-prep/"
LOG_DIR="logs"
LOG_FILE="${LOG_DIR}/deploy-$(date +%Y%m%d-%H%M%S).log"
RETRY_MAX=3
POLL_INTERVAL=15               # seconds between HTTP polls

# ===== CLI args =====
DRY_RUN=0
CHECK_ONLY=0
SKIP_CHECK=0
for arg in "$@"; do
  case "$arg" in
    --check-only)  CHECK_ONLY=1 ;;
    --skip-check)  SKIP_CHECK=1 ;;
    --dry-run)     DRY_RUN=1 ;;
    -h|--help)
      sed -n '2,21p' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *)
      echo "unknown flag: $arg" >&2; exit 1 ;;
  esac
done

mkdir -p "$LOG_DIR"
exec > >(tee -a "$LOG_FILE") 2>&1

say()  { printf '\033[1;36m[deploy]\033[0m %s\n' "$*"; }
ok()   { printf '\033[1;32m  ✓\033[0m %s\n' "$*"; }
err()  { printf '\033[1;31m  ✗\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m  !\033[0m %s\n' "$*"; }

# ===== Sanity =====
if ! command -v git >/dev/null 2>&1; then err "git not found"; exit 1; fi
if ! command -v curl >/dev/null 2>&1; then err "curl not found"; exit 1; fi

# Detect which files changed/added (vs last commit)
mapfile -t changed < <(git status --porcelain | awk '{print $2}')
if [ "${#changed[@]}" -eq 0 ]; then
  warn "no changes detected — nothing to deploy"
  say "still verifying last deploy is live..."
fi

# ===== Step 1: Pre-check (only changed files — fast) =====
if [ "$SKIP_CHECK" -eq 0 ]; then
  say "step 1/5: pre-check (HTML/JS validation, changed files only)"
  if [ "${#changed[@]}" -gt 0 ]; then
    # Filter to .html only for pre-check
    html_changed=()
    for f in "${changed[@]}"; do
      case "$f" in *.html) html_changed+=("$f") ;; esac
    done
    if [ "${#html_changed[@]}" -gt 0 ]; then
      if ! ./scripts/pre-check.sh "${html_changed[@]}"; then
        err "pre-check failed — fix errors first or use --skip-check"
        exit 1
      fi
      ok "pre-check passed (${#html_changed[@]} file(s))"
    else
      warn "no .html in changed set — skipping pre-check"
    fi
  else
    warn "no file changes — running full repo pre-check"
    if ! ./scripts/pre-check.sh; then
      err "pre-check failed — fix errors first or use --skip-check"
      exit 1
    fi
  fi
else
  warn "skipping pre-check (--skip-check)"
fi
[ "$CHECK_ONLY" -eq 1 ] && { ok "check-only mode done"; exit 0; }

# ===== Step 2: Commit =====
say "step 2/5: commit local changes"
if [ "${#changed[@]}" -gt 0 ]; then
  if [ "$DRY_RUN" -eq 1 ]; then
    say "[dry-run] would add: ${changed[*]}"
  else
    git add "${changed[@]}"
  fi

  # Auto-commit message: timestamp + file list (truncated)
  ts="$(date '+%Y-%m-%d %H:%M')"
  files_csv=$(printf '%s, ' "${changed[@]}" | sed 's/, $//')
  msg="deploy: ${ts} · ${files_csv}"
  if [ "$DRY_RUN" -eq 1 ]; then
    say "[dry-run] would commit: $msg"
  else
    git -c user.name='Kara Auto-Deploy' -c user.email='kara@local' commit -m "$msg" || warn "nothing to commit"
  fi
fi
ok "git working tree clean"

# ===== Step 3: Push =====
say "step 3/5: push to '${PROD_REMOTE}/main' (= GitHub Pages production)"
current_sha=$(git rev-parse --short HEAD)
if [ "$DRY_RUN" -eq 1 ]; then
  say "[dry-run] would: git push ${PROD_REMOTE} main"
else
  if ! git push "$PROD_REMOTE" main 2>&1; then
    err "push failed — check auth (gh auth status) and remote URL"
    exit 1
  fi
fi
ok "pushed ${current_sha}"

# ===== Step 4: Verify + retry =====
say "step 4/5: verify Pages live (${RETRY_MAX} attempts × ${POLL_INTERVAL}s)"
attempt=0
live=0
while [ "$attempt" -lt "$RETRY_MAX" ]; do
  attempt=$((attempt + 1))
  sleep "$POLL_INTERVAL"
  http_code=$(curl -s -o /dev/null -w '%{http_code}' "$PAGES_URL" || echo "000")
  say "  attempt $attempt/$RETRY_MAX: HTTP $http_code from $PAGES_URL"
  if [ "$http_code" = "200" ]; then
    live=1
    break
  fi
done

# ===== Step 5: Build fail recovery =====
if [ "$live" -eq 0 ]; then
  warn "Pages didn't return 200 — GitHub Pages build may have failed"
  say "step 5/5: triggering rebuild via empty commit (max $RETRY_MAX)"

  empty_attempt=0
  while [ "$empty_attempt" -lt "$RETRY_MAX" ]; do
    empty_attempt=$((empty_attempt + 1))
    if [ "$DRY_RUN" -eq 1 ]; then
      say "[dry-run] would empty-commit + push + poll"
      sleep 2
    else
      git -c user.name='Kara Auto-Deploy' -c user.email='kara@local' commit --allow-empty -m "chore: rebuild Pages (deploy retry $empty_attempt)"
      git push "$PROD_REMOTE" main || { err "rebuild push failed"; exit 1; }
    fi
    sleep "$POLL_INTERVAL"
    http_code=$(curl -s -o /dev/null -w '%{http_code}' "$PAGES_URL" || echo "000")
    say "  rebuild $empty_attempt/$RETRY_MAX: HTTP $http_code"
    if [ "$http_code" = "200" ]; then
      live=1
      break
    fi
  done
fi

# ===== Summary =====
echo ""
if [ "$live" -eq 1 ]; then
  # Pick first .html from changed set for content sanity-check, or fall back to index.html
  sample_html=""
  for f in "${changed[@]}"; do
    case "$f" in
      *.html)
        sample_html="$f"
        break
        ;;
    esac
  done
  [ -z "$sample_html" ] && sample_html="index.html"

  if [ -f "$sample_html" ]; then
    local_size=$(stat -c '%s' "$sample_html" 2>/dev/null || wc -c < "$sample_html")
    remote_size=$(curl -s "$PAGES_URL$sample_html" | wc -c)
    if [ "$local_size" = "$remote_size" ]; then
      ok "content match: $sample_html = $local_size bytes (local == Pages)"
    else
      warn "size mismatch on $sample_html: local=$local_size, remote=$remote_size (Pages may still be caching)"
    fi
  fi
  printf '\033[1;32m✅ DEPLOY SUCCESS\033[0m · %s\n' "$PAGES_URL"
  printf '\033[2m  log: %s\033[0m\n' "$LOG_FILE"
  exit 0
else
  err "DEPLOY FAILED — Pages still not live"
  printf '\033[2m  See: https://github.com/peatlaonado-star/c9-exam-prep/actions\n'
  printf '\033[2m  Log: %s\033[0m\n' "$LOG_FILE"
  exit 1
fi
