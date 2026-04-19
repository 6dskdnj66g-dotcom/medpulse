async function runFullExam() {
    const apiUrl = 'http://127.0.0.1:3077/api/osce/chat';
    const stationId = 'IM-01';
    let messages = [];

    async function askPatient(question) {
        console.log(`\n👨‍⚕️ الطبيب: ${question}`);
        messages.push({ role: "user", content: question });
        
        try {
            const res = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages, stationId, mode: 'patient' })
            });

            if (!res.ok) {
                console.error("❌ فشل استجابة المريض:", res.status);
                return;
            }

            const data = await res.json();
            console.log(`🤖 المريض: ${data.content}`);
            messages.push({ role: "assistant", content: data.content });
        } catch (e) {
            console.error("فشل الاتصال بالمريض:", e.message);
        }
    }

    console.log("\n==== 🏁 بدء محاكاة المريض ====");
    await askPatient("مرحبا، أنا دكتور اليوم. هل يمكن أن تخبرني باسمك وما المشكلة التي تشعر بها؟");
    await askPatient("متى بدأ هذا الألم بالضبط؟ وهل يمتد لمكان آخر مثل الذراع اليسرى أو الفك؟ وما مدى شدته من 1 إلى 10؟");
    await askPatient("هل تعاني من أي أمراض مزمنة أو تتناول أية أدوية حالياً؟ وهل أنت مدخن؟");
    await askPatient("حسناً يا عمر، لا تقلق نحن سنقوم بإنقاذك. هل تسمح لي بعمل فحص سريري سريع لقلبك وصدرك؟");
    await askPatient("من خلال الأعراض والتاريخ الطبي، أعتقد أنك تعاني من ذبحة صدرية (جلطة قلبية). سنقوم بعمل تخطيط قلب (ECG) فوراً وسنعطيك علاجاً مميعاً للدم وأكسجين.");

    console.log("\n==== 📝 طلب تقييم الممتحن (Examiner Feedback) ====\nنرسل المحادثة الكاملة لتحليلها...");
    try {
        const evalRes = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages, stationId, mode: 'examiner_feedback' })
        });
        
        const evaluation = await evalRes.json();
        
        if (evalRes.ok) {
            console.log("\n✅ نجح تحليل الممتحن وإرجاع JSON بدقة 100%! إليك التقرير:");
            console.log(`==========================================`);
            console.log(`📊 النتيجة النهائية: ${evaluation.total_score} من ${evaluation.max_score} (${evaluation.percentage}%)`);
            console.log(`⚖️ حالة النجاح: ${evaluation.pass_fail.toUpperCase()}`);
            console.log(`\n💬 تقييم الذكاء الاصطناعي المفصل:\n${evaluation.ai_feedback}`);
            
            console.log(`\n🌟 الإيجابيات (نقاط القوة):`);
            (evaluation.positives || []).forEach(p => console.log(`   - ${p}`));
            
            console.log(`\n📈 جوانب للتحسين:`);
            (evaluation.improvements || []).forEach(i => console.log(`   - ${i}`));
            console.log(`==========================================\n`);
            
        } else {
            console.error("❌ فشل التقييم الختامي:", evaluation);
        }
    } catch (err) {
        console.error("❌ فشل اتصال خادم التقييم:", err.message);
    }
}

runFullExam();