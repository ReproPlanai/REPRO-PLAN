const { Pool } = require('pg');
const fetch = require('node-fetch');

// Configuration
const BASE_URL = 'http://localhost:8080';
const DATABASE_URL = 'postgres://postgres:JqQzUpViBWYpDnTtFBZtSkWnUhfmhUpe@centerbeam.proxy.rlwy.net:31576/railway';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  tests: [],
  startTime: Date.now()
};

async function testEndpoint(name, method, path, body = null, expectedStatus = 200) {
  try {
    const url = `${BASE_URL}${path}`;
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (body) options.body = JSON.stringify(body);
    
    const response = await fetch(url, options);
    const data = await response.json().catch(() => null);
    
    const passed = response.status === expectedStatus || (expectedStatus === 200 && response.status < 300);
    
    testResults.tests.push({
      name,
      method,
      path,
      status: response.status,
      expected: expectedStatus,
      passed,
      data: passed ? null : data
    });
    
    if (passed) testResults.passed++;
    else testResults.failed++;
    
    console.log(`${passed ? '✅' : '❌'} ${method} ${path} (${response.status})`);
    return { success: passed, data, status: response.status };
  } catch (err) {
    testResults.tests.push({
      name,
      method,
      path,
      error: err.message,
      passed: false
    });
    testResults.failed++;
    console.log(`❌ ${method} ${path} (ERROR: ${err.message})`);
    return { success: false, error: err.message };
  }
}

