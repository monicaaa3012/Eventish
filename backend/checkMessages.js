import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Message from './models/Message.js';
import User from './models/User.js';
import Vendor from './models/Vendor.js';

dotenv.config();

const checkMessages = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const conversationId = '699dc70b3712b2f5435c4f74';
    
    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
    
    console.log(`\n=== Messages in conversation ${conversationId} ===\n`);
    
    for (const msg of messages) {
      console.log(`Message ID: ${msg._id}`);
      console.log(`Content: "${msg.content}"`);
      console.log(`Sender ID: ${msg.sender}`);
      console.log(`Sender Model: ${msg.senderModel}`);
      console.log(`Created: ${msg.createdAt}`);
      
      if (msg.senderModel === 'User') {
        const user = await User.findById(msg.sender);
        console.log(`  → User: ${user?.name} (${user?.email}) - Role: ${user?.role}`);
      } else {
        const vendor = await Vendor.findById(msg.sender);
        const vendorUser = vendor ? await User.findById(vendor.userId) : null;
        console.log(`  → Vendor: ${vendor?.businessName} - User: ${vendorUser?.name} (${vendorUser?.email})`);
      }
      console.log('---\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkMessages();
