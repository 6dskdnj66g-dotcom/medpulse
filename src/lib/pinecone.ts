// Pinecone adapter - gracefully handles missing configuration
// The vector store is optional for local development.
// When PINECONE_API_KEY is set, real RAG queries are made.
// When missing, the system falls back to the AI model's knowledge with
// the zero-hallucination prompt.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let medicalIndexInstance: any = null;

export async function getMedicalIndex() {
  if (!process.env.PINECONE_API_KEY) {
    return null;
  }

  if (!medicalIndexInstance) {
    const { Pinecone } = await import('@pinecone-database/pinecone');
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    medicalIndexInstance = pinecone.index('medpulse-vectors');
  }

  return medicalIndexInstance;
}

export async function checkVectorStoreConnection(): Promise<boolean> {
  try {
    const index = await getMedicalIndex();
    if (!index) return false;
    await index.describeIndexStats();
    return true;
  } catch (error) {
    console.warn("Vector Store unavailable, using fallback mode:", error);
    return false;
  }
}
