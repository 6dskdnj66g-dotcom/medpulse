
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

const google = createGoogleGenerativeAI({
  apiKey: 'AIzaSyDKBRj-qaSgS5Dyfg5GlMb8mHJiUAwGjcY'
});

async function testAI() {
  console.log("Starting test...");
  try {
    const { text } = await generateText({
      model: google('gemini-2.0-flash-001'),
      prompt: "What is 2+2?",
    });
    console.log('Response:', text);
  } catch (error) {
    console.log('Error:', error.message);
  }
}

testAI();
