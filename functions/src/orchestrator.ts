import { generateWithThinking } from "./vertex-ai-client";
import { createSession, updateNodeStatus, appendLog, addAsset, completeSession, failSession } from "./firestore";
import { SP01CampaignStrategist } from "./nodes/sp01-strategist";
import { CC06VideoDirector } from "./nodes/cc06-video-director";
import { RA01AuthorityAuditor } from "./nodes/ra01-auditor";
import { DA03DesignArchitect } from "./nodes/da03-design-architect";
import { v4 as uuidv4 } from "uuid";

const NODES: Record<string, any> = {
  "SP-01": new SP01CampaignStrategist(),
  "CC-06": new CC06VideoDirector(),
  "RA-01": new RA01AuthorityAuditor(),
  "DA-03": new DA03DesignArchitect(),
};

export async function orchestrate(intent: string): Promise<string> {
  const sessionId = uuidv4();
  await createSession(sessionId, intent);

  await appendLog(sessionId, {
    level: "system",
    source: "SN-00",
    message: `[SN-00] Orchestration gestartet. Session: ${sessionId}`,
  });

  try {
    // ─── SCHRITT 1: Intent analysieren mit Thinking Mode ──────
    await updateNodeStatus(sessionId, "SN-00", "running", 10);
    await appendLog(sessionId, { level: "system", source: "SN-00", message: "[SN-00] Intent-Analyse mit Thinking Mode..." });

    const analysisPrompt = `Analysiere diese Marketing-Anfrage und erstelle einen Ausführungsplan:

    Anfrage: "${intent}"

    Bestimme welche Nodes aktiviert werden und in welcher Reihenfolge.
    Verfügbare Nodes: SP-01 (Strategy), CC-06 (Video), RA-01 (Research), DA-03 (Design)
    Regel: SP-01 und RA-01 können parallel laufen in Phase 1. CC-06 und DA-03 brauchen SP-01 Output und laufen parallel in Phase 2.

    Antworte im JSON-Format:
    { "summary": "...", "parallel_phase_1": ["SP-01", "RA-01"], "sequential_phase_2": ["CC-06", "DA-03"] }`;

    const { thinking, response } = await generateWithThinking(analysisPrompt);

    await appendLog(sessionId, { level: "system", source: "SN-00", message: `[SN-00] Thinking: ${thinking.slice(0, 150)}...` });

    // Plan parsen (mit Fallback)
    let plan = { parallel_phase_1: ["SP-01", "RA-01"], sequential_phase_2: ["CC-06", "DA-03"] };
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.parallel_phase_1 && parsed.sequential_phase_2) plan = parsed;
      }
    } catch { /* Fallback plan bleibt */ }

    await appendLog(sessionId, {
      level: "system",
      source: "SN-00",
      message: `[SN-00] Plan: Phase 1 (parallel): [${plan.parallel_phase_1.join(", ")}] → Phase 2: [${plan.sequential_phase_2.join(", ")}]`,
    });

    // ─── SCHRITT 2: Phase 1 — Parallel ─────────────────────
    await updateNodeStatus(sessionId, "SN-00", "running", 30);

    const phase1Results: Record<string, string> = {};

    await Promise.all(
      plan.parallel_phase_1.map(async (nodeId: string) => {
        const node = NODES[nodeId];
        if (!node) return;
        const output = await node.execute({ sessionId, intent, previousOutputs: {} });
        if (output.success) {
          phase1Results[nodeId] = output.data;
          await addAsset(sessionId, { 
            type: output.assetType, 
            title: output.assetTitle, 
            content: output.data, 
            generatedBy: nodeId,
            imageData: output.imageData,
          });
        }
      })
    );

    await appendLog(sessionId, { level: "system", source: "SN-00", message: "[SN-00] Phase 1 abgeschlossen." });

    // ─── SCHRITT 3: Phase 2 — Sequentiell ──────────────────
    await updateNodeStatus(sessionId, "SN-00", "running", 70);

    await Promise.all(
      plan.sequential_phase_2.map(async (nodeId: string) => {
        const node = NODES[nodeId];
        if (!node) return;
        const output = await node.execute({ sessionId, intent, previousOutputs: phase1Results });
        if (output.success) {
          await addAsset(sessionId, { 
            type: output.assetType, 
            title: output.assetTitle, 
            content: output.data, 
            generatedBy: nodeId,
            imageData: output.imageData,
          });
        }
      })
    );

    // ─── SCHRITT 4: Abschluss ───────────────────────────────
    await updateNodeStatus(sessionId, "SN-00", "completed", 100);
    const finalResult = `AGENTICUM G5 — Orchestration complete. Session: ${sessionId}. Nodes: ${[...plan.parallel_phase_1, ...plan.sequential_phase_2].join(", ")}`;
    await completeSession(sessionId, finalResult);
    await appendLog(sessionId, { level: "success", source: "SN-00", message: "[SN-00] ORCHESTRATION COMPLETE." });

    return sessionId;

  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unbekannter Fehler";
    await failSession(sessionId, msg);
    await appendLog(sessionId, { level: "error", source: "SN-00", message: `[SN-00] FAILED: ${msg}` });
    return sessionId;
  }
}