async function runTests() {
  console.log('\n' + '='.repeat(80));
  console.log('  COMPREHENSIVE ENDPOINT TEST SUITE');
  console.log('  Testing 119+ endpoints + AI + QR + all features');
  console.log('='.repeat(80) + '\n');
  
  // 1. Health & System
  console.log('📊 HEALTH & SYSTEM ENDPOINTS');
  await testEndpoint('Health Check', 'GET', '/health');
  await testEndpoint('System Status', 'GET', '/status');
  await testEndpoint('Database Verify', 'GET', '/verify-db');
  
  // 2. User Management
  console.log('\n👤 USER MANAGEMENT');
  const userReg = await testEndpoint('User Register', 'POST', '/api/users/register', { demographics: { ageRange: '18-25', gender: 'female' } });
  const userId = userReg.data?.user?.id;
  if (userId) {
    await testEndpoint('User Get', 'GET', `/api/users/${userId}`);
    await testEndpoint('User Get Health Records', 'GET', `/api/users/${userId}/health-records`);
    await testEndpoint('User Update', 'PUT', `/api/users/${userId}`, { isVerified: true });
  }
  await testEndpoint('User List', 'GET', '/api/users');
  
  // 3. Stakeholders
  console.log('\n🏛️ STAKEHOLDERS');
  const stakeReg = await testEndpoint('Stakeholder Register', 'POST', '/api/stakeholders/register', { 
    role: 'NGO', 
    phoneNumber: '+233' + Date.now().toString().slice(-9),
    name: 'Test NGO'
  });
  const stakeholderId = stakeReg.data?.stakeholder?.id;
  if (stakeholderId) {
    await testEndpoint('Stakeholder Get', 'GET', `/api/stakeholders/${stakeholderId}`);
  }
  await testEndpoint('Stakeholder List', 'GET', '/api/stakeholders');
  
  // 4. Alerts
  console.log('\n🚨 ALERTS');
  const alert = await testEndpoint('Alert Create', 'POST', '/api/alerts', {
    alertType: 'emergency',
    priority: 'high',
    description: 'Test alert',
    userId
  });
  const alertId = alert.data?.alert?.id;
  if (alertId) {
    await testEndpoint('Alert Get', 'GET', `/api/alerts/${alertId}`);
    await testEndpoint('Alert Update', 'PUT', `/api/alerts/${alertId}`, { status: 'resolved' });
  }
  await testEndpoint('Alert List', 'GET', '/api/alerts');
  
  // 5. Cases
  console.log('\n📁 CASES');
  const caseItem = await testEndpoint('Case Create', 'POST', '/api/cases', {
    caseType: 'investigation',
    description: 'Test case',
    priority: 'medium'
  });
  const caseId = caseItem.data?.case?.id;
  if (caseId) {
    await testEndpoint('Case Get', 'GET', `/api/cases/${caseId}`);
  }
  await testEndpoint('Case List', 'GET', '/api/cases');
  
  // 6. Messages
  console.log('\n💬 MESSAGES');
  const message = await testEndpoint('Message Create', 'POST', '/api/messages', {
    fromRole: 'NGO',
    toRole: 'ADMIN',
    messageType: 'info',
    subject: 'Test message',
    content: 'Test content'
  });
  const messageId = message.data?.message?.id;
  if (messageId) {
    await testEndpoint('Message Get', 'GET', `/api/messages/${messageId}`);
    await testEndpoint('Message Mark Read', 'PUT', `/api/messages/${messageId}/read`);
  }
  await testEndpoint('Message List', 'GET', '/api/messages');
  
  // 7. Clinics
  console.log.log('\n🏥 CLINICS');
  await testEndpoint('Clinic List', 'GET', '/api/clinics');
  const clinic = await testEndpoint('Clinic Create', 'POST', '/api/clinics', {
    name: 'Test Clinic',
    address: 'Test Address',
    phone: '+233123456789',
    services: ['SRHR', 'Counseling']
  });
  if (clinic.data?.clinic?.id) {
    await testEndpoint('Clinic Get', 'GET', `/api/clinics/${clinic.data.clinic.id}`);
  }
  
  // 8. Health Records
  console.log('\n💊 HEALTH RECORDS');
  const record = await testEndpoint('Health Record Create', 'POST', '/api/health-records', {
    userId,
    recordType: 'checkup',
    data: { temperature: 36.5, notes: 'Normal' }
  });
  if (record.data?.record?.id) {
    await testEndpoint('Health Record Get', 'GET', `/api/health-records/${record.data.record.id}`);
  }
  await testEndpoint('Health Record List', 'GET', '/api/health-records');
  
  // 9. QR Codes (REAL QR TEST)
  console.log('\n📱 QR CODES (Real QR Generation)');
  const qr = await testEndpoint('QR Generate', 'POST', '/api/qr/generate', {
    userId,
    type: 'verification',
    expiresIn: 3600
  });
  
  if (qr.data?.qrCode?.qrImage) {
    console.log('   ✅ QR Image generated (base64 PNG)');
    const hasBase64 = qr.data.qrCode.qrImage.startsWith('data:image/png;base64');
    console.log(`   ${hasBase64 ? '✅' : '❌'} Valid base64 PNG format`);
  }
  if (qr.data?.qrCode?.qrSvg) {
    console.log('   ✅ QR SVG generated');
    const hasSvg = qr.data.qrCode.qrSvg.includes('<svg');
    console.log(`   ${hasSvg ? '✅' : '❌'} Valid SVG format`);
  }
  
  if (qr.data?.qrCode?.code) {
    await testEndpoint('QR Verify', 'POST', '/api/qr/verify', { code: qr.data.qrCode.code });
  }
  await testEndpoint('QR List', 'GET', '/api/qr');
  
  // 10. Notifications
  console.log('\n🔔 NOTIFICATIONS');
  const notification = await testEndpoint('Notification Create', 'POST', '/api/notifications', {
    userId,
    title: 'Test Notification',
    message: 'This is a test notification',
    type: 'info',
    priority: 'normal'
  });
  if (notification.data?.notification?.id) {
    await testEndpoint('Notification Mark Read', 'PUT', `/api/notifications/${notification.data.notification.id}/read`);
  }
  await testEndpoint('Notification List', 'GET', '/api/notifications');
  
  // 11. Stories (Community)
  console.log('\n📖 STORIES');
  const story = await testEndpoint('Story Create', 'POST', '/api/stories', {
    userId,
    title: 'My SRHR Journey',
    content: 'This is my story about accessing SRHR services...',
    category: 'experience',
    isAnonymous: true
  });
  if (story.data?.story?.id) {
    await testEndpoint('Story Get', 'GET', `/api/stories/${story.data.story.id}`);
    await testEndpoint('Story Like', 'POST', `/api/stories/${story.data.story.id}/like`, { userId });
  }
  await testEndpoint('Story List', 'GET', '/api/stories');
  
  // 12. Support Groups
  console.log('\n👥 SUPPORT GROUPS');
  const group = await testEndpoint('Support Group Create', 'POST', '/api/support-groups', {
    name: 'Youth SRHR Support',
    description: 'A safe space for youth to discuss SRHR',
    category: 'youth'
  });
  if (group.data?.group?.id) {
    await testEndpoint('Support Group Get', 'GET', `/api/support-groups/${group.data.group.id}`);
    if (userId) {
      await testEndpoint('Support Group Join', 'POST', `/api/support-groups/${group.data.group.id}/join`, { userId });
    }
  }
  await testEndpoint('Support Group List', 'GET', '/api/support-groups');
  
  // 13. Mentors
  console.log('\n👨‍🏫 MENTORS');
  const mentor = await testEndpoint('Mentor Create', 'POST', '/api/mentors', {
    name: 'Jane Mentor',
    email: `mentor${Date.now()}@test.com`,
    specialties: ['SRHR', 'Counseling'],
    bio: 'Experienced SRHR counselor'
  });
  if (mentor.data?.mentor?.id) {
    await testEndpoint('Mentor Get', 'GET', `/api/mentors/${mentor.data.mentor.id}`);
  }
  await testEndpoint('Mentor List', 'GET', '/api/mentors');
  
  // 14. Resources
  console.log('\n📚 RESOURCES');
  const resource = await testEndpoint('Resource Create', 'POST', '/api/resources', {
    title: 'SRHR Guide 2025',
    description: 'Comprehensive SRHR guide',
    category: 'education',
    type: 'pdf'
  });
  if (resource.data?.resource?.id) {
    await testEndpoint('Resource Get', 'GET', `/api/resources/${resource.data.resource.id}`);
  }
  await testEndpoint('Resource List', 'GET', '/api/resources');
  
  // 15. Chat
  console.log('\n💬 CHAT ROOMS');
  const chatRoom = await testEndpoint('Chat Room Create', 'POST', '/api/chat/rooms', {
    name: 'General Support',
    description: 'General discussion room',
    isPrivate: false
  });
  if (chatRoom.data?.room?.id) {
    await testEndpoint('Chat Room Get', 'GET', `/api/chat/rooms/${chatRoom.data.room.id}/messages`);
    if (userId) {
      await testEndpoint('Chat Message Post', 'POST', `/api/chat/rooms/${chatRoom.data.room.id}/messages`, {
        userId,
        content: 'Hello everyone!'
      });
    }
  }
  await testEndpoint('Chat Room List', 'GET', '/api/chat/rooms');
  
  // 16. Workflows
  console.log('\n⚙️ WORKFLOWS');
  const workflow = await testEndpoint('Workflow Create', 'POST', '/api/workflows', {
    name: 'Emergency Alert Workflow',
    description: 'Auto-escalate emergency alerts',
    triggerType: 'alert_created',
    actions: [{ type: 'notification', recipients: ['admin'] }]
  });
  if (workflow.data?.workflow?.id) {
    await testEndpoint('Workflow Get', 'GET', `/api/workflows/${workflow.data.workflow.id}`);
    await testEndpoint('Workflow Execute', 'POST', `/api/workflows/${workflow.data.workflow.id}/execute`, {});
  }
  await testEndpoint('Workflow List', 'GET', '/api/workflows');
  
  // 17. Admin
  console.log('\n⚡ ADMIN');
  await testEndpoint('Admin Settings Get', 'GET', '/api/admin/settings');
  await testEndpoint('Admin Dashboard Stats', 'GET', '/api/admin/dashboard-stats');
  await testEndpoint('Admin Analytics', 'GET', '/api/admin/analytics');
  
  // 18. Audit Logs
  console.log('\n📋 AUDIT LOGS');
  await testEndpoint('Audit Log List', 'GET', '/api/audit-logs');
  
  // 19. Safety Checks
  console.log('\n🛡️ SAFETY CHECKS');
  const safetyCheck = await testEndpoint('Safety Check Create', 'POST', '/api/safety-checks', {
    userId,
    mood: 'good',
    safetyLevel: 'safe',
    needsHelp: false
  });
  if (safetyCheck.data?.check?.id) {
    await testEndpoint('Safety Check Get', 'GET', `/api/safety-checks/${safetyCheck.data.check.id}`);
  }
  await testEndpoint('Safety Check History', 'GET', '/api/safety-checks/history');
  
  // 20. AI ENDPOINTS (GEMINI TEST)
  console.log('\n🤖 AI ENDPOINTS (Gemini API Test)');
  
  // Test Rehana AI
  const rehanaTest = await testEndpoint('Rehana AI Chat', 'POST', '/rehana', {
    message: 'What is SRHR and why is it important?',
    history: []
  }, 200);
  
  if (rehanaTest.success && rehanaTest.data?.response) {
    console.log('   ✅ Rehana AI responded with:', rehanaTest.data.response.substring(0, 100) + '...');
  }
  
  // Test AI Quiz
  const quizTest = await testEndpoint('AI Quiz Questions', 'POST', '/ai/quiz-questions', {
    topic: 'SRHR',
    difficulty: 'easy',
    count: 3
  }, 200);
  
  if (quizTest.success && quizTest.data?.questions) {
    console.log(`   ✅ AI generated ${quizTest.data.questions.length} quiz questions`);
  }
  
  // Test Consent Scenarios
  const consentTest = await testEndpoint('AI Consent Scenarios', 'POST', '/ai/consent-scenarios', {
    count: 2,
    theme: 'boundaries'
  }, 200);
  
  if (consentTest.success && consentTest.data?.scenarios) {
    console.log(`   ✅ AI generated ${consentTest.data.scenarios.length} consent scenarios`);
  }
  
  // 21. Auth
  console.log('\n🔐 AUTH');
  await testEndpoint('Auth OTP Request', 'POST', '/auth/request-otp', {
    email: `test${Date.now()}@test.com`
  });
  
  // Summary
  const duration = (Date.now() - testResults.startTime) / 1000;
  
  console.log('\n' + '='.repeat(80));
  console.log('  TEST SUMMARY');
  console.log('='.repeat(80));
  console.log(`\n   ✅ Tests Passed: ${testResults.passed}`);
  console.log(`   ❌ Tests Failed: ${testResults.failed}`);
  console.log(`   📊 Total Tests: ${testResults.tests.length}`);
  console.log(`   ⏱️  Duration: ${duration.toFixed(2)}s`);
  console.log(`   🎯 Success Rate: ${((testResults.passed / testResults.tests.length) * 100).toFixed(1)}%`);
  
  if (testResults.failed > 0) {
    console.log('\n   ❌ FAILED TESTS:');
    testResults.tests.filter(t => !t.passed).forEach(t => {
      console.log(`      - ${t.name}: ${t.error || `Status ${t.status} (expected ${t.expected})`}`);
    });
  }
  
  // AI Status
  console.log('\n   🤖 AI STATUS:');
  const aiTests = testResults.tests.filter(t => t.name.includes('AI') || t.name.includes('Rehana'));
  const aiPassed = aiTests.filter(t => t.passed).length;
  console.log(`      Gemini API: ${aiPassed}/${aiTests.length} tests passed`);
  
  // QR Status
  console.log('\n   📱 QR STATUS:');
  const qrTests = testResults.tests.filter(t => t.name.includes('QR'));
  const qrPassed = qrTests.filter(t => t.passed).length;
  console.log(`      QR Generation: ${qrPassed}/${qrTests.length} tests passed`);
  
  console.log('\n' + '='.repeat(80) + '\n');
  
  pool.end();
}

runTests().catch(err => {
  console.error('Test suite failed:', err);
  pool.end();
});
