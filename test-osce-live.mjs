import { spawn } from 'child_process';

async function run() {
  console.log("Starting production Next.js server on port 3033...");
  const server = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['start', '--', '-p', '3033']);
  
  // Wait to let nextjs server start up completely
  await new Promise(r => setTimeout(r, 8000)); 

  console.log("\n==========================================");
  console.log("🩺 إرسال رسالة ترحيبية للمريض (IM-01)...");
  console.log("==========================================\n");

  const query = "مرحبا، هل يمكن أن تخبرني باسمك وما الذي تعاني منه اليوم؟";
  console.log(`🗣️ الطالب: ${query}\n`);
  
  try {
      // Use dynamic import for node-fetch if available, or just global fetch in node 18+
      const res = await fetch('http://localhost:3033/api/osce/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              messages: [{ role: 'user', content: query }],
              stationId: 'IM-01',
              mode: 'patient'
          })
      });

      if (!res.ok) {
          console.error("HTTP Error:", res.status, await res.text());
      } else {
          const data = await res.json();
          console.log(`🤖 المريض: ${data.content}\n`);
      }
  } catch (e) {
      console.error("فشل الاتصال بالخادم:", e.message);
  }
  
  console.log("Shutting down... Test Complete.");
  server.kill();
  process.exit(0);
}

run();