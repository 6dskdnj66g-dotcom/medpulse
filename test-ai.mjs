
console.log("Starting test-ai.mjs...");
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

const google = createGoogleGenerativeAI({
  apiKey: 'AIzaSyDKBRj-qaSgS5Dyfg5GlMb8mHJiUAwGjcY'
});

async function testAI() {
  console.log("Inside testAI function...");
  const MEDICAL_CASE = `
    Patient: 45-year-old male
    Symptoms: Persistent substernal chest pain radiating to left jaw, started 30 mins ago.
    History: Hypertension, Smoker (20 pack-years).
    Vitals: BP 150/95, HR 92, SpO2 96% on room air.
    ECG: ST-segment elevation in leads II, III, and aVF.
    
    Task: Provide a clinical diagnosis, immediate management steps, and citation for the standard of care.
  `;

  console.log("Testing AI with Medical Case...");
  try {
    const { text } = await generateText({
      model: google('gemini-2.0-flash-001'),
      system: "You are an elite clinical medical AI. Provide evidence-based responses only.",
      prompt: MEDICAL_CASE,
    });
    console.log('--- AI Response ---');
    console.log(text);
    console.log('-------------------');
  } catch (error) {
    console.log('AI Error Details:', JSON.stringify(error, null, 2));
  }
}

testAI().then(() => console.log("Done."));
