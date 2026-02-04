#!/bin/bash
set -e

export PROJECT_ID="${PROJECT_ID:-tutorai-e39uu}"
export REGION="${REGION:-us-central1}"

echo "================================================"
echo "  AGENTICUM G5 — Infrastructure Setup"
echo "  Project: $PROJECT_ID | Region: $REGION"
echo "================================================"

# APIs
echo "[1/7] APIs aktivieren..."
gcloud services enable \
  aiplatform.googleapis.com \
  cloudfunctions.googleapis.com \
  cloudbuild.googleapis.com \
  firestore.googleapis.com \
  storage.googleapis.com \
  pubsub.googleapis.com \
  cloudtasks.googleapis.com \
  run.googleapis.com \
  iam.googleapis.com \
  logging.googleapis.com \
  artifactregistry.googleapis.com \
  --project=$PROJECT_ID

# Firestore
echo "[2/7] Firestore..."
gcloud firestore databases create --location=$REGION --project=$PROJECT_ID 2>/dev/null || echo "  Firestore existiert bereits."

# Buckets
echo "[3/7] Storage Buckets..."
gsutil mb -p $PROJECT_ID -c STANDARD -l $REGION gs://$PROJECT_ID-landing 2>/dev/null || true
gsutil mb -p $PROJECT_ID -c STANDARD -l $REGION gs://$PROJECT_ID-console 2>/dev/null || true
gsutil mb -p $PROJECT_ID -c STANDARD -l $REGION gs://$PROJECT_ID-assets 2>/dev/null || true
gsutil iam ch allUsers:objectViewer gs://$PROJECT_ID-landing
gsutil iam ch allUsers:objectViewer gs://$PROJECT_ID-console

# Cloud Tasks
echo "[4/7] Cloud Tasks Queue..."
gcloud tasks queues create agenticum-queue --location=$REGION --project=$PROJECT_ID 2>/dev/null || echo "  Queue existiert."

# Pub/Sub
echo "[5/7] Pub/Sub..."
gcloud pubsub topics create agenticum-node-events --project=$PROJECT_ID 2>/dev/null || echo "  Topic existiert."

# IAM
echo "[6/7] IAM..."
export SA="$PROJECT_ID@appspot.gserviceaccount.com"
for ROLE in roles/aiplatform.user roles/datastore.user roles/cloudtasks.enqueuer roles/storage.objectAdmin roles/pubsub.publisher roles/logging.logWriter; do
  gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SA" --role="$ROLE" 2>/dev/null || true
done

# Artifact Registry
echo "[7/7] Artifact Registry..."
gcloud artifacts repositories create gcf-artifacts --repository-format=docker --location=$REGION --project=$PROJECT_ID 2>/dev/null || echo "  Existiert."

echo ""
echo "  ✅ Infrastructure Setup COMPLETE"
echo "================================================"
