import { BaseNode, NodeContext, NodeOutput } from "./base-node";
import { generateWithGemini } from "../vertex-ai-client";
import { appendLog } from "../firestore";
import { Storage } from "@google-cloud/storage";

const PROJECT_ID = "tutorai-e39uu";
const LOCATION = "us-central1";

export class CC06VideoDirector extends BaseNode {
  constructor() {
    super({
      id: "CC-06",
      name: "Video Director",
      description: "Generates video concepts and creates videos with Veo 2",
    });
  }

  async process(context: NodeContext): Promise<NodeOutput> {
    const { sessionId, intent, previousOutputs } = context;
    const strategyContext = previousOutputs["SP-01"] || "";

    await appendLog(sessionId, {
      level: "info",
      source: "CC-06",
      message: "Creating video concept based on strategy...",
    });

    // Step 1: Generate video concept with Gemini
    const conceptPrompt = `You are a creative Video Director for cinematic marketing videos.

    Campaign: "${intent}"
    ${strategyContext ? `\nStrategy Context:\n${strategyContext.slice(0, 600)}` : ""}

    Create:
    1. A 5-second video concept (one powerful scene)
    2. An optimized Veo 2 prompt (max 100 words, highly cinematic)
    3. Suggested music/soundscape description
    4. Text overlay suggestion

    IMPORTANT: The Veo prompt should be SHORT, CINEMATIC, and VISUAL. Focus on one scene.
    Example format: "Cinematic aerial shot of a modern glass skyscraper at golden hour, drone smoothly ascending, lens flare from setting sun, 4K HDR quality"`;

    const videoConceptText = await generateWithGemini(conceptPrompt);

    await appendLog(sessionId, {
      level: "info",
      source: "CC-06",
      message: "Video concept ready. Extracting Veo 2 prompt...",
    });

    // Step 2: Extract clean Veo prompt
    const extractPrompt = `From this video concept, extract ONLY the Veo 2 prompt as a single, optimized sentence for video generation (max 80 words, no markdown, no explanation):

${videoConceptText}

Return ONLY the video prompt, nothing else.`;

    const veoPrompt = await generateWithGemini(extractPrompt);

    await appendLog(sessionId, {
      level: "info",
      source: "CC-06",
      message: `Veo 2 generating: "${veoPrompt.slice(0, 60)}..."`,
    });

    // Step 3: Generate video with Veo 2
    let videoUrl: string | null = null;
    let videoError: string | null = null;

    try {
      const { GoogleAuth } = await import("google-auth-library");
      const auth = new GoogleAuth({
        scopes: ["https://www.googleapis.com/auth/cloud-platform"],
      });
      const client = await auth.getClient();
      const token = await client.getAccessToken();

      // Veo 2 API endpoint - using v1beta1 for better model compatibility
      const endpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1beta1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/veo-2.0-generate-001:predictLongRunning`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instances: [{
            prompt: veoPrompt,
          }],
          parameters: {
            aspectRatio: "16:9",
            durationSeconds: 5,
            sampleCount: 1,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Veo API error: ${response.status} - ${errorText.substring(0, 200)}`);
      }

      const operationData = await response.json();
      
      // Veo returns a long-running operation - we'll poll for completion
      await appendLog(sessionId, {
        level: "info", 
        source: "CC-06",
        message: "Video generation started. Waiting for completion...",
      });

      // Poll for operation completion
      const operationName = operationData.name;
      let videoResult = null;
      
      for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 6000)); // Wait 6 seconds
        
        try {
          const pollResponse = await fetch(
            `https://${LOCATION}-aiplatform.googleapis.com/v1beta1/${operationName}`,
            {
              headers: { Authorization: `Bearer ${token.token}` },
            }
          );
          
          if (!pollResponse.ok) {
             const errText = await pollResponse.text();
             console.error(`Poll error ${pollResponse.status}: ${errText.substring(0, 100)}`);
             continue; // Try again
          }

          const pollData = await pollResponse.json();
          
          if (pollData.done) {
            videoResult = pollData.response;
            break;
          }
        } catch (pollErr) {
          console.error("Polling fetch error:", pollErr);
        }
        
        await appendLog(sessionId, {
          level: "info",
          source: "CC-06", 
          message: `Video rendering... ~${(i + 1) * 6}s elapsed`,
        });
      }

      if (videoResult?.predictions?.[0]?.video) {
        // Upload video to Cloud Storage
        const storage = new Storage();
        const bucket = storage.bucket(process.env.ASSETS_BUCKET || "tutorai-e39uu-assets");
        const filename = `videos/${sessionId}/video-${Date.now()}.mp4`;
        const blob = bucket.file(filename);
        
        const videoBuffer = Buffer.from(videoResult.predictions[0].video, "base64");
        await blob.save(videoBuffer, {
          metadata: {
            contentType: "video/mp4",
            cacheControl: "public, max-age=31536000",
          },
        });
        await blob.makePublic();
        
        videoUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
        
        await appendLog(sessionId, {
          level: "success",
          source: "CC-06",
          message: `🎬 Video generated and uploaded: ${videoUrl}`,
        });
      } else {
        throw new Error("Video generation timed out or returned no data");
      }

    } catch (error) {
      videoError = error instanceof Error ? error.message : "Unknown error";
      await appendLog(sessionId, {
        level: "warning",
        source: "CC-06",
        message: `Video generation failed: ${videoError}. Returning concept only.`,
      });
    }

    // Compose final output
    const finalOutput = videoUrl
      ? `${videoConceptText}\n\n---\n\n## 🎬 GENERATED VIDEO\n\n**Veo 2 Prompt:** ${veoPrompt}\n\n**Video URL:** ${videoUrl}`
      : `${videoConceptText}\n\n---\n\n## ⚠️ Video Generation Note\n\nVeo 2 was unable to generate the video. Prompt for manual generation:\n\n"${veoPrompt}"`;

    await appendLog(sessionId, {
      level: "success",
      source: "CC-06",
      message: videoUrl ? "Video Concept & AI Video delivered!" : "Video Concept delivered (no video generated).",
    });

    return {
      success: true,
      data: finalOutput,
      assetType: "video_prompt",
      assetTitle: videoUrl ? "Video Concept + AI Video" : "Video Script & Veo Prompts",
      // Store video data similar to images
      imageData: videoUrl ? {
        url: videoUrl,
        prompt: veoPrompt,
      } : undefined,
    };
  }
}
