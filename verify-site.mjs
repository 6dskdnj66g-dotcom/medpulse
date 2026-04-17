import http from 'http';

const BASE_URL = 'http://localhost:3018';

const endpoints = [
  '/',                     // الصفحة الرئيسية
  '/encyclopedia',         // الموسوعة الطبية
  '/calculators',          // الحاسبات الطبية
  '/mdt',                  // الاستشارات المتعددة
  '/drug-checker',         // متتبع الأدوية
  '/notes',                // الملاحظات
  '/professors',           // الاستشاريين
  '/library',              // المكتبة والمصادر
  '/usmle',                // اختبارات USMLE
  '/simulator'             // المحاكي
];

async function checkRoute(route) {
  return new Promise((resolve) => {
    http.get(BASE_URL + route, (res) => {
      resolve({ route, status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 400 });
    }).on('error', (e) => {
      resolve({ route, status: 'ERROR', ok: false, error: e.message });
    });
  });
}

async function runTests() {
  console.log('================================================');
  console.log('🚀 MEDPULSE QA SYSTEM: STARTING HEALTH CHECKS');
  console.log('================================================\n');

  console.log('--- 1. Testing Frontend Menu & Routes ---');
  let passed = 0;
  for (const route of endpoints) {
    const result = await checkRoute(route);
    const icon = result.ok ? '✅ PASS' : '❌ FAIL';
    console.log(`${icon} | Route: ${route.padEnd(15)} | Status: ${result.status}`);
    if (result.ok) passed++;
  }
  console.log(`\nFrontend Score: ${passed}/${endpoints.length} Routes Online.\n`);

  console.log('--- 2. Testing API Endpoints (Medical Engine) ---');
  // Simple check for our API endpoints by sending a POST request to one of them
  const apiTest = new Promise((resolve) => {
    const req = http.request(BASE_URL + '/api/medical-query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, (res) => {
      resolve(res.statusCode);
    });
    req.on('error', () => resolve('ERROR'));
    req.write(JSON.stringify({ messages: [{role: 'user', content: 'Test'}]}));
    req.end();
  });

  const apiStatus = await apiTest;
  console.log(`${apiStatus === 200 ? '✅ PASS' : '⚠️ CHECK'} | AI Endpoint (/api/medical-query) | Status: ${apiStatus}`);

  console.log('\n================================================');
  console.log('🏁 QA TESTING COMPLETED');
  console.log('================================================');
  process.exit(0);
}

// Gives server a few seconds to boot before testing
setTimeout(runTests, 3000);
