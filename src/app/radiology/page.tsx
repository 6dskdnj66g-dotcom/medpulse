"use client";
import React, { useState, useRef } from "react";
import { Upload, FileImage, Loader2, FileText, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";

export default function RadiologyPage() {
  const { lang, dir } = useLanguage();
  const isAr = lang === "ar";
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [report, setReport] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImagePreview(dataUrl);
      setImageBase64(dataUrl);
      setReport(""); // reset
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!imageBase64) return;
    setLoading(true);
    setReport("");
    
    try {
      const response = await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64 })
      });

      if (!response.ok) {
        throw new Error("Failed to analyze image");
      }

      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            
            // Basic SSE parsing: look for lines starting with "data: "
            const lines = chunk.split('\n');
            let textToAppend = '';
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataRaw = line.slice(6).trim();
                if (dataRaw === '[DONE]') {
                  done = true;
                  break;
                }
                
                try {
                  const data = JSON.parse(dataRaw);
                  if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
                    const text = data.candidates[0].content.parts[0].text;
                    if (text) {
                      textToAppend += text;
                    }
                  }
                } catch (e) {
                  // Wait for complete JSON chunk if broken
                  console.warn("Incomplete chunk parsed", e);
                }
              }
            }
            
            if (textToAppend) {
              setReport((prev) => prev + textToAppend);
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      setReport(isAr ? "حدث خطأ أثناء تحليل الصورة." : "An error occurred while analyzing the image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8" dir={dir}>
      <h1 className="text-3xl font-extrabold mb-6 flex items-center gap-3">
        <FileImage className="w-8 h-8 text-[var(--color-medical-indigo)]" />
        {isAr ? "تحليل الأشعة (Radiology AI)" : "Radiology Vision AI"}
      </h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="medpulse-card p-6 border border-[var(--border-subtle)] rounded-2xl bg-[var(--bg-1)]">
          <h2 className="text-xl font-bold mb-4">{isAr ? "رفع صورة الأشعة" : "Upload Image"}</h2>
          
          <div 
            className="border-2 border-dashed border-[var(--border-subtle)] rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[var(--color-medical-indigo)] hover:bg-[var(--bg-2)] transition-colors min-h-[300px]"
            onClick={() => fileInputRef.current?.click()}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="max-h-[250px] object-contain rounded-lg" />
            ) : (
              <div className="text-center">
                <Upload className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
                <p className="text-[var(--text-secondary)] font-medium">
                  {isAr ? "انقر لاختيار صورة (X-ray/MRI)" : "Click to select an image (X-ray/MRI)"}
                </p>
              </div>
            )}
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileChange}
            />
          </div>

          <button
            className="mt-6 w-full py-4 rounded-xl bg-[var(--color-medical-indigo)] text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2"
            disabled={!imageBase64 || loading}
            onClick={handleAnalyze}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
            {isAr ? (loading ? "جاري التحليل..." : "تحليل الصورة") : (loading ? "Analyzing..." : "Analyze Image")}
          </button>
        </div>

        {/* Report Section */}
        <div className="medpulse-card p-6 border border-[var(--border-subtle)] rounded-2xl bg-[var(--bg-1)] min-h-[400px]">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[var(--semantic-success)]" />
            {isAr ? "التقرير السريري" : "Clinical Report"}
          </h2>
          
          <div className="bg-[var(--bg-2)] p-4 rounded-xl flex-1 mt-2 min-h-[300px] whitespace-pre-wrap font-mono text-sm leading-relaxed overflow-auto">
            {report || (
              <span className="text-[var(--text-tertiary)] italic">
                {isAr ? "سيظهر التقرير هنا..." : "Report will appear here..."}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}