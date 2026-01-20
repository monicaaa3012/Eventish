import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  Alert
} from 'react-native';
import { Link, router } from 'expo-router';
// Correct import from the newly installed library
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthUtils } from '../../utils/auth';
import { apiCall, API_CONFIG } from '../../config/api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const result = await apiCall(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(), 
          password 
        }),
      });

      const payload = result.data ? result.data : result;
      const token = payload.token;
      // Standardize role to match backend: 'user', 'vendor', or 'admin'
      const role = payload.role || payload.user?.role || 'user'; 
      const user = payload.user;

      if (token) {
        console.log("Login successful, storing session for role:", role);

        await AuthUtils.storeAuth(token, role, { 
          name: user?.name || payload.name || "User", 
          email: user?.email || payload.email || email, 
          role: role, 
          userId: user?.id || user?._id || payload.id 
        });

        // --- ROLE-BASED REDIRECTION ---
        // --- ROLE-BASED REDIRECTION ---
        if (role === 'vendor') {
          try {
            // 1. Try to fetch profile to check if it's complete
            const profile = await apiCall(API_CONFIG.ENDPOINTS.VENDORS.ME);
            
            // 2. Check if profile has essential fields (businessName and location are required)
            if (profile.businessName && profile.location) {
              console.log("Complete profile exists, going to Dashboard");
              router.replace('/(tabs)'); 
            } else {
              console.log("Incomplete profile, redirecting to setup");
              router.replace('/(vendor)/update-profile');
            }
          } catch (error: any) {
            // 3. If it fails, they need to set up their profile
            console.log("No profile found, redirecting to setup:", error.message);
            router.replace('/(vendor)/update-profile');
          }
        } else {
          router.replace('/(tabs)');
        } 
      } else {
        throw new Error('No authentication token received');
      }
    } catch (error: any) {
      console.error('Detailed Login Error:', error);
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    /* edges={['top', 'bottom']} ensures the content doesn't 
       get cut off by notches or home indicators.
    */
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        <View style={styles.header}>
          <Text style={styles.logoText}>
            Eventish<Text style={{ color: '#4F46E5' }}>.</Text>
          </Text>
          <Text style={styles.subText}>
            Simple management for big events.
          </Text>
        </View>

        <View style={styles.form}>
          <View>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="email@eventish.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.forgotBtn}>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          style={[styles.loginBtn, loading && { backgroundColor: '#4b5563' }]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginBtnText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>New to Eventish? </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text style={styles.signUpText}>Sign up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  inner: { 
    flex: 1, 
    paddingHorizontal: 24, 
    justifyContent: 'center' 
  },
  header: { 
    marginBottom: 48 
  },
  logoText: { 
    fontSize: 36, 
    fontWeight: '900', 
    color: '#000', 
    letterSpacing: -1 
  },
  subText: { 
    fontSize: 16, 
    color: '#6b7280', 
    marginTop: 8 
  },
  form: { 
    gap: 20 
  },
  label: { 
    fontSize: 14, 
    fontWeight: '700', 
    marginBottom: 8, 
    color: '#374151', 
    textTransform: 'uppercase' 
  },
  input: { 
    backgroundColor: '#f9fafb', 
    borderWidth: 1, 
    borderColor: '#e5e7eb', 
    borderRadius: 16, 
    padding: 18, 
    fontSize: 16, 
    color: '#111827' 
  },
  forgotBtn: { 
    alignSelf: 'flex-end', 
    marginTop: 16 
  },
  forgotText: { 
    color: '#4F46E5', 
    fontWeight: '600' 
  },
  loginBtn: { 
    backgroundColor: '#111827', 
    borderRadius: 16, 
    padding: 20, 
    alignItems: 'center', 
    marginTop: 40 
  },
  loginBtnText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: '700' 
  },
  footer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginTop: 32 
  },
  footerText: { 
    color: '#6b7280', 
    fontSize: 15 
  },
  signUpText: { 
    color: '#4F46E5', 
    fontWeight: '700', 
    fontSize: 15 
  },
});