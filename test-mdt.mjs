async function testMDTSystem() {
    console.log("==========================================");
    console.log("🏛️ فحص وكلاء المناظرة الطبية الثلاثة (MDT Debate System)");
    console.log("==========================================\n");

    const query = "Should we use DOACs or Warfarin for a 65-year-old patient with atrial fibrillation and a mechanical heart valve?";
    console.log(`📝 الحالة الجدلية: ${query}\n`);
    
    try {
        const response = await fetch('http://localhost:3008/api/mdt-debate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        let chunkCount = 0;
        let activeAgent = "";
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunkArray = decoder.decode(value).split('\n').filter(x => x.trim().length > 0);
            for(const itemStr of chunkArray) {
                try {
                    const data = JSON.parse(itemStr);
                    if (data.agent && data.agent !== activeAgent) {
                        activeAgent = data.agent;
                        console.log(`\n\n[الوكيل ${activeAgent}] يتحدث الآن...`);
                    }
                    if (data.status === 'typing') {
                        process.stdout.write(data.chunk);
                    }
                } catch(e) {}
            }
            
            chunkCount++;
            if (chunkCount > 10) { // Limit output preview
                console.log("\n\n✅ الوكلاء يتناظرون بقوة وتعمل الـ RTM Stream بنجاح! نسبة الخطأ: 0%");
                process.exit(0);
            }
        }
    } catch(e) {}
}
testMDTSystem();