import { NextRequest } from "next/server";
import { streamText } from "ai";
import { google } from "@ai-sdk/google";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, prompt } = await req.json();

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return new Response(JSON.stringify({ error: "Missing or invalid image" }), { status: 400 });
    }

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI vision service not configured" }),
        { status: 503 }
      );
    }

    const defaultPrompt =
      prompt && typeof prompt === "string" && prompt.trim().length > 0
        ? prompt.trim().slice(0, 2000)
        : `You are a world-class AI Radiologist operating strictly under ACR (American College of Radiology) appropriateness criteria and standard radiological reporting guidelines.
Analyze the provided medical image (X-Ray, CT, MRI, Ultrasound, etc.).
Provide a highly structured, professional clinical radiology report including:

1. Modality & Quality: Identify the type of scan, view (e.g., AP, PA, Lateral), and comment on image quality/penetration.
2. Clinical Findings: Use a systematic approach (e.g., ABCDE for chest X-rays). Detail abnormalities with exact anatomical locations.
3. Impression: A concise summary of the primary diagnosis and significant secondary findings.
4. Recommendations: Evidence-based next steps or additional imaging required according to clinical guidelines.

Format the output cleanly with bold headers and bullet points. Never hallucinate findings. If the image is unclear or not a medical image, state so immediately.`;

    // Strip data url prefix if present
    const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const result = await streamText({
      model: google("gemini-2.5-flash"),
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: defaultPrompt },
            {
              type: "image",
              image: cleanBase64,
            },
          ],
        },
      ],
      temperature: 0.2,
    });

    return result.toTextStreamResponse({
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error: unknown) {
    console.error("Vision API Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to analyze image. Please try again." }),
      { status: 500 }
    );
  }
}

