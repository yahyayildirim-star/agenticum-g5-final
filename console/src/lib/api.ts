import type { OrchestrationRequest, OrchestrationResponse } from "./types";

const ORCHESTRATE_URL = import.meta.env.VITE_ORCHESTRATE_URL;
const NODE_STATUS_URL = import.meta.env.VITE_NODE_STATUS_URL;

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
