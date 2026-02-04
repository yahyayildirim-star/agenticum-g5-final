import { Firestore, FieldValue } from "@google-cloud/firestore";

const firestore = new Firestore();

export async function createSession(sessionId: string, intent: string) {
  await firestore.collection("sessions").doc(sessionId).set({
    sessionId,
    intent,
    status: "started",
    createdAt: new Date(),
    nodes: {
      "SN-00": { status: "initializing", progress: 0 },
      "SP-01": { status: "idle", progress: 0 },
      "CC-06": { status: "idle", progress: 0 },
      "RA-01": { status: "idle", progress: 0 },
    },
    logs: [],
    assets: [],
  });
}

export async function updateNodeStatus(
  sessionId: string,
  nodeId: string,
  status: string,
  progress: number,
  output?: string
) {
  const doc = firestore.collection("sessions").doc(sessionId);
  const updateData: Record<string, unknown> = {
    [`nodes.${nodeId}.status`]: status,
    [`nodes.${nodeId}.progress`]: progress,
    [`nodes.${nodeId}.updatedAt`]: new Date(),
  };
  if (output !== undefined) {
    updateData[`nodes.${nodeId}.output`] = output;
  }
  await doc.update(updateData);
}

export async function appendLog(sessionId: string, log: {
  level: string;
  source: string;
  message: string;
}) {
  const doc = firestore.collection("sessions").doc(sessionId);
  await doc.update({
    logs: FieldValue.arrayUnion({
      ...log,
      timestamp: Date.now(),
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    }),
  });
}

export async function addAsset(sessionId: string, asset: {
  type: string;
  title: string;
  content: string;
  generatedBy: string;
  imageData?: {
    url?: string;
    base64?: string;
    mimeType?: string;
    prompt: string;
  };
}) {
  const doc = firestore.collection("sessions").doc(sessionId);
  
  // Build asset object, excluding undefined imageData (Firestore doesn't accept undefined)
  const assetData: Record<string, unknown> = {
    type: asset.type,
    title: asset.title,
    content: asset.content,
    generatedBy: asset.generatedBy,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: Date.now(),
  };
  
  // Only include imageData if it's defined
  if (asset.imageData) {
    assetData.imageData = asset.imageData;
  }
  
  await doc.update({
    assets: FieldValue.arrayUnion(assetData),
  });
}

export async function getSession(sessionId: string): Promise<Record<string, unknown> | null> {
  const doc = await firestore.collection("sessions").doc(sessionId).get();
  if (!doc.exists) return null;
  return doc.data() ?? null;
}

export async function completeSession(sessionId: string, finalResult: string) {
  await firestore.collection("sessions").doc(sessionId).update({
    status: "completed",
    finalResult,
    completedAt: new Date(),
  });
}

export async function failSession(sessionId: string, error: string) {
  await firestore.collection("sessions").doc(sessionId).update({
    status: "error",
    error,
    failedAt: new Date(),
  });
}
