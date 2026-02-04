#!/bin/bash
set -e

export PROJECT_ID="${PROJECT_ID:-tutorai-e39uu}"
export CONSOLE_URL="${CONSOLE_URL:-https://storage.googleapis.com/$PROJECT_ID-console-us/index.html}"

echo "================================================"
echo "  AGENTICUM G5 — Landing Page Deployment"
echo "================================================"

cd "$(dirname "$0")/../landing"

# Placeholder ersetzen
echo "[1/3] Console-URL einsetzen: $CONSOLE_URL"
cp index.html index.html.bak
sed -i "s|__CONSOLE_URL__|$CONSOLE_URL|g" index.html

# Upload
echo "[2/3] Upload auf Cloud Storage..."
gsutil -h "Cache-Control:public,max-age=300" \
  -h "Content-Type:text/html;charset=UTF-8" \
  cp index.html gs://$PROJECT_ID-landing/index.html

# Website config
echo "[3/3] Website-Konfiguration..."
cat > /tmp/website.json << EOF
{ "mainPageSuffix": "index.html", "notFoundPage": "index.html" }
EOF
gsutil web -m /tmp/website.json gs://$PROJECT_ID-landing

# Backup wiederherstellen
mv index.html.bak index.html

echo ""
echo "  ✅ Landing Page LIVE:"
echo "  https://storage.googleapis.com/$PROJECT_ID-landing/index.html"
echo "================================================"
