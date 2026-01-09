import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { AuthUtils } from '../../utils/auth';
import CustomerView from '../../components/dashboard/CustomerView';
import VendorView from '../../components/dashboard/VendorView';
import AdminView from '../../components/dashboard/AdminView';

export default function DashboardIndex() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      // FIX: Changed getUser() to getUserData() to match your auth.ts
      const user = await AuthUtils.getUserData();
      
      // Safety check: log the role to see what comes from the backend
      console.log("Current User Role:", user?.role);
      
      setRole(user?.role || 'customer');
      setLoading(false);
    };
    checkRole();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  // Logic matches your backend: 'vendor', 'admin', or 'customer'
  switch (role) {
    case 'vendor':
      return <VendorView />;
    case 'admin':
      return <AdminView />;
      case 'user': // Explicitly handle the 'user' role from your DB
    return <CustomerView />;
    default:
      return <CustomerView />;
  }
}