// End-to-end test: Register then Login
const http = require('http');

const BASE = 'http://localhost:5000';

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
      headers: { 'Content-Type': 'application/json' }
    };

    const req = http.request(options, (res) => {
      let chunks = '';
      res.on('data', c => chunks += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(chunks) });
        } catch {
          resolve({ status: res.statusCode, body: chunks });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  const testEmail = `test_${Date.now()}@test.com`;
  const testPassword = 'TestPass123';

  console.log('=== STEP 1: Register Vendor ===');
  const reg = await request('POST', '/api/v1/auth/register-vendor', {
    businessName: 'Test Biz',
    contactName: 'Test User',
    email: testEmail,
    password: testPassword,
    phone: `98765${Date.now().toString().slice(-5)}`,
    address: '123 Test St',
    vendorCategory: 'Catering',
    gstNumber: `GST${Date.now()}`,
    panNumber: `PAN${Date.now()}`,
    bankName: 'Test Bank',
    accountNumber: '12345678901234'
  });
  console.log('Status:', reg.status);
  console.log('Response:', JSON.stringify(reg.body, null, 2));

  console.log('\n=== STEP 2: Login with Same Credentials ===');
  const login = await request('POST', '/api/v1/auth/login', {
    email: testEmail,
    password: testPassword
  });
  console.log('Status:', login.status);
  console.log('Response:', JSON.stringify(login.body, null, 2));

  if (login.status === 200 && login.body.token) {
    console.log('\n=== STEP 3: Test /vendors/me with Token ===');
    // Direct request with auth header
    const url = new URL('/api/v1/vendors/me', BASE);
    const meResult = await new Promise((resolve, reject) => {
      const req = http.request({
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${login.body.token}`
        }
      }, (res) => {
        let chunks = '';
        res.on('data', c => chunks += c);
        res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(chunks) }));
      });
      req.on('error', reject);
      req.end();
    });
    console.log('Status:', meResult.status);
    console.log('Response:', JSON.stringify(meResult.body, null, 2));
  }

  console.log('\n=== STEP 4: Admin Login ===');
  const adminLogin = await request('POST', '/api/v1/auth/login', {
    email: 'admin@eventhub.com',
    password: 'password123'
  });
  console.log('Status:', adminLogin.status);
  console.log('Response:', JSON.stringify(adminLogin.body, null, 2));
}

main().catch(e => console.error('ERROR:', e));
