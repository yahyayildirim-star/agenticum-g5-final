import * as functions from "@google-cloud/functions-framework";
import cors from "cors";
import { orchestrate } from "./orchestrator";
import { getSession } from "./firestore";

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

// ─── GET /health ──────────────────────────────────────────────
functions.http("health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});
