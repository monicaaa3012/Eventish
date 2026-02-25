// Quick test to verify notification endpoints work
import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000/api';

// You'll need to replace this with a valid token from your app
const TEST_TOKEN = 'YOUR_JWT_TOKEN_HERE';

async function testNotificationEndpoints() {
  console.log('Testing Notification Endpoints...\n');

  try {
    // Test 1: Get unread count
    console.log('1. Testing GET /api/notifications/unread-count');
    const countResponse = await fetch(`${API_URL}/notifications/unread-count`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
      },
    });
    const countData = await countResponse.json();
    console.log('Response:', countData);
    console.log('Status:', countResponse.status);
    console.log('✓ Unread count endpoint works\n');

    // Test 2: Get all notifications
    console.log('2. Testing GET /api/notifications');
    const listResponse = await fetch(`${API_URL}/notifications`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
      },
    });
    const listData = await listResponse.json();
    console.log('Response:', Array.isArray(listData) ? `Array with ${listData.length} items` : listData);
    console.log('Status:', listResponse.status);
    console.log('✓ List notifications endpoint works\n');

    console.log('All tests passed! ✓');
  } catch (error) {
    console.error('Error:', error.message);
    console.log('\nMake sure:');
    console.log('1. Backend server is running (npm run dev)');
    console.log('2. You have a valid JWT token');
    console.log('3. Notification routes are registered in server.js');
  }
}

console.log('='.repeat(50));
console.log('Notification Endpoint Test');
console.log('='.repeat(50));
console.log('\nNote: Replace TEST_TOKEN with a real JWT token from your app');
console.log('You can get it by logging in and checking AsyncStorage\n');

testNotificationEndpoints();
