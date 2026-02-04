#!/bin/bash
set -e

export PROJECT_ID="${PROJECT_ID:-tutorai-e39uu}"
export REGION="${REGION:-us-central1}"

echo "================================================"
echo "  AGENTICUM G5 — Cloud Functions Deployment"
echo "================================================"

cd "$(dirname "$0")/../functions"

# Build
echo "[1/4] TypeScript kompilieren..."
npm install
npm run build

# orchestrate
echo "[2/4] Deploying 'orchestrate'..."
gcloud functions deploy orchestrate \
  --gen2 \
  --runtime=nodejs20 \
  --trigger-http \
  --entry-point=orchestrate \
  --source=. \
  --region=$REGION \
  --project=$PROJECT_ID \
  --memory=1024MB \
  --timeout=300s \
  --max-instances=10 \
  --allow-unauthenticated \
  --set-env-vars=GOOGLE_CLOUD_PROJECT=$PROJECT_ID,VERTEX_LOCATION=$REGION

# getNodeStatus
echo "[3/4] Deploying 'getNodeStatus'..."
gcloud functions deploy getNodeStatus \
  --gen2 \
  --runtime=nodejs20 \
  --trigger-http \
  --entry-point=getNodeStatus \
  --source=. \
  --region=$REGION \
  --project=$PROJECT_ID \
  --memory=512MB \
  --timeout=30s \
  --max-instances=100 \
  --allow-unauthenticated \
  --set-env-vars=GOOGLE_CLOUD_PROJECT=$PROJECT_ID

# health
echo "[4/4] Deploying 'health'..."
gcloud functions deploy health \
  --gen2 \
  --runtime=nodejs20 \
  --trigger-http \
  --entry-point=health \
  --source=. \
  --region=$REGION \
  --project=$PROJECT_ID \
  --memory=128MB \
  --timeout=10s \
  --max-instances=50 \
  --allow-unauthenticated

echo ""
echo "================================================"
echo "  ✅ Functions deployed. URLs:"
echo "================================================"
echo ""
echo "  orchestrate:   $(gcloud functions describe orchestrate --gen2 --region=$REGION --project=$PROJECT_ID --format='value(serviceConfig.uri)')"
echo "  getNodeStatus: $(gcloud functions describe getNodeStatus --gen2 --region=$REGION --project=$PROJECT_ID --format='value(serviceConfig.uri)')"
echo "  health:        $(gcloud functions describe health --gen2 --region=$REGION --project=$PROJECT_ID --format='value(serviceConfig.uri)')"
echo ""
echo "  ⚠️  SPEICHERE diese URLs!"
