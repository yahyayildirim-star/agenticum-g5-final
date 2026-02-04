import { BaseNode, NodeContext, NodeOutput } from "./base-node";
import { generateWithGrounding } from "../vertex-ai-client";
import { appendLog } from "../firestore";

export class SP01CampaignStrategist extends BaseNode {
  constructor() {
    super({
      id: "SP-01",
      name: "Campaign Strategist",
      description: "Erstellt Marketingstrategien mit Google Search Grounding",
    });
  }

  async process(context: NodeContext): Promise<NodeOutput> {
    const { sessionId, intent } = context;

    await appendLog(sessionId, {
      level: "info",
      source: "SP-01",
      message: "Google Search Grounding aktiviert — Marktdaten sammeln...",
    });

    const prompt = `Du bist ein erfahrener Marketing-Stratege.
    Erstelle eine detaillierte Marketingstrategie für: "${intent}"

    Erstelle:
    1. Zielaudienz-Analyse
    2. Wettbewerbsanalyse (nutze aktuelle Marktdaten)
    3. Kernbotschaften (3-5 Stück)
    4. Kanalstrategie (welche Plattformen, wieso)
    5. Content-Kalender (1 Monat)
    6. KPI & Erfolgsmetriken

    Sei spezifisch und actionbar.`;

    const { text, sources } = await generateWithGrounding(prompt);

    await appendLog(sessionId, {
      level: "info",
      source: "SP-01",
      message: `Strategie generiert. ${sources.length} Quellen gefunden.`,
    });

    return { success: true, data: text, assetType: "strategy", assetTitle: "Marketing Strategy", sources };
  }
}
