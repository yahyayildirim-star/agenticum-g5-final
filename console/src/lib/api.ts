import type { OrchestrationRequest, OrchestrationResponse } from "./types";

const ORCHESTRATE_URL = import.meta.env.VITE_ORCHESTRATE_URL;
const NODE_STATUS_URL = import.meta.env.VITE_NODE_STATUS_URL;
const RESUME_URL = import.meta.env.VITE_RESUME_URL;

// ─── Orchestration starten ───────────────────────────────────
export async function startOrchestration(
  request: OrchestrationRequest
): Promise<OrchestrationResponse> {
  const response = await fetch(ORCHESTRATE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Orchestration failed: ${response.status} — ${errorText}`);
  }

  return response.json();
}

// ─── Node Status polling ─────────────────────────────────────
export async function pollSessionStatus(
  sessionId: string
): Promise<OrchestrationResponse> {
  const response = await fetch(`${NODE_STATUS_URL}?sessionId=${sessionId}`);

  if (!response.ok) {
    throw new Error(`Status poll failed: ${response.status}`);
  }

  return response.json();
}

/**
 * ─── Orchestration fortsetzen (HITL) ──────────────────────────
 * Provides user approval/feedback and signals the orchestrator to proceed.
 */
export async function resumeOrchestration(
  sessionId: string,
  approvalData: Record<string, unknown> = {}
): Promise<OrchestrationResponse> {
  const response = await fetch(RESUME_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, approved: true, ...approvalData }),
  });

  if (!response.ok) {
    throw new Error(`Resume failed: ${response.status}`);
  }

  return response.json();
}

// ─── Campaigns (Distribution Hub) ───────────────────────────
export async function getCampaigns(): Promise<any[]> {
  const response = await fetch(`${NODE_STATUS_URL}/campaigns`);
  if (!response.ok) throw new Error("Failed to fetch campaigns");
  return response.json();
}

export async function createCampaign(campaign: any): Promise<void> {
  const response = await fetch(`${ORCHESTRATE_URL}/campaigns`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(campaign),
  });
  if (!response.ok) throw new Error("Failed to create campaign");
}

// ─── A/B Evaluation ──────────────────────────────────────────
export async function runABEvaluation(assetA: any, assetB: any): Promise<any> {
  const response = await fetch(`${ORCHESTRATE_URL}/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assetA, assetB }),
  });
  if (!response.ok) throw new Error("Evaluation failed");
  return response.json();
}
