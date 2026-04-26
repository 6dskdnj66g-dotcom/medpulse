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
        : "Analyze this radiology image (X-ray/MRI). Provide a structured clinical radiology report including Findings, Impression, and Recommendations.";

    // Strip data url prefix if present
    const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const result = await streamText({
      model: google("gemini-2.0-flash"),
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

