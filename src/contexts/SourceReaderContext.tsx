"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { MedicalSource } from "@/types/medical";

interface SourceReaderContextType {
  activeSource: MedicalSource | null;
  openSource: (source: MedicalSource) => void;
  closeSource: () => void;
}

const SourceReaderContext = createContext<SourceReaderContextType | undefined>(undefined);

export function SourceReaderProvider({ children }: { children: ReactNode }) {
  const [activeSource, setActiveSource] = useState<MedicalSource | null>(null);

  const openSource = (source: MedicalSource) => {
    setActiveSource(source);
    // document.body.style.overflow = "hidden"; // Optional: prevent background scrolling
  };

  const closeSource = () => {
    setActiveSource(null);
    // document.body.style.overflow = "auto";
  };

  return (
    <SourceReaderContext.Provider value={{ activeSource, openSource, closeSource }}>
      {children}
    </SourceReaderContext.Provider>
  );
}

export function useSourceReader() {
  const context = useContext(SourceReaderContext);
  if (context === undefined) {
    throw new Error("useSourceReader must be used within a SourceReaderProvider");
  }
  return context;
}
