// Test notification system
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

// Import models
import User from './models/User.js';
import Notification from './models/Notification.js';
import { sendPushNotification } from './utils/pushNotifications.js';

async function testNotificationSystem() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Test 1: Check if Notification model works
    console.log('📝 Test 1: Creating test notification in database...');
    const testNotification = new Notification({
      recipient: '000000000000000000000000', // Dummy ID
      type: 'booking',
      title: 'Test Notification',
      body: 'This is a test notification',
      data: { test: true },
    });
    await testNotification.save();
    console.log('✅ Test notification created:', testNotification._id);
    
    // Clean up test notification
    await Notification.findByIdAndDelete(testNotification._id);
    console.log('🗑️  Test notification deleted\n');

    // Test 2: Check users with push tokens
    console.log('📱 Test 2: Checking users with push tokens...');
    const usersWithTokens = await User.find({ pushToken: { $exists: true, $ne: null } });
    console.log(`Found ${usersWithTokens.length} users with push tokens:`);
    usersWithTokens.forEach(user => {
      console.log(`  - ${user.name} (${user.email}): ${user.pushToken ? '✅ Has token' : '❌ No token'}`);
    });
    console.log();

    // Test 3: Check existing notifications
    console.log('📬 Test 3: Checking existing notifications...');
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(5);
    console.log(`Found ${notifications.length} recent notifications:`);
    notifications.forEach(notif => {
      console.log(`  - ${notif.title} (${notif.type}) - ${notif.read ? 'Read' : 'Unread'}`);
    });
    console.log();

    // Test 4: Test notification creation (without push)
    console.log('🧪 Test 4: Testing notification creation...');
    if (usersWithTokens.length > 0) {
      const testUser = usersWithTokens[0];
      console.log(`Creating test notification for ${testUser.name}...`);
      
      await sendPushNotification(testUser._id.toString(), {
        title: 'Test Booking Notification',
        body: 'This is a test booking notification from the test script',
        type: 'booking',
        data: {
          bookingId: 'test123',
          test: true,
        },
      });
      
      console.log('✅ Test notification sent (check database and user device)');
      console.log(`   User can see it in Profile → Notifications\n`);
    } else {
      console.log('⚠️  No users with push tokens found. Open the mobile app to register a token.\n');
    }

    console.log('=' .repeat(60));
    console.log('✅ All tests completed!');
    console.log('=' .repeat(60));
    console.log('\nNext steps:');
    console.log('1. Make sure backend is running (npm run dev)');
    console.log('2. Create a booking from mobile app');
    console.log('3. Check backend console for notification logs');
    console.log('4. Check vendor notifications screen');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

console.log('=' .repeat(60));
console.log('Notification System Test');
console.log('=' .repeat(60));
console.log();

testNotificationSystem();
