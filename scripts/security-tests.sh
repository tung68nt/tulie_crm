#!/bin/bash
# =============================================================================
# ABUSE CASE TESTS — Tulie CRM Security Testing
# =============================================================================
#
# Run these tests against your local dev server (localhost:3004)
# to verify security controls are working.
#
# Usage: bash scripts/security-tests.sh [BASE_URL]
# Default: http://localhost:3004
#
# =============================================================================

BASE_URL="${1:-http://localhost:3004}"
PASS=0
FAIL=0

echo "🔒 Security Abuse Case Tests"
echo "   Target: $BASE_URL"
echo "   $(date)"
echo "==========================================="
echo ""

# Helper function
check() {
    local name="$1"
    local expected_status="$2"
    local actual_status="$3"
    
    if [ "$actual_status" = "$expected_status" ]; then
        echo "  ✅ PASS: $name (HTTP $actual_status)"
        PASS=$((PASS + 1))
    else
        echo "  ❌ FAIL: $name (expected $expected_status, got $actual_status)"
        FAIL=$((FAIL + 1))
    fi
}

# =============================================================================
# TEST 1: Unauthenticated API Access
# =============================================================================
echo "📋 Test 1: Unauthenticated API Access"
echo "   Endpoints should return 401 without auth"
echo ""

STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/customers")
check "GET /api/customers without auth" "401" "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/reset-templates")
check "GET /api/reset-templates without auth" "401" "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/templates/fake-id")
check "GET /api/templates/[id] without auth" "401" "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH -H "Content-Type: application/json" -d '{"status":"completed"}' "$BASE_URL/api/projects/fake-id")
check "PATCH /api/projects/[id] without auth" "401" "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json" -d '{"action":"create_acceptance_report"}' "$BASE_URL/api/projects/fake-id")
check "POST /api/projects/[id] without auth" "401" "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json" -d '{}' "$BASE_URL/api/studio/sync-transactions")
check "POST /api/studio/sync-transactions without auth" "401" "$STATUS"

echo ""

# =============================================================================
# TEST 2: Rate Limiting on Public Endpoints
# =============================================================================
echo "📋 Test 2: Rate Limiting"
echo "   Rapid requests should trigger 429"
echo ""

echo "   Testing confirm-transfer rate limit (4 rapid requests, limit=3)..."
for i in 1 2 3 4; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -d '{"order_id":"00000000-0000-0000-0000-000000000001","order_number":"TEST-001"}' \
        "$BASE_URL/api/studio/confirm-transfer")
    if [ $i -eq 4 ]; then
        check "confirm-transfer request #$i (should be rate limited)" "429" "$STATUS"
    fi
done

echo ""

# =============================================================================
# TEST 3: Input Validation
# =============================================================================
echo "📋 Test 3: Input Validation"
echo "   Invalid inputs should be rejected"
echo ""

# Invalid UUID format
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d '{"order_id":"not-a-uuid","order_number":"TEST"}' \
    "$BASE_URL/api/studio/confirm-transfer")
check "confirm-transfer with invalid UUID" "400" "$STATUS"

# Missing required fields
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d '{}' \
    "$BASE_URL/api/studio/confirm-transfer")
check "confirm-transfer with empty body" "400" "$STATUS"

# Payment status without token
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/studio/payment-status")
check "payment-status without token param" "400" "$STATUS"

echo ""

# =============================================================================
# TEST 4: Webhook Auth
# =============================================================================
echo "📋 Test 4: Webhook Authentication"
echo "   Webhooks should reject unauthorized requests"
echo ""

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d '{"id":999,"transferType":"in","transferAmount":100000}' \
    "$BASE_URL/api/webhooks/sepay")
check "Sepay webhook without API key" "401" "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Apikey fake-key-12345" \
    -d '{"id":999,"transferType":"in","transferAmount":100000}' \
    "$BASE_URL/api/webhooks/sepay")
check "Sepay webhook with wrong API key" "401" "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -H "x-academy-api-key: fake-key" \
    -d '{"event":"ORDER_PAID","order":{"id":"fake"}}' \
    "$BASE_URL/api/webhooks/academy")
check "Academy webhook with wrong API key" "401" "$STATUS"

echo ""

# =============================================================================
# TEST 5: Security Headers
# =============================================================================
echo "📋 Test 5: Security Headers"
echo "   Response should include security headers"
echo ""

HEADERS=$(curl -s -I "$BASE_URL" 2>/dev/null)

echo "$HEADERS" | grep -qi "x-frame-options: deny" && check "X-Frame-Options: DENY" "present" "present" || check "X-Frame-Options: DENY" "present" "missing"
echo "$HEADERS" | grep -qi "x-content-type-options: nosniff" && check "X-Content-Type-Options: nosniff" "present" "present" || check "X-Content-Type-Options: nosniff" "present" "missing"
echo "$HEADERS" | grep -qi "strict-transport-security" && check "Strict-Transport-Security" "present" "present" || check "Strict-Transport-Security" "present" "missing"
echo "$HEADERS" | grep -qi "content-security-policy" && check "Content-Security-Policy" "present" "present" || check "Content-Security-Policy" "present" "missing"
echo "$HEADERS" | grep -qi "referrer-policy" && check "Referrer-Policy" "present" "present" || check "Referrer-Policy" "present" "missing"

echo ""

# =============================================================================
# TEST 6: Health Check
# =============================================================================
echo "📋 Test 6: Health Check Endpoint"
echo ""

STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/health")
check "GET /api/health returns 200" "200" "$STATUS"

echo ""

# =============================================================================
# TEST 7: Protected Pages (Middleware)
# =============================================================================
echo "📋 Test 7: Protected Pages Redirect"
echo "   Dashboard pages should redirect to login"
echo ""

for path in /dashboard /customers /studio /settings /helpdesk /projects /leads /deals; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" -L --max-redirs 0 "$BASE_URL$path" 2>/dev/null || echo "redirect")
    # Expect 307 redirect to /system-login
    if [ "$STATUS" = "307" ] || [ "$STATUS" = "302" ] || [ "$STATUS" = "redirect" ]; then
        check "$path redirects unauthenticated" "redirect" "redirect"
    else
        check "$path redirects unauthenticated" "307" "$STATUS"
    fi
done

echo ""

# =============================================================================
# SUMMARY
# =============================================================================
echo "==========================================="
TOTAL=$((PASS + FAIL))
echo "📊 Results: $PASS/$TOTAL passed, $FAIL failed"
if [ $FAIL -eq 0 ]; then
    echo "🎉 All tests passed!"
else
    echo "⚠️  $FAIL test(s) failed — review above"
fi
echo "==========================================="
