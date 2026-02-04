import { BaseNode, NodeContext, NodeOutput } from "./base-node";
import { generateWithGemini } from "../vertex-ai-client";
import { appendLog } from "../firestore";

export class CC06VideoDirector extends BaseNode {
  constructor() {
    super({
      id: "CC-06",
      name: "Video Director",
      description: "Generiert Videoscripts und Veo-Prompts",
    });
  }

  async process(context: NodeContext): Promise<NodeOutput> {
    const { sessionId, intent, previousOutputs } = context;
    const strategyContext = previousOutputs["SP-01"] || "";

    await appendLog(sessionId, {
      level: "info",
      source: "CC-06",
      message: "Video-Konzept auf Basis der Strategie erstellen...",
    });

    const prompt = `Du bist ein kreativer Videodirektor für Google's Veo-Videomodell.

    Kampagne: "${intent}"
    ${strategyContext ? `\nStrategie-Kontext:\n${strategyContext.slice(0, 600)}` : ""}

    Erstelle:
    1. Ein 30-Sekunden Video-Konzept (Szene-für-Szene)
    2. Einen optimierten Veo-Prompt für jede Szene (max 3 Szenen)
    3. Vorgeschlagene Musik/Soundscape
    4. Text-Overlays und CTAs

    Veo-Prompts: visuell detailliert, atmosphärisch, cinematisch.`;

    const videoScript = await generateWithGemini(prompt);

    await appendLog(sessionId, {
      level: "info",
      source: "CC-06",
      message: "Video-Konzept und Veo-Prompts generiert.",
    });

    return { success: true, data: videoScript, assetType: "video_prompt", assetTitle: "Video Script & Veo Prompts" };
  }
}
