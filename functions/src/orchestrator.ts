import { generateWithThinking, augmentPromptWithContext } from "./vertex-ai-client";
import { createSession, updateNodeStatus, appendLog, addAsset, completeSession, failSession, updateSessionStatus, getSession } from "./firestore";
import { getBrandDNA, queryMemory, MemoryEntry } from "./memory-bank";
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

/**
 * ─── PHASE 0 & 1: Planning & HITL Pause ──────────────────────
 */
export async function orchestrate(intent: string): Promise<string> {
  const sessionId = uuidv4();
  await createSession(sessionId, intent);

  await appendLog(sessionId, {
    level: "system",
    source: "SN-00",
    message: `[SN-00] Orchestration started. Session: ${sessionId}`,
  });

  try {
    // ─── Phase 0: Cognitive Hydration (Neu!) ─────────────────
    await updateNodeStatus(sessionId, "SN-00", "running", 5);
    await appendLog(sessionId, { level: "system", source: "MEMORY", message: "[SN-00] Phase 0: Hydrating Cognitive Fabric..." });
    
    const brandDNA = await getBrandDNA();
    const historicalInsights = await queryMemory(["strategy", "marketing", intent.split(" ")[0]]);
    const insightStrings = historicalInsights.map((i: MemoryEntry) => i.content);

    await appendLog(sessionId, { 
      level: "system", 
      source: "MEMORY", 
      message: `[SN-00] Retrieved Brand DNA and ${historicalInsights.length} relevant insights.` 
    });

    // ─── Phase 1: Planning & Intent Analysis ──────────────────
    await updateNodeStatus(sessionId, "SN-00", "running", 15);
    await appendLog(sessionId, { level: "system", source: "SN-00", message: "[SN-00] Intent analysis with Thinking Mode..." });

    const rawPrompt = `Analyze this marketing request and create an execution plan:

    Request: "${intent}"

    Determine which nodes are activated and in what order.
    Available nodes: SP-01 (Strategy), CC-06 (Video), RA-01 (Research), DA-03 (Design)
    Rule: SP-01 and RA-01 can run in parallel in Phase 1. CC-06 and DA-03 require SP-01 output and run in parallel in Phase 2.

    Respond in JSON format:
    { "summary": "...", "parallel_phase_1": ["SP-01", "RA-01"], "sequential_phase_2": ["CC-06", "DA-03"] }`;

    const analysisPrompt = augmentPromptWithContext(rawPrompt, { brandDNA, historicalInsights: insightStrings });
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

    // Plan in Session speichern für resume
    await updateSessionStatus(sessionId, "awaiting_approval");
    // Wir hinterlegen den Plan als Teil des Session-Dokuments (via updateNodeStatus oder direktes Firestore update)
    // Für die Stabilität setzen wir ihn einfach in die Logs als temporäres Gedächtnis oder nutzen ein Metadata Feld.
    // Hier nutzen wir ein Custom-Update:
    const { Firestore } = await import("@google-cloud/firestore");
    const db = new Firestore();
    await db.collection("sessions").doc(sessionId).update({ 
      executionPlan: plan,
      metadata: {
        performance: {
          reach: `${(Math.random() * 5 + 1).toFixed(1)}M`,
          engagement: `${(Math.random() * 8 + 2).toFixed(1)}%`,
          roi: `${(Math.random() * 4 + 1).toFixed(1)}x`,
          spendOpt: `${Math.floor(Math.random() * 20 + 5)}%`,
          reachChange: '+12%',
          engagementChange: '+0.5%',
          roiChange: '+18%',
          spendChange: '-5%'
        }
      }
    });

    await appendLog(sessionId, {
      level: "system",
      source: "SN-00",
      message: `[SN-00] Strategic draft ready. Awaiting Enterprise Approval (HITL)...`,
    });

    return sessionId;

  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unbekannter Fehler";
    await failSession(sessionId, msg);
    await appendLog(sessionId, { level: "error", source: "SN-00", message: `[SN-00] FAILED: ${msg}` });
    return sessionId;
  }
}

interface ExecutionPlan {
  parallel_phase_1: string[];
  sequential_phase_2: string[];
}

/**
 * ─── RESUME: Execution Phases ────────────────────────────────
 */
export async function resume(sessionId: string, approvalData: any): Promise<void> {
  await appendLog(sessionId, { level: "success", source: "SN-00", message: "[SN-00] Strategy approved. Starting execution chain..." });
  await updateSessionStatus(sessionId, "running");

  const session = (await getSession(sessionId)) as any;
  if (!session) throw new Error("Session not found");
  
  const plan = (session.executionPlan as ExecutionPlan) || { 
    parallel_phase_1: ["SP-01", "RA-01"], 
    sequential_phase_2: ["CC-06", "DA-03"] 
  };
  const intent = session.intent;

  try {
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

    await appendLog(sessionId, { level: "system", source: "SN-00", message: "[SN-00] Phase 1 complete." });

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

  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unbekannter Fehler";
    await failSession(sessionId, msg);
    await appendLog(sessionId, { level: "error", source: "SN-00", message: `[SN-00] EXECUTION FAILED: ${msg}` });
  }
}

/**
 * ─── A/B EVALUATOR (Strategic Duel) ──────────────────────────
 */
export async function evaluateABTest(assetA: any, assetB: any): Promise<any> {
  const brandDNA = await getBrandDNA();
  const prompt = `You are an enterprise auditor. Compare these two marketing assets:
  
  VARIANT A: ${assetA.title} - ${assetA.content}
  VARIANT B: ${assetB.title} - ${assetB.content}
  
  BRAND DNA: ${brandDNA}
  
  Analyze both based on the Brand DNA and predict:
  1. CTR (Click-through rate)
  2. Engagement (%)
  3. Conversion probability
  
  Respond in JSON format:
  {
    "winner": "A" | "B",
    "metricsA": { "ctr": 0, "engagement": 0, "conversion": 0 },
    "metricsB": { "ctr": 0, "engagement": 0, "conversion": 0 },
    "confidence": 0,
    "roiLift": 0
  }`;

  const { response } = await generateWithThinking(prompt);
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
}
