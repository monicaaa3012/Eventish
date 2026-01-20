import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { AuthUtils } from '../../utils/auth';
import CustomerView from '../../components/dashboard/CustomerView';
import VendorView from '../../components/dashboard/VendorView';
import AdminView from '../../components/dashboard/AdminView';

export default function DashboardIndex() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthAndRole = async () => {
      try {
        // Check if user has a valid token
        const token = await AuthUtils.getToken();
        
        if (!token) {
          // No token - redirect to welcome screen for better UX
          setIsAuthenticated(false);
          setLoading(false);
          router.replace('/welcome');
          return;
        }

        // Token exists - get user data
        const user = await AuthUtils.getUserData();
        
        if (!user) {
          // Token exists but no user data - redirect to welcome screen
          setIsAuthenticated(false);
          setLoading(false);
          router.replace('/welcome');
          return;
        }

        // User is authenticated
        setIsAuthenticated(true);
        setRole(user.role || 'customer');
        console.log("Authenticated user role:", user.role);
        
      } catch (error) {
        console.error("Auth check error:", error);
        // Error checking auth - redirect to welcome screen
        setIsAuthenticated(false);
        router.replace('/welcome');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthAndRole();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  // If not authenticated, don't render anything (redirect is happening)
  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  // User is authenticated - show appropriate dashboard
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