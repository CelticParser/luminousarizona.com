#!/usr/bin/env bash
# Netlify runs this so ELEVENTY_DRAFTS is set in the shell before npm spawns Eleventy.
# Relying only on eleventy.config.js reading BRANCH failed for some setups; this matches
# Netlify branch deploy URLs (https://stage--yoursite.netlify.app) as well.

set -euo pipefail

if [[ "${CONTEXT:-}" != "production" ]]; then
  branch_lc="$(printf '%s' "${BRANCH:-}" | tr '[:upper:]' '[:lower:]')"
  head_lc="$(printf '%s' "${HEAD:-}" | tr '[:upper:]' '[:lower:]')"
  deploy_urls="${DEPLOY_PRIME_URL:-}${DEPLOY_URL:-}"

  if [[ "$branch_lc" == "stage" || "$head_lc" == "stage" ]]; then
    export ELEVENTY_DRAFTS=true
  elif echo "$deploy_urls" | grep -qE '//stage--'; then
    export ELEVENTY_DRAFTS=true
  fi
fi

if [[ "${NETLIFY:-}" == "true" ]]; then
  echo "[netlify-build] CONTEXT=${CONTEXT:-} BRANCH=${BRANCH:-} HEAD=${HEAD:-} ELEVENTY_DRAFTS=${ELEVENTY_DRAFTS:-} (draft pages when true)"
fi

exec npm run build
