import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Vendor from './models/Vendor.js';
import User from './models/User.js';

dotenv.config();

const checkVendor = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find vendor by userId from the chat logs
    const vendorUserId = '683ddf0fd127e33ad3827940';
    
    const vendor = await Vendor.findOne({ userId: vendorUserId });
    const user = await User.findById(vendorUserId);
    
    console.log('\n=== Vendor Info ===');
    console.log('User ID:', vendorUserId);
    console.log('User Name:', user?.name);
    console.log('User Email:', user?.email);
    console.log('User Role:', user?.role);
    console.log('\nVendor _id:', vendor?._id);
    console.log('Vendor Business Name:', vendor?.businessName);
    console.log('Vendor userId:', vendor?.userId);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkVendor();
