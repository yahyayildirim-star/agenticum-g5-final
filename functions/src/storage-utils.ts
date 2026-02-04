import { Storage } from "@google-cloud/storage";

const storage = new Storage();
const BUCKET_NAME = process.env.ASSETS_BUCKET || "tutorai-e39uu-assets";

/**
 * Uploads an image to Cloud Storage and returns the public URL
 */
export async function uploadImageToStorage(
  imageBase64: string,
  mimeType: string,
  sessionId: string,
  filename: string
): Promise<string> {
  const bucket = storage.bucket(BUCKET_NAME);
  const blob = bucket.file(`images/${sessionId}/${filename}`);
  
  // Decode base64 to buffer
  const imageBuffer = Buffer.from(imageBase64, "base64");
  
  // Upload to Cloud Storage
  await blob.save(imageBuffer, {
    metadata: {
      contentType: mimeType,
      cacheControl: "public, max-age=31536000",
    },
  });
  
  // Make publicly accessible
  await blob.makePublic();
  
  // Return public URL
  return `https://storage.googleapis.com/${BUCKET_NAME}/images/${sessionId}/${filename}`;
}
