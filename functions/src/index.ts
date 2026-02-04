import * as functions from "@google-cloud/functions-framework";
import cors from "cors";
import { orchestrate } from "./orchestrator";
import { getSession, appendAuditLog } from "./firestore";

const corsHandler = cors({ origin: "*" });

// ─── POST /orchestrate ───────────────────────────────────────
functions.http("orchestrate", (req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Use POST" });
      return;
    }
    try {
      const { intent } = req.body as { intent?: string };
      if (!intent || typeof intent !== "string") {
        res.status(400).json({ error: "'intent' required (string)" });
        return;
      }
      const sessionId = await orchestrate(intent);
      
      await appendAuditLog({
        type: "OPERATIONAL",
        action: "SESSION_START",
        actor: "SYSTEM_AUTO",
        details: { sessionId, intent }
      });

      res.status(200).json({ sessionId, status: "started" });
    } catch (error) {
      console.error("Orchestration error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Internal error" });
    }
  });
});

// ─── GET /getNodeStatus ──────────────────────────────────────
functions.http("getNodeStatus", (req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== "GET") {
      res.status(405).json({ error: "Use GET" });
      return;
    }
    try {
      const sessionId = req.query.sessionId as string;
      if (!sessionId) {
        res.status(400).json({ error: "'sessionId' query param required" });
        return;
      }
      const session = await getSession(sessionId);
      if (!session) {
        res.status(404).json({ error: "Session not found" });
        return;
      }
      res.status(200).json(session);
    } catch (error) {
      console.error("Status error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Internal error" });
    }
  });
});

// ─── POST /orchestrate/resume ───────────────────────────────
functions.http("resumeOrchestration", (req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Use POST" });
      return;
    }
    try {
      const { sessionId, approved } = req.body as { sessionId?: string; approved?: boolean };
      if (!sessionId) {
        res.status(400).json({ error: "'sessionId' required" });
        return;
      }
      
      const { resume } = await import("./orchestrator");
      
      // Wir starten die Ausführung asynchron, um den HTTP-Call schnell zu beenden
      // In einer Produktionsumgebung würde man hier Cloud Tasks nutzen
      resume(sessionId, { approved }).catch(err => console.error("Resume background error:", err));
      
      await appendAuditLog({
        type: "SECURITY",
        action: "HITL_APPROVAL",
        actor: approved ? "ADMIN_MANUAL" : "OPERATOR_MANUAL",
        details: { sessionId, approved }
      });

      res.status(200).json({ status: "resuming", sessionId });
    } catch (error) {
      console.error("Resume error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Internal error" });
    }
  });
});

// ─── GET /campaigns ──────────────────────────────────────────
functions.http("getCampaigns", (req, res) => {
  corsHandler(req, res, async () => {
    try {
      const { getCampaigns } = await import("./firestore");
      const campaigns = await getCampaigns();
      res.status(200).json(campaigns);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch campaigns" });
    }
  });
});

// ─── POST /campaigns ─────────────────────────────────────────
functions.http("createCampaign", (req, res) => {
  corsHandler(req, res, async () => {
    try {
      const { createCampaign } = await import("./firestore");
      await createCampaign(req.body);
      res.status(200).json({ status: "created" });
    } catch (error) {
      res.status(500).json({ error: "Failed to create campaign" });
    }
  });
});

// ─── POST /evaluate ──────────────────────────────────────────
functions.http("evaluate", (req, res) => {
  corsHandler(req, res, async () => {
    try {
      const { evaluateABTest } = await import("./orchestrator");
      const result = await evaluateABTest(req.body.assetA, req.body.assetB);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: "Evaluation failed" });
    }
  });
});

// ─── GET /health ──────────────────────────────────────────────
functions.http("health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── POST /tts (Text-to-Speech) ───────────────────────────────
functions.http("tts", (req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Use POST" });
      return;
    }
    try {
      const { text, languageCode, voiceName } = req.body as { 
        text?: string; 
        languageCode?: string; 
        voiceName?: string;
      };
      
      if (!text || typeof text !== "string") {
        res.status(400).json({ error: "'text' required (string)" });
        return;
      }

      const { generateSpeech } = await import("./vertex-ai-client");
      const { audioBase64, mimeType } = await generateSpeech(text, { languageCode, voiceName });
      
      // Upload to Cloud Storage
      const { Storage } = await import("@google-cloud/storage");
      const storage = new Storage();
      const bucket = storage.bucket(process.env.ASSETS_BUCKET || "tutorai-e39uu-assets");
      const filename = `audio/tts-${Date.now()}.mp3`;
      const blob = bucket.file(filename);
      
      const audioBuffer = Buffer.from(audioBase64, "base64");
      await blob.save(audioBuffer, {
        metadata: {
          contentType: mimeType,
          cacheControl: "public, max-age=31536000",
        },
      });
      await blob.makePublic();
      
      const audioUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
      
      res.status(200).json({ 
        success: true, 
        audioUrl,
        mimeType,
        textLength: text.length,
      });
    } catch (error) {
      console.error("TTS error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "TTS failed" });
    }
  });
});
