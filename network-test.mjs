
console.log("Starting network test...");

async function testNetwork() {
  const apiKey = 'AIzaSyDKBRj-qaSgS5Dyfg5GlMb8mHJiUAwGjcY';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  console.log(`Fetching ${url}...`);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Hello" }] }]
      })
    });
    console.log(`Status: ${response.status}`);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Network Error:', error);
  }
}

testNetwork().then(() => console.log("Done."));
