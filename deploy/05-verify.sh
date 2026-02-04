#!/bin/bash

export PROJECT_ID="${PROJECT_ID:-tutorai-e39uu}"
export REGION="${REGION:-us-central1}"
PASS=0; FAIL=0

check() { if [ $1 -eq 0 ]; then echo "  ✅ $2"; ((PASS++)); else echo "  ❌ $2"; ((FAIL++)); fi; }

echo "================================================"
echo "  AGENTICUM G5 — Verification"
echo "================================================"

# Projekt
gcloud config get-value project 2>/dev/null | grep -q "$PROJECT_ID"
check $? "GCP Project: $PROJECT_ID"

# APIs
gcloud services list --enabled --project=$PROJECT_ID 2>/dev/null | grep -q "aiplatform"
check $? "API: aiplatform"
gcloud services list --enabled --project=$PROJECT_ID 2>/dev/null | grep -q "cloudfunctions"
check $? "API: cloudfunctions"

# Firestore
gcloud firestore databases list --project=$PROJECT_ID 2>/dev/null | grep -q "default"
check $? "Firestore: exists"

# Buckets
gsutil ls gs://$PROJECT_ID-landing >/dev/null 2>&1; check $? "Bucket: landing"
gsutil ls gs://$PROJECT_ID-console >/dev/null 2>&1; check $? "Bucket: console"

# Functions
for FN in orchestrate getNodeStatus health; do
  URL=$(gcloud functions describe $FN --gen2 --region=$REGION --project=$PROJECT_ID --format="value(serviceConfig.uri)" 2>/dev/null)
  if [ -n "$URL" ]; then echo "  ✅ Function: $FN"; ((PASS++)); else echo "  ❌ Function: $FN"; ((FAIL++)); fi
done

# Health Check
HEALTH_URL=$(gcloud functions describe health --gen2 --region=$REGION --project=$PROJECT_ID --format="value(serviceConfig.uri)" 2>/dev/null)
if [ -n "$HEALTH_URL" ]; then
  HTTP=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" 2>/dev/null || echo "000")
  if [ "$HTTP" = "200" ]; then echo "  ✅ Health: HTTP 200"; ((PASS++)); else echo "  ❌ Health: HTTP $HTTP"; ((FAIL++)); fi
fi

# Pages erreichbar
for BUCKET in landing console; do
  URL="https://storage.googleapis.com/$PROJECT_ID-$BUCKET/index.html"
  HTTP=$(curl -s -o /dev/null -w "%{http_code}" "$URL" 2>/dev/null || echo "000")
  if [ "$HTTP" = "200" ]; then echo "  ✅ Page ($BUCKET): HTTP 200"; ((PASS++)); else echo "  ❌ Page ($BUCKET): HTTP $HTTP"; ((FAIL++)); fi
done

echo ""
echo "================================================"
echo "  ERGEBNIS: $PASS bestanden | $FAIL fehlgeschlagen"
if [ $FAIL -gt 0 ]; then
  echo "  ⚠️  Bitte Fehler korrigieren."
  exit 1
else
  echo "  🚀 ALLES GRÜN! AGENTICUM G5 ist LIVE!"
fi
