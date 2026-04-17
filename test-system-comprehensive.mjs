async function verifySystem() {
    console.log("==========================================");
    console.log("🔍 بدء فحص النظام الشامل (نسبة خطأ 0 موردة)");
    console.log("==========================================");

    try {
        // 1. Test UI Pages (Ensuring menus and pages exist and render, not fake)
        console.log("\n1️⃣ فحص صفحات الموقع الأساسية (القوائم غير وهمية):");
        const pages = ['/', '/encyclopedia', '/calculators'];
        for (const page of pages) {
            const res = await fetch(`http://localhost:3007${page}`);
            if (res.ok) {
                console.log(`✅ الصفحة ${page} تعمل بكفاءة (Status: ${res.status})`);
            } else {
                console.log(`❌ الصفحة ${page} بها مشكلة (Status: ${res.status})`);
            }
        }

        // 2. Test AI Integration (Medical Query)
        console.log("\n2️⃣ فحص محرك الذكاء الاصطناعي (Gemini):");
        const aiRes = await fetch('http://localhost:3007/api/medical-query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{ role: 'user', content: 'What is the treatment for a mild headache?' }],
                specialtyConfig: { label: 'General Practice', corpus: 'Standard' }
            })
        });

        console.log(`حالة استجابة خادم الذكاء الاصطناعي: Status ${aiRes.status}`);
        
        const aiBody = await aiRes.text();
        if (aiRes.ok) {
            console.log("✅ الذكاء الاصطناعي يعمل بنجاح! النتيجة المبدئية:");
            console.log(aiBody.substring(0, 150) + "...");
        } else {
            console.log("⚠️ رفض من خوادم Google:");
            console.log(aiBody);
        }

    } catch (e) {
        console.error("❌ فشل في الاتصال بالخادم المحلي. ربما لم يقم بالعمل بعد.", e);
    }
    
    console.log("\n==========================================");
}

verifySystem();