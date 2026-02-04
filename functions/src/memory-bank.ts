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
  
  // Simplified query: just get by tags, sort in memory to avoid composite index requirement
  try {
    const snapshot = await coll.where("relevanceTags", "array-contains-any", tags)
      .limit(10)
      .get();
      
    const entries = snapshot.docs.map(doc => doc.data() as MemoryEntry);
    
    // Sort in memory by createdAt descending
    entries.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    
    return entries.slice(0, 5);
  } catch (error) {
    // If query fails (no data or other issue), return empty array gracefully
    console.warn("Memory query failed, returning empty:", error);
    return [];
  }
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
