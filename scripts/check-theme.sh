#!/usr/bin/env bash
# Fails if admin-web uses disallowed styling patterns (see docs/theme.md).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/admin-web/src"
FAILED=0

check() {
  local name="$1"
  local pattern="$2"
  if rg -n "$pattern" "$SRC" --glob '*.tsx' --glob '*.ts' 2>/dev/null; then
    echo "FAIL: $name"
    FAILED=1
  fi
}

echo "Checking theme conventions in $SRC ..."

check "raw gray/white tailwind" '(bg-white|text-gray-|border-gray-|bg-gray-)'
check "physical text alignment" '(text-left|text-right)'
check "physical margins ml-/mr-" '(className="[^"]*\bml-|\bclassName="[^"]*\bmr-|\sml-auto|\smr-auto)'
check "hardcoded green/red buttons" '(bg-green-600|bg-red-600)'

if [ "$FAILED" -eq 1 ]; then
  echo ""
  echo "Theme check failed. See docs/theme.md"
  exit 1
fi

echo "Theme check passed."
