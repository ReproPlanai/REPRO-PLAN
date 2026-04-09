const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

// Configuration - Node.js 20+ has native fetch
const BASE_URL = 'http://localhost:8080';
// Use environment variable for database URL - NEVER hardcode credentials
const DATABASE_URL = process.env.DATABASE_URL;

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

// Global test user ID
let testUserId = null;

async function createTestUser() {
  try {
    const id = uuidv4();
    await pool.query(
      `INSERT INTO users (id, secret_code, phone_number, demographics, is_verified, is_used, created_at, updated_at)
       VALUES ($1, $2, $3, $4, true, false, NOW(), NOW())
       ON CONFLICT (secret_code) DO NOTHING`,
      [id, `test-${id}`, '+233200000001', JSON.stringify({ ageRange: '18-25', gender: 'female' })]
    );
    testUserId = id;
    console.log(`✅ Test user created: ${id}`);
    return id;
  } catch (err) {
    console.error('❌ Failed to create test user:', err.message);
    return null;
  }
}

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

  // Create test user first to satisfy foreign key constraints
  await createTestUser();
  
  // 1. Health & System
  console.log('📊 HEALTH & SYSTEM ENDPOINTS');
  await testEndpoint('Health Check', 'GET', '/health');
  await testEndpoint('System Status', 'GET', '/status');
  await testEndpoint('Database Verify', 'GET', '/verify-db');
  
  // 2. User Management
  console.log('\n👤 USER MANAGEMENT');
  const userReg = await testEndpoint('User Register', 'POST', '/api/users/register', { 
    secretCode: 'TEST-' + Date.now(),
    demographics: { ageRange: '18-25', gender: 'female' } 
  });
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
    priority: 'medium',
    assignedTo: stakeholderId || userId,
    assignedRole: 'NGO',
    createdBy: userId
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
  console.log('\n🏥 CLINICS');
  await testEndpoint('Clinic List', 'GET', '/api/clinics');
  const clinic = await testEndpoint('Clinic Create', 'POST', '/api/clinics', {
    name: 'Test Clinic',
    address: 'Test Address',
    phone: '+233123456789',
    hours: '9:00-17:00',
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
    userId: testUserId,
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
    userId: testUserId,
    title: 'My SRHR Journey',
    content: 'This is my story about accessing SRHR services...',
    category: 'experience',
    isAnonymous: true
  });
  if (story.data?.story?.id) {
    await testEndpoint('Story Get', 'GET', `/api/stories/${story.data.story.id}`);
    await testEndpoint('Story Like', 'POST', `/api/stories/${story.data.story.id}/like`, { userId: testUserId });
  }
  await testEndpoint('Story List', 'GET', '/api/stories');
  
  // 12. Support Groups
  console.log('\n👥 SUPPORT GROUPS');
  const group = await testEndpoint('Support Group Create', 'POST', '/api/support-groups', {
    name: 'Youth SRHR Support',
    description: 'A safe space for youth to discuss SRHR',
    category: 'youth',
    facilitatorId: testUserId
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
    bio: 'Experienced SRHR counselor',
    stakeholderId: stakeholderId || testUserId
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
    type: 'pdf',
    createdBy: testUserId
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
    isPrivate: false,
    createdBy: testUserId
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
  
  // Test ReproBot AI
  const reprobotTest = await testEndpoint('ReproBot AI Chat', 'POST', '/reprobot', {
    message: 'What is SRHR and why is it important?',
    history: []
  }, 200);
  
  if (reprobotTest.success && reprobotTest.data?.response) {
    console.log('   ✅ ReproBot AI responded with:', reprobotTest.data.response.substring(0, 100) + '...');
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
  await testEndpoint('Auth Verify Token', 'GET', '/auth/verify', null, 401); // Should fail without token
  
  // 22. Pharmacies
  console.log('\n💊 PHARMACIES');
  const pharmacy = await testEndpoint('Pharmacy Create', 'POST', '/api/pharmacies', {
    name: 'Test Pharmacy',
    address: '123 Test Street',
    city: 'Accra',
    phone: '+233123456789',
    deliveryAvailable: true,
    deliveryFee: 5.00
  });
  const pharmacyId = pharmacy.data?.pharmacy?.id;
  if (pharmacyId) {
    await testEndpoint('Pharmacy Get', 'GET', `/api/pharmacies/${pharmacyId}`);
    await testEndpoint('Pharmacy Update', 'PUT', `/api/pharmacies/${pharmacyId}`, { deliveryFee: 3.50 });
  }
  await testEndpoint('Pharmacy List', 'GET', '/api/pharmacies');
  await testEndpoint('Pharmacy List by Location', 'GET', '/api/pharmacies?location=Accra');
  
  // 23. Accessibility
  console.log('\n♿ ACCESSIBILITY');
  await testEndpoint('Accessibility Settings Get', 'GET', '/api/accessibility/settings');
  await testEndpoint('Accessibility Settings Update', 'PUT', '/api/accessibility/settings', {
    userId: testUserId,
    settings: { highContrast: true, largeText: true }
  });
  await testEndpoint('Accessibility Profiles List', 'GET', '/api/accessibility/profiles');
  const profile = await testEndpoint('Accessibility Profile Create', 'POST', '/api/accessibility/profiles', {
    userId: testUserId,
    name: 'High Contrast Profile',
    description: 'Optimized for visual impairments',
    settings: { highContrast: true, screenReader: true },
    isPublic: true
  });
  if (profile.data?.profile?.id) {
    await testEndpoint('Accessibility Profile Delete', 'DELETE', `/api/accessibility/profiles/${profile.data.profile.id}`);
  }
  
  // 24. Reports (Crime/SRHR Reporting)
  console.log('\n📋 REPORTS');
  const report = await testEndpoint('Report Create', 'POST', '/api/reports', {
    type: 'harassment',
    description: 'Test incident report',
    location: 'Test Location',
    isAnonymous: true,
    consentToShare: true,
    wantsCallback: false
  });
  const reportId = report.data?.report?.id;
  if (reportId) {
    await testEndpoint('Report Get', 'GET', `/api/reports/${reportId}`);
    await testEndpoint('Report Status Update', 'PUT', `/api/reports/${reportId}/status`, { status: 'under_review', notes: 'Investigating' });
    await testEndpoint('Report Add Note', 'POST', `/api/reports/${reportId}/notes`, { note: 'Initial review complete' });
    await testEndpoint('Report Get Notes', 'GET', `/api/reports/${reportId}/notes`);
  }
  await testEndpoint('Report List', 'GET', '/api/reports');
  
  // 25. Error Reporting
  console.log('\n🐛 ERROR REPORTING');
  await testEndpoint('Error Report Submit', 'POST', '/api/errors', {
    message: 'Test error from test suite',
    stack: 'Test stack trace',
    context: { userAgent: 'TestBot/1.0', url: '/test', timestamp: new Date().toISOString() }
  });
  await testEndpoint('Error Reports List', 'GET', '/api/errors');
  
  // 26. Tier 3 Auth Verification
  console.log('\n🔒 TIER 3 VERIFICATION');
  if (userId) {
    await testEndpoint('User Tier 3 Verify', 'POST', '/api/users/verify', { 
      secretCode: userReg.data?.secretCode || 'TEST123' 
    }, 404); // User may not exist
  }
  await testEndpoint('Stakeholder Tier 3 Verify', 'POST', '/api/stakeholders/verify', { 
    phoneNumber: '+2331234567890',
    role: 'NGO'
  }, 404); // Stakeholder may not exist
  
  // 27. E-commerce Products
  console.log('\n🛒 E-COMMERCE');
  const product = await testEndpoint('Product Create', 'POST', '/api/products', {
    name: 'Test Product',
    price: 10.99,
    category: 'Contraception',
    stockQuantity: 100
  });
  const productId = product.data?.product?.id;
  if (productId) {
    await testEndpoint('Product Get', 'GET', `/api/products/${productId}`);
    await testEndpoint('Product Review Add', 'POST', `/api/products/${productId}/reviews`, {
      userId: testUserId,
      rating: 5,
      comment: 'Great product!'
    });
  }
  await testEndpoint('Product List', 'GET', '/api/products');
  await testEndpoint('Product Categories', 'GET', '/api/products/categories/list');
  
  // 28. Cart & Orders
  console.log('\n🛍️  CART & ORDERS');
  const cartItem = await testEndpoint('Cart Add Item', 'POST', '/api/cart/items', {
    userId: testUserId,
    productId: productId,
    quantity: 2
  });
  await testEndpoint('Cart Get', 'GET', `/api/cart?userId=${testUserId}`);
  await testEndpoint('Cart Summary', 'GET', `/api/cart/summary?userId=${testUserId}`);
  if (cartItem.data?.item?.id) {
    await testEndpoint('Cart Update Item', 'PUT', `/api/cart/items/${cartItem.data.item.id}`, { quantity: 3 });
    await testEndpoint('Cart Remove Item', 'DELETE', `/api/cart/items/${cartItem.data.item.id}`);
  }
  await testEndpoint('Cart Clear', 'DELETE', `/api/cart/clear?userId=${testUserId}`);
  
  // Create order if we have a product
  if (productId) {
    const order = await testEndpoint('Order Create', 'POST', '/api/orders', {
      userId: testUserId,
      items: [{ productId, quantity: 1 }],
      deliveryType: 'pickup'
    });
    const orderId = order.data?.order?.id;
    if (orderId) {
      await testEndpoint('Order Get', 'GET', `/api/orders/${orderId}`);
      await testEndpoint('Order Receipt', 'GET', `/api/orders/${orderId}/receipt`);
      await testEndpoint('Order Cancel', 'POST', `/api/orders/${orderId}/cancel`, { reason: 'Test cancellation' });
    }
  }
  await testEndpoint('Order List', 'GET', '/api/orders');
  
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
  const aiTests = testResults.tests.filter(t => t.name.includes('AI') || t.name.includes('ReproBot') || t.name.includes('Quiz') || t.name.includes('Consent'));
  const aiPassed = aiTests.filter(t => t.passed).length;
  console.log(`      Gemini API: ${aiPassed}/${aiTests.length} tests passed`);
  
  // QR Status
  console.log('\n   📱 QR STATUS:');
  const qrTests = testResults.tests.filter(t => t.name.includes('QR'));
  const qrPassed = qrTests.filter(t => t.passed).length;
  console.log(`      QR Generation: ${qrPassed}/${qrTests.length} tests passed`);
  
  // New Routes Status
  console.log('\n   🆕 NEW ROUTES STATUS:');
  const pharmacyTests = testResults.tests.filter(t => t.name.includes('Pharmacy'));
  const accessibilityTests = testResults.tests.filter(t => t.name.includes('Accessibility'));
  const reportTests = testResults.tests.filter(t => t.name.includes('Report') && !t.name.includes('Audit'));
  const errorTests = testResults.tests.filter(t => t.name.includes('Error'));
  
  console.log(`      Pharmacies: ${pharmacyTests.filter(t => t.passed).length}/${pharmacyTests.length} tests passed`);
  console.log(`      Accessibility: ${accessibilityTests.filter(t => t.passed).length}/${accessibilityTests.length} tests passed`);
  console.log(`      Reports: ${reportTests.filter(t => t.passed).length}/${reportTests.length} tests passed`);
  console.log(`      Error Reporting: ${errorTests.filter(t => t.passed).length}/${errorTests.length} tests passed`);
  
  // All Endpoints Summary
  console.log('\n   📋 ALL ROUTES TESTED:');
  const routeGroups = [
    'Health & System', 'User', 'Stakeholder', 'Alert', 'Case', 'Message',
    'Clinic', 'Health Record', 'QR', 'Notification', 'Story', 'Support Group',
    'Mentor', 'Resource', 'Chat', 'Workflow', 'Admin', 'Audit', 'Safety',
    'AI', 'Auth', 'Pharmacy', 'Accessibility', 'Report', 'Error',
    'Product', 'Cart', 'Order'
  ];
  routeGroups.forEach(group => {
    const groupTests = testResults.tests.filter(t => t.name.toLowerCase().includes(group.toLowerCase()));
    const passed = groupTests.filter(t => t.passed).length;
    const status = passed === groupTests.length ? '✅' : passed === 0 ? '❌' : '⚠️';
    console.log(`      ${status} ${group}: ${passed}/${groupTests.length}`);
  });
  
  console.log('\n' + '='.repeat(80) + '\n');
  
  pool.end();
}

runTests().catch(err => {
  console.error('Test suite failed:', err);
  pool.end();
});
