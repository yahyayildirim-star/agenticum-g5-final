import { Firestore } from "@google-cloud/firestore";
import { appendLog } from "./firestore";

const firestore = new Firestore();

export interface MemoryEntry {
  id?: string;
  type: "insight" | "feedback" | "fact";
  content: string;
  sourceSessionId: string;
  relevanceTags: string[];
  createdAt: number;
}

/**
 * Saves a new piece of intelligence to the global memory bank
 */
export async function saveToMemory(sessionId: string, entry: MemoryEntry) {
  const memoryDoc = firestore.collection("memory_bank").doc();
  const data = {
    ...entry,
    createdAt: Date.now(),
    id: memoryDoc.id
  };
  
  await memoryDoc.set(data);
  
  await appendLog(sessionId, {
    level: "system",
    source: "MEMORY",
    message: `[MEMORY] New ${entry.type} archived: ${entry.content.substring(0, 50)}...`
  });
}

/**
 * Retrieves relevant context based on search tags
 */
export async function queryMemory(tags: string[]): Promise<MemoryEntry[]> {
  const coll = firestore.collection("memory_bank");
  // Simple tag-based query for now. In a full enterprise build, this would use Vector Search.
  const snapshot = await coll.where("relevanceTags", "array-contains-any", tags)
    .orderBy("createdAt", "desc")
    .limit(5)
    .get();
    
  return snapshot.docs.map(doc => doc.data() as MemoryEntry);
}

/**
 * Retrieves the global Brand DNA
 */
export async function getBrandDNA(): Promise<string> {
  const doc = await firestore.collection("settings").doc("brand_dna").get();
  if (!doc.exists) {
    return "Default AGENTICUM G5 Brand Guidelines: High-end, autonomous, professional, sci-fi aesthetic.";
  }
  return doc.data()?.content || "";
}
