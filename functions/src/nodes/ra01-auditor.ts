import { BaseNode, NodeContext, NodeOutput } from "./base-node";
import { generateWithGrounding } from "../vertex-ai-client";
import { appendLog } from "../firestore";

export class RA01AuthorityAuditor extends BaseNode {
  constructor() {
    super({
      id: "RA-01",
      name: "Authority Auditor",
      description: "Wettbewerbsanalyse mit Echtzeit-Daten",
    });
  }

  async process(context: NodeContext): Promise<NodeOutput> {
    const { sessionId, intent } = context;

    await appendLog(sessionId, {
      level: "info",
      source: "RA-01",
      message: "Konkurrenz-Audit — Echtzeit-Marktdaten laden...",
    });

    const prompt = `Du bist ein Marktforscher und Wettbewerbsanalyst.

    Kampagne: "${intent}"

    Führe eine gründliche Wettbewerbsanalyse durch:
    1. Identifiziere die 3-5 wichtigsten Konkurrenten
    2. Analysiere ihre aktuellen Marketingstrategien
    3. Finde Lücken im Markt (Market Gaps)
    4. Bewerte die Autorität jedes Konkurrenten
    5. Empfehle eine Differenzierungsstrategie

    Nutze aktuelle Daten. Sei faktenbasiert.`;

    const { text, sources } = await generateWithGrounding(prompt);

    await appendLog(sessionId, {
      level: "info",
      source: "RA-01",
      message: `Audit abgeschlossen. ${sources.length} Quellen verifiziert.`,
    });

    return { success: true, data: text, assetType: "research_report", assetTitle: "Competitive Intelligence Report", sources };
  }
}
