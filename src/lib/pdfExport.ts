import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export interface ReportOptions {
  title: string;
  filename: string;
  patientId?: string;
  metadata?: Record<string, any>;
}

/**
 * Exports a clinical report to PDF with MedPulse branding
 */
export async function exportMedicalReport(elementId: string, options: ReportOptions) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error("Element not found:", elementId);
    return;
  }

  try {
    // Create a temporary container for the report header/footer to ensure professional look
    const canvas = await html2canvas(element, {
      scale: 2, // Higher resolution
      useCORS: true,
      logging: false,
      backgroundColor: document.documentElement.classList.contains("dark") ? "#0f172a" : "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth - 20; // 10mm margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // ── Add Header ──
    pdf.setFillColor(79, 70, 229); // Indigo 600
    pdf.rect(0, 0, pdfWidth, 25, "F");
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text("MedPulse AI — Clinical Report", 10, 15);
    
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Generated: ${new Date().toLocaleString()} | 2026 Standard`, 10, 20);

    // ── Report Type & Title ──
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text(options.title, 10, 35);
    
    if (options.patientId) {
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Patient ID: ${options.patientId}`, 10, 42);
    }

    // ── Horizontal Line ──
    pdf.setDrawColor(200, 200, 200);
    pdf.line(10, 45, pdfWidth - 10, 45);

    // ── Main Content Image ──
    pdf.addImage(imgData, "PNG", 10, 50, imgWidth, imgHeight);

    // ── Footer ──
    const footerY = pdfHeight - 15;
    pdf.setDrawColor(200, 200, 200);
    pdf.line(10, footerY - 5, pdfWidth - 10, footerY - 5);
    
    pdf.setTextColor(150, 150, 150);
    pdf.setFontSize(7);
    const disclaimer = "DISCLAIMER: This report is AI-generated and intended for clinical educational and assistance purposes only. It must be reviewed and signed by a licensed medical professional before being entered into official health records.";
    const splitDisclaimer = pdf.splitTextToSize(disclaimer, pdfWidth - 40);
    pdf.text(splitDisclaimer, 10, footerY);
    
    pdf.text(`Page 1 of 1 | MedPulse Clinical Suite v4.0`, pdfWidth - 50, footerY + 8);

    // Save
    pdf.save(`${options.filename}_${Date.now()}.pdf`);
    
    return true;
  } catch (error) {
    console.error("PDF Export failed:", error);
    return false;
  }
}
