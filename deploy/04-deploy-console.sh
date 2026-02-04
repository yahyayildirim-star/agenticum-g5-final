#!/bin/bash
set -e

export PROJECT_ID="${PROJECT_ID:-tutorai-e39uu}"
export REGION="${REGION:-us-central1}"

echo "================================================"
echo "  AGENTICUM G5 — Console App Deployment"
echo "================================================"

cd "$(dirname "$0")/../console"

# Function URLs holen
echo "[1/5] Function URLs ermitteln..."
export ORCHESTRATE_URL=$(gcloud functions describe orchestrate --gen2 --region=$REGION --project=$PROJECT_ID --format="value(serviceConfig.uri)")
export STATUS_URL=$(gcloud functions describe getNodeStatus --gen2 --region=$REGION --project=$PROJECT_ID --format="value(serviceConfig.uri)")

echo "  ORCHESTRATE: $ORCHESTRATE_URL"
echo "  STATUS:      $STATUS_URL"

if [ -z "$ORCHESTRATE_URL" ] || [ -z "$STATUS_URL" ]; then
  echo "  ❌ Functions nicht gefunden. Führe zuerst 02-deploy-functions.sh aus!"
  exit 1
fi

# .env erstellen
echo "[2/5] .env erstellen..."
cat > .env << EOF
VITE_ORCHESTRATE_URL=$ORCHESTRATE_URL
VITE_NODE_STATUS_URL=$STATUS_URL
EOF

# Install + Build
echo "[3/5] npm install..."
npm install

echo "[4/5] Vite build..."
npm run build

# Upload
echo "[5/5] Upload auf Cloud Storage..."
# index.html ohne Cache
gsutil -h "Cache-Control:public,max-age=0" \
  -h "Content-Type:text/html;charset=UTF-8" \
  cp dist/index.html gs://$PROJECT_ID-console-us/index.html

# Alle anderen Assets mit langem Cache
gsutil -m -h "Cache-Control:public,max-age=31536000" \
  rsync -r -x "^index\.html$" dist/ gs://$PROJECT_ID-console-us/

# Website config
cat > /tmp/website.json << EOF
{ "mainPageSuffix": "index.html", "notFoundPage": "index.html" }
EOF
gsutil web -m /tmp/website.json gs://$PROJECT_ID-console-us

echo ""
echo "  ✅ Console App LIVE:"
echo "  https://storage.googleapis.com/$PROJECT_ID-console/index.html"
echo "================================================"
