import { VertexAI } from "@google-cloud/vertexai";

const PROJECT_ID = "tutorai-e39uu";
const LOCATION = "us-central1";

const vertexAI = new VertexAI({
  project: PROJECT_ID,
  location: LOCATION,
});

// ─── Standard Generation ─────────────────────────────────────
export async function generateWithGemini(prompt: string): Promise<string> {
  const model = vertexAI.getGenerativeModel({
    model: "gemini-2.0-flash",
  });

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned no text response");
  return text;
}

// ─── Thinking Mode ───────────────────────────────────────────
export async function generateWithThinking(prompt: string): Promise<{
  thinking: string;
  response: string;
}> {
  const model = vertexAI.getGenerativeModel({
    model: "gemini-2.0-flash",
  });

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  const parts = result.response.candidates?.[0]?.content?.parts || [];
  let thinking = "";
  let response = "";

  for (const part of parts) {
    if ("text" in part && part.text) {
      response = part.text;
    }
  }

  thinking = "Thinking process (Simplified for Stability)...";
  return { thinking, response };
}

// ─── Google Search Grounding ─────────────────────────────────
export async function generateWithGrounding(prompt: string): Promise<{
  text: string;
  sources: string[];
}> {
  const model = vertexAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    // @ts-expect-error - googleSearch is the new API, types not updated yet
    tools: [{ googleSearch: {} }],
  });

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  const candidate = result.response.candidates?.[0];
  const text = candidate?.content?.parts?.[0]?.text || "";

  const sources: string[] = [];
  const chunks = (candidate as any)?.groundingMetadata as {
    groundingChunks?: Array<{ web?: { uri?: string } }>;
  } | undefined;

  if (chunks?.groundingChunks) {
    for (const chunk of chunks.groundingChunks) {
      if (chunk.web?.uri) sources.push(chunk.web.uri);
    }
  }

  return { text, sources };
}

// ─── Imagen 3 Image Generation ───────────────────────────────
export async function generateImage(prompt: string): Promise<{
  imageBase64: string;
  mimeType: string;
}> {
  const { GoogleAuth } = await import("google-auth-library");
  const auth = new GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();

  const endpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/imagen-3.0-generate-002:predict`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: {
        sampleCount: 1,
        aspectRatio: "16:9",
        safetyFilterLevel: "block_few",
        personGeneration: "allow_adult",
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Imagen API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const prediction = data.predictions?.[0];
  
  if (!prediction?.bytesBase64Encoded) {
    throw new Error("Imagen returned no image");
  }

  return {
    imageBase64: prediction.bytesBase64Encoded,
    mimeType: prediction.mimeType || "image/png",
  };
}
