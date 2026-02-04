import { BaseNode, NodeContext, NodeOutput } from "./base-node";
import { generateWithGemini, generateImage } from "../vertex-ai-client";
import { appendLog } from "../firestore";
import { uploadImageToStorage } from "../storage-utils";

export class DA03DesignArchitect extends BaseNode {
  constructor() {
    super({
      id: "DA-03",
      name: "Design Architect",
      description: "Generates high-end visual concepts and actual AI images",
    });
  }

  async process(context: NodeContext): Promise<NodeOutput> {
    const { sessionId, intent, previousOutputs } = context;

    await appendLog(sessionId, {
      level: "info",
      source: "DA-03",
      message: "Creating visual identity and generating hero image...",
    });

    const strategy = previousOutputs["SP-01"] || "General marketing approach";

    // Step 1: Generate visual concept with Gemini
    const conceptPrompt = `You are a world-class Design Architect and Creative Director.
    Based on this strategy: "${strategy}"
    And this intent: "${intent}"

    Create a visual identity concept for the campaign:
    1. Color Palette (HEX codes and mood)
    2. Typography Selection
    3. A single, detailed HERO IMAGE description (one paragraph, vivid and specific)
    4. Layout recommendations for Social Media & Web
    5. Brand Voice adaptation for visuals

    Make the HERO IMAGE description suitable for AI image generation - be specific about:
    - Style (photorealistic, 3D render, flat design, etc.)
    - Colors and lighting
    - Composition and main elements
    - Mood and atmosphere`;

    const conceptText = await generateWithGemini(conceptPrompt);

    await appendLog(sessionId, {
      level: "info",
      source: "DA-03",
      message: "Visual concept ready. Now generating hero image with Imagen 3...",
    });

    // Step 2: Extract image prompt from concept
    const imagePromptExtract = await generateWithGemini(`
      From this visual concept, extract ONLY the hero image description as a single, 
      optimized prompt for AI image generation (max 200 words, no markdown):
      
      ${conceptText}
      
      Return ONLY the image prompt, nothing else.
    `);

    let imageUrl: string | null = null;
    let imageError: string | null = null;

    // Step 3: Generate actual image with Imagen 3 and upload to Cloud Storage
    try {
      await appendLog(sessionId, {
        level: "info",
        source: "DA-03",
        message: `Imagen 3 generating: "${imagePromptExtract.slice(0, 80)}..."`,
      });

      const imageResult = await generateImage(imagePromptExtract);

      await appendLog(sessionId, {
        level: "success",
        source: "DA-03",
        message: "✨ Hero image generated! Uploading to Cloud Storage...",
      });

      // Upload to Cloud Storage instead of storing base64
      const filename = `hero-image-${Date.now()}.png`;
      imageUrl = await uploadImageToStorage(
        imageResult.imageBase64,
        imageResult.mimeType,
        sessionId,
        filename
      );

      await appendLog(sessionId, {
        level: "success",
        source: "DA-03",
        message: `🖼️ Image uploaded: ${imageUrl}`,
      });
    } catch (error) {
      imageError = error instanceof Error ? error.message : "Unknown error";
      await appendLog(sessionId, {
        level: "warning",
        source: "DA-03",
        message: `Image generation failed: ${imageError}. Returning concept only.`,
      });
    }

    // Compose final output
    const finalOutput = imageUrl
      ? `${conceptText}\n\n---\n\n## 🖼️ GENERATED HERO IMAGE\n\n**Prompt used:** ${imagePromptExtract}\n\n**Image URL:** ${imageUrl}`
      : `${conceptText}\n\n---\n\n## ⚠️ Image Generation Note\n\nImagen 3 was unable to generate the image. Prompt for manual generation:\n\n"${imagePromptExtract}"`;

    await appendLog(sessionId, {
      level: "success",
      source: "DA-03",
      message: "Visual Concept & Design Blueprints delivered.",
    });

    return {
      success: true,
      data: finalOutput,
      assetType: "design_blueprint" as any,
      assetTitle: imageUrl ? "Visual Concept + AI Hero Image" : "Visual Concept & Design Blueprints",
      // Store image URL instead of base64 data
      imageData: imageUrl ? {
        url: imageUrl,
        prompt: imagePromptExtract,
      } : undefined,
    };
  }
}

