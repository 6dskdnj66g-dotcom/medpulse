setTimeout(async () => {
    try {
        const res = await fetch('http://localhost:3002/api/medical-query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{ role: 'user', content: 'A 55-year-old man presents with acute chest pain that radiates to his left arm. What is the most likely diagnosis and what should be done immediately?' }],
                specialtyConfig: { label: 'Cardiology', corpus: 'Harrisons Principles' }
            })
        });
        if (!res.ok) console.error('Status:', res.status);
        const body = await res.text();
        console.log('Response Output:', body);
    } catch (e) {
        console.error('Error:', e);
    }
}, 3000);
