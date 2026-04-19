async function test() {
  const payload = {
      messages: [
          {role: 'user', content: 'مرحبا، أخبرني باسمك؟ وما المشكلة التي تعاني منها؟'},
          {role: 'assistant', content: 'مرحبا... اسمي عمر خالد. أنا أشعر بألم في صدري.'},
          {role: 'user', content: 'هل يمتد هذا الألم لأي مكان آخر مثل الذراع أو الفك؟ وما هي شدته من 1 إلى 10؟'}
      ], 
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
      console.log('\n==========================================');
      console.log('🗣️ سؤال الطالب: هل يمتد هذا الألم لأي مكان آخر مثل الذراع أو الفك؟ وما هي شدته من 1 إلى 10؟')
      console.log('🤖 إجابة المريض:');
      console.log(data.content);
      console.log('==========================================\n');
  } catch(e) {
      console.error(e);
  }
}
test();