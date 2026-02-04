import { appendLog, updateNodeStatus } from "../firestore";

export interface NodeConfig {
  id: string;
  name: string;
  description: string;
}

export interface NodeContext {
  sessionId: string;
  intent: string;
  previousOutputs: Record<string, string>;
}

export interface NodeOutput {
  success: boolean;
  data: string;
  assetType: string;
  assetTitle: string;
  sources?: string[];
  imageData?: {
    url?: string;        // Cloud Storage URL
    base64?: string;     // Legacy base64 (not used)
    mimeType?: string;   // Legacy mime type
    prompt: string;      // The prompt used to generate
  };
}

export abstract class BaseNode {
  config: NodeConfig;

  constructor(config: NodeConfig) {
    this.config = config;
  }

  async execute(context: NodeContext): Promise<NodeOutput> {
    const { sessionId } = context;

    await updateNodeStatus(sessionId, this.config.id, "initializing", 0);
    await appendLog(sessionId, {
      level: "node",
      source: this.config.id,
      message: `[${this.config.id}] ${this.config.name} initialisiert...`,
    });

    try {
      await updateNodeStatus(sessionId, this.config.id, "running", 25);
      await appendLog(sessionId, {
        level: "node",
        source: this.config.id,
        message: `[${this.config.id}] Verarbeitung gestartet.`,
      });

      const output = await this.process(context);

      await updateNodeStatus(sessionId, this.config.id, "completed", 100, output.data);
      await appendLog(sessionId, {
        level: "success",
        source: this.config.id,
        message: `[${this.config.id}] Erfolgreich. Asset: "${output.assetTitle}"`,
      });

      return output;
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unbekannter Fehler";
      await updateNodeStatus(sessionId, this.config.id, "error", 0);
      await appendLog(sessionId, {
        level: "error",
        source: this.config.id,
        message: `[${this.config.id}] FEHLER: ${msg}`,
      });
      return { success: false, data: msg, assetType: "error", assetTitle: `${this.config.id} Error` };
    }
  }

  abstract process(context: NodeContext): Promise<NodeOutput>;
}
