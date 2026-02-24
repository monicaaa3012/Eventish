import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const fixUserNames = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find all users
    const users = await User.find({});
    
    console.log('\n=== Current Users ===');
    users.forEach(user => {
      console.log(`ID: ${user._id}`);
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log('---');
    });

    // Example: Update a specific user's name
    // Uncomment and modify as needed:
    /*
    const userId = '68369a71cb9d0a639c7918a1';
    await User.findByIdAndUpdate(userId, { name: 'Customer Name' });
    console.log(`\nUpdated user ${userId} name to "Customer Name"`);
    */

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixUserNames();
