const BASE_URL = 'http://localhost:8080';

async function testConsentScenarios() {
  try {
    const response = await fetch(`${BASE_URL}/ai/consent-scenarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count: 2, theme: 'general' })
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testConsentScenarios();
