const http = require('http');

// Test the phishing URL with the backend
const testUrl = 'http://example.com/secure-login-update-account';

const data = JSON.stringify({ url: testUrl });

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/analyze',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('Testing phishing URL:', testUrl);
console.log('Sending request to backend...\n');

const req = http.request(options, (res) => {
  let body = '';

  res.on('data', (chunk) => {
    body += chunk;
  });

  res.on('end', () => {
    try {
      const result = JSON.parse(body);
      console.log('✅ Backend Response:');
      console.log('==================');
      console.log('Risk Score:', result.risk_score, '/ 100');
      console.log('Is Phishing:', result.is_phishing ? 'YES' : 'NO');
      console.log('Reason:', result.reason);
      if (result.breakdown) {
        console.log('\nRisk Breakdown:');
        console.log('- URL Risk:', result.breakdown.url_risk);
        console.log('- Brand Risk:', result.breakdown.brand_risk);
        console.log('- Content Risk:', result.breakdown.content_risk);
      }
    } catch (err) {
      console.log('❌ Error parsing response:', err.message);
      console.log('Raw response:', body);
    }
  });
});

req.on('error', (err) => {
  console.log('❌ Request failed:', err.message);
});

req.write(data);
req.end();
