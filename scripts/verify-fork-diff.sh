#!/bin/bash
# verify-fork-diff.sh
# Verifica que las modificaciones al core siguen presentes

PASS=0
FAIL=0

check() {
  local desc=$1
  local cmd=$2
  if eval "$cmd" > /dev/null 2>&1; then
    echo "✓ $desc"
    PASS=$((PASS + 1))
  else
    echo "✗ $desc — VERIFICAR"
    FAIL=$((FAIL + 1))
  fi
}

echo "Verificando modificaciones al core..."
echo ""

check "MOD-001: _app.tsx importa brand/tokens/base.css" \
  "grep -q 'brand/tokens/base.css' src/pages/_app.tsx"

check "MOD-002: App/index.tsx usa el resolver" \
  "grep -q 'brand/resolver' src/components/App/index.tsx"

check "MOD-003: Logo acepta prop src" \
  "grep -q 'src?: string' src/components/@shared/atoms/Logo/index.tsx"

check "MOD-004: MarketMetadata usa deepMerge" \
  "grep -q 'deepMerge' src/@context/MarketMetadata/index.tsx"

check "MOD-005: pages/index.tsx tiene condicional brand" \
  "grep -q 'USE_BRAND_LANDING' src/pages/index.tsx"

echo ""
echo "Resultado: $PASS correctas, $FAIL a verificar"

[ $FAIL -eq 0 ] && exit 0 || exit 1
