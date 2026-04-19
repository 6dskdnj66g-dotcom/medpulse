async function test() {
  const payload = {
      messages: [{role: 'user', content: 'مرحبا، أخبرني باسمك؟ وما المشكلة التي تعاني منها؟'}], 
      stationId: 'IM-01', 
      mode: 'patient'
  };

  try {
      const res = await fetch('http://127.0.0.1:3055/api/osce/chat', {
          method: 'POST', 
          headers: {'Content-Type': 'application/json'}, 
          body: JSON.stringify(payload)
      });
      const data = await res.json();
      console.log('\n\n==========================================');
      console.log('🤖 إجابة المريض:');
      console.log(data.content);
      console.log('==========================================\n\n');
  } catch(e) {
      console.error(e);
  }
}
test();