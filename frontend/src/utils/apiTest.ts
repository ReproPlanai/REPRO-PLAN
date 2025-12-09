// API Connection Test Utility
// Run this to verify frontend-backend connection in production

export const testAPIConnection = async () => {
  const results = {
    healthCheck: false,
    authEndpoints: false,
    stakeholderEndpoints: false,
    errors: [] as string[]
  };

  try {
    // Test health endpoint
    console.log('Testing health endpoint...');
    const healthResponse = await fetch(`${process.env.REACT_APP_API_URL?.replace('/api', '')}/health`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health check passed:', healthData);
      results.healthCheck = true;
    } else {
      results.errors.push(`Health check failed: ${healthResponse.status}`);
    }
  } catch (error) {
    results.errors.push(`Health check error: ${error}`);
  }

  try {
    // Test auth endpoints (should return validation errors for empty data)
    console.log('Testing auth endpoints...');
    const authResponse = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    // We expect a 400 error for invalid data, which means the endpoint is working
    if (authResponse.status === 400) {
      console.log('✅ Auth endpoints working (received expected validation error)');
      results.authEndpoints = true;
    } else {
      results.errors.push(`Auth endpoints unexpected response: ${authResponse.status}`);
    }
  } catch (error) {
    results.errors.push(`Auth test error: ${error}`);
  }

  try {
    // Test stakeholder endpoints
    console.log('Testing stakeholder endpoints...');
    const stakeholderResponse = await fetch(`${process.env.REACT_APP_API_URL}/stakeholders/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    // We expect a 400 error for invalid data
    if (stakeholderResponse.status === 400) {
      console.log('✅ Stakeholder endpoints working (received expected validation error)');
      results.stakeholderEndpoints = true;
    } else {
      results.errors.push(`Stakeholder endpoints unexpected response: ${stakeholderResponse.status}`);
    }
  } catch (error) {
    results.errors.push(`Stakeholder test error: ${error}`);
  }

  // Summary
  console.log('\n=== API Connection Test Results ===');
  console.log('Health Check:', results.healthCheck ? '✅ PASS' : '❌ FAIL');
  console.log('Auth Endpoints:', results.authEndpoints ? '✅ PASS' : '❌ FAIL');
  console.log('Stakeholder Endpoints:', results.stakeholderEndpoints ? '✅ PASS' : '❌ FAIL');

  if (results.errors.length > 0) {
    console.log('\nErrors:');
    results.errors.forEach(error => console.log('❌', error));
  }

  const allPassed = results.healthCheck && results.authEndpoints && results.stakeholderEndpoints;
  console.log('\nOverall Result:', allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');

  return results;
};

// Helper function to run test from browser console
(window as any).testAPIConnection = testAPIConnection;
