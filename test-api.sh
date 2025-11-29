#!/bin/bash

# Test API endpoints
# Usage: ./test-api.sh [base_url]
# Example: ./test-api.sh http://localhost:3001
# Example: ./test-api.sh https://www.nsub.dev

BASE_URL="${1:-http://localhost:3001}"
API_URL="${BASE_URL}/api"

echo "🧪 Testing API at: ${API_URL}"
echo ""

# Test health endpoint
echo "1. Testing health endpoint..."
curl -s "${API_URL}/health" | jq '.' || echo "❌ Health check failed"
echo ""

# Test timeline endpoint (public, no auth needed)
echo "2. Testing timeline endpoint (GET)..."
curl -s "${API_URL}/timeline" | jq '.' || echo "❌ Timeline GET failed"
echo ""

# Test career endpoint (public, no auth needed)
echo "3. Testing career endpoint (GET)..."
curl -s "${API_URL}/career" | jq '.' || echo "❌ Career GET failed"
echo ""

# Test shitposts endpoint (public, no auth needed)
echo "4. Testing shitposts endpoint (GET)..."
curl -s "${API_URL}/shitposts" | jq '.' || echo "❌ Shitposts GET failed"
echo ""

# Test authenticated endpoint (will fail without auth, but shows if endpoint exists)
echo "5. Testing authenticated endpoint (POST timeline - should fail with 401)..."
ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin123}"
curl -s -X POST "${API_URL}/timeline" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ADMIN_PASSWORD}" \
  -d '{"dateValue":"2025-01-01","title":"Test","content":"Test content","tag":"Test","color":"bg-emerald-500"}' \
  | jq '.' || echo "Response received (401 is expected if password is wrong)"
echo ""

echo "✅ Testing complete!"
echo ""
echo "If all GET requests return data (or empty arrays), your API is working!"
echo "If you see connection errors, the backend is not accessible at ${API_URL}"

