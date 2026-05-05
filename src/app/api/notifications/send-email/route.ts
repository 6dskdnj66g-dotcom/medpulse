import { NextRequest, NextResponse } from "next/server";
import { generateStudyReminderEmail } from "@/lib/email/templates";

export async function POST(req: NextRequest) {
  try {
    // Check for Resend API key
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Email service not configured. Set RESEND_API_KEY in environment." },
        { status: 503 }
      );
    }

    // Auth check — only allow from internal cron or admin
    const authHeader = req.headers.get("x-api-key");
    if (authHeader !== process.env.INTERNAL_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { to, userName, lang, stats, ctaLink } = body;

    if (!to || !userName) {
      return NextResponse.json(
        { error: "Missing required fields: to, userName" },
        { status: 400 }
      );
    }

    const html = generateStudyReminderEmail({
      userName,
      lang: lang || "ar",
      stats: stats || {
        pendingFlashcards: 0,
        incompleteOsce: 0,
        lastStudyDate: new Date().toLocaleDateString("ar-SA"),
      },
      ctaLink: ctaLink || process.env.NEXT_PUBLIC_SITE_URL || "https://medpulse.ai",
    });

    const isAr = (lang || "ar") === "ar";

    // Lazy import Resend only when needed (prevents build-time crash)
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "MedPulse AI <noreply@medpulse.ai>",
      to: [to],
      subject: isAr
        ? `كيف تسير دراستك الطبية؟ 🩺`
        : `How are your medical classes going? 🩺`,
      html,
    });

    if (error) {
      console.error("[Email Send Error]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    console.error("[Email API Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
