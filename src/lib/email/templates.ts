// src/lib/email/templates.ts

export interface ReminderEmailProps {
  userName: string;
  lang?: "ar" | "en";
  stats: {
    pendingFlashcards: number;
    incompleteOsce: number;
    lastStudyDate: string;
  };
  ctaLink: string;
}

/**
 * Generates a stunning, 3D-inspired HTML email template for MedPulse reminders.
 * Fully responsive and uses inline CSS for maximum compatibility with Gmail & Apple Mail.
 */
export function generateStudyReminderEmail({
  userName,
  lang = "ar",
  stats,
  ctaLink,
}: ReminderEmailProps): string {
  const isAr = lang === "ar";
  const dir = isAr ? "rtl" : "ltr";
  
  // Brand colors
  const primary = "#6366f1"; // Indigo
  const secondary = "#14b8a6"; // Teal
  const bg = "#f3f4f6";
  const cardBg = "#ffffff";
  const textDark = "#1f2937";
  const textLight = "#6b7280";

  // Strings
  const strings = {
    subject: isAr ? "كيف تسير دراستك الطبية؟ 🩺" : "How are your medical classes going? 🩺",
    greeting: isAr ? `أهلاً د. ${userName}،` : `Hello Dr. ${userName},`,
    headline: isAr ? "حان وقت استئناف التدريب السريري" : "Time to resume your clinical training",
    subheadline: isAr 
      ? "الاستمرارية هي مفتاح التفوق في الطب. لقد لاحظنا غيابك القصير، وهناك مهام متبقية بانتظارك في المنصة لتأمين تفوقك."
      : "Consistency is key in medicine. We noticed your short absence, and you have pending tasks waiting to secure your excellence.",
    statsTitle: isAr ? "ملخص مهامك الحالية:" : "Your Current Tasks Summary:",
    flashcards: isAr ? "بطاقات ذكية للمراجعة (SRS)" : "Smart Flashcards to review (SRS)",
    osce: isAr ? "محطات أوسكي غير مكتملة" : "Incomplete OSCE stations",
    lastSeen: isAr ? "آخر تسجيل دخول:" : "Last login:",
    cta: isAr ? "ابدأ جلسة المذاكرة الآن" : "Start Study Session Now",
    footer: isAr 
      ? "MedPulse AI — منصتك السريرية الذكية. صُمم بحب للمجال الطبي." 
      : "MedPulse AI — Your clinical intelligence platform. Built with passion for medicine.",
    unsubscribe: isAr ? "إلغاء الاشتراك" : "Unsubscribe"
  };

  return `
<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${strings.subject}</title>
  <!-- Fallback font styles for email clients -->
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; }
    
    /* Responsive styling */
    @media screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 10px !important; }
      .card { border-radius: 16px !important; padding: 24px 16px !important; }
      .header-title { font-size: 24px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${bg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  
  <!-- Background wrapper -->
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: ${bg}; padding: 40px 0;">
    <tr>
      <td align="center">
        
        <!-- Main Container -->
        <table class="container" width="600" border="0" cellpadding="0" cellspacing="0" style="background-color: transparent; margin: 0 auto;">
          <tr>
            <td align="center" style="padding-bottom: 20px;">
              <!-- Logo / Brand Header -->
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background: linear-gradient(135deg, ${primary}, ${secondary}); padding: 12px; border-radius: 12px; box-shadow: 0 4px 14px rgba(99,102,241,0.3);">
                    <img src="https://img.icons8.com/ios-filled/50/ffffff/activity.png" width="28" height="28" alt="Logo" style="display: block; border: 0;" />
                  </td>
                  <td style="padding-${isAr ? 'right' : 'left'}: 12px;">
                    <span style="font-size: 22px; font-weight: 900; color: ${textDark}; text-transform: uppercase; letter-spacing: -0.5px;">MedPulse <span style="color: ${primary};">AI</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Inner Card (Glassmorphism & 3D feel) -->
          <tr>
            <td align="center">
              <table class="card" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: ${cardBg}; border-radius: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.05); overflow: hidden;">
                
                <!-- Hero Image Placeholder (3D abstract gradient) -->
                <tr>
                  <td style="background: linear-gradient(120deg, #f8fafc, #e2e8f0); height: 160px; text-align: center; border-bottom: 1px solid #f1f5f9;">
                    <!-- Placeholder for a 3D medical graphic -->
                    <img src="https://img.icons8.com/fluency/96/stethoscope.png" width="80" height="80" alt="Medical 3D" style="display: inline-block; filter: drop-shadow(0 10px 10px rgba(0,0,0,0.1)); transform: translateY(10px);" />
                  </td>
                </tr>

                <!-- Content Area -->
                <tr>
                  <td style="padding: 40px 32px;" dir="${dir}">
                    
                    <h1 class="header-title" style="margin: 0 0 16px 0; font-size: 28px; font-weight: 800; color: ${textDark}; line-height: 1.2;">
                      ${strings.headline}
                    </h1>
                    
                    <p style="margin: 0 0 32px 0; font-size: 16px; color: ${textLight}; line-height: 1.6;">
                      ${strings.greeting} ${strings.subheadline}
                    </p>

                    <!-- Reminders / Notifications Blocks (Parallel layout) -->
                    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                      <tr>
                        <td style="padding-bottom: 12px;">
                          <h3 style="margin: 0; font-size: 14px; font-weight: 700; color: ${textDark}; text-transform: uppercase; letter-spacing: 0.5px;">${strings.statsTitle}</h3>
                        </td>
                      </tr>
                      
                      <!-- Stat Block 1 -->
                      <tr>
                        <td style="padding: 16px; background-color: #f8fafc; border-radius: 12px; margin-bottom: 12px; display: block; border-left: 4px solid ${primary};">
                          <table width="100%" border="0" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="40" style="font-size: 24px;">🧠</td>
                              <td style="font-size: 15px; font-weight: 600; color: ${textDark};">${stats.pendingFlashcards} <span style="font-weight: 400; color: ${textLight};">${strings.flashcards}</span></td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- Stat Block 2 -->
                      <tr>
                        <td style="padding: 16px; background-color: #f8fafc; border-radius: 12px; margin-bottom: 12px; display: block; border-left: 4px solid ${secondary}; margin-top: 10px;">
                          <table width="100%" border="0" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="40" style="font-size: 24px;">🩺</td>
                              <td style="font-size: 15px; font-weight: 600; color: ${textDark};">${stats.incompleteOsce} <span style="font-weight: 400; color: ${textLight};">${strings.osce}</span></td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                    </table>

                    <!-- Call To Action Button -->
                    <table width="100%" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <a href="${ctaLink}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, ${primary}, ${secondary}); color: #ffffff; font-size: 16px; font-weight: 700; text-decoration: none; border-radius: 50px; box-shadow: 0 10px 20px rgba(99,102,241,0.25); transition: transform 0.2s;">
                            ${strings.cta}
                          </a>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 24px;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #9ca3af;">
                ${strings.lastSeen} ${stats.lastStudyDate}
              </p>
              <p style="margin: 0 0 12px 0; font-size: 12px; color: #9ca3af; line-height: 1.5; max-width: 400px;">
                ${strings.footer}
              </p>
              <a href="${ctaLink}/unsubscribe" style="font-size: 11px; color: ${primary}; text-decoration: underline;">
                ${strings.unsubscribe}
              </a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
