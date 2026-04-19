async function testMedicalCase() {
    console.log("==========================================");
    console.log("🩺 إرسال حالة طبية (Medical Case) للذكاء الاصطناعي...");
    console.log("==========================================\n");

    const query = "مريض يبلغ من العمر 45 عاماً، يعاني من ألم مفاجئ في الصدر يمتد إلى الذراع الأيسر مع تعرق شديد وضيق في التنفس. ما هو التشخيص المبدئي وما هي الإجراءات الطبية الطارئة المطلوبة فوراً؟";

    console.log("📝 الحالة المرسلة:");
    console.log(query + "\n");
    console.log("⏳ ننتظر إجابة الذكاء الاصطناعي...\n");

    try {
        const aiRes = await fetch('http://localhost:3000/api/medical-query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{ role: 'user', content: query }],
                specialtyConfig: { label: 'Cardiology', corpus: 'Harrisons Principles' }
            })
        });

        const aiBody = await aiRes.text();
        console.log("💡 إجابة الذكاء الاصطناعي (Gemini):\n");
        console.log(aiBody);
    } catch (e) {
        console.error("❌ فشل الاتصال:", e.message);
    }
}

testMedicalCase();