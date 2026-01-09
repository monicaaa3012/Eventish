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
        body: JSON.stringify({ email, password }),
      });

      // 1. Handle the different ways apiCall might return data
      // If apiCall returns { data: { token, user } }, use result.data
      // If apiCall returns { token, user } directly, use result
      const payload = result.data ? result.data : result;

      // 2. Destructure with safety
      const token = payload.token;
      const role = payload.role;
      const user = payload.user;

      if (token) {
        console.log("Login successful, storing session...");

        // 3. Store with safe optional chaining (?.) to prevent "undefined" errors
        await AuthUtils.storeAuth(token, role || 'customer', { 
          name: user?.name || payload.name || "User", 
          email: user?.email || payload.email || email, 
          role: user?.role || role || 'customer', 
          userId: user?.id || user?._id || payload.id 
        });

        router.replace('/(tabs)');
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
    <SafeAreaView style={styles.container}>
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
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  header: { marginBottom: 48 },
  logoText: { fontSize: 36, fontWeight: '900', color: '#000', letterSpacing: -1 },
  subText: { fontSize: 16, color: '#6b7280', marginTop: 8 },
  form: { gap: 20 },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 8, color: '#374151', textTransform: 'uppercase' },
  input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 16, padding: 18, fontSize: 16, color: '#111827' },
  forgotBtn: { alignSelf: 'flex-end', marginTop: 16 },
  forgotText: { color: '#4F46E5', fontWeight: '600' },
  loginBtn: { backgroundColor: '#111827', borderRadius: 16, padding: 20, alignItems: 'center', marginTop: 40 },
  loginBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { color: '#6b7280', fontSize: 15 },
  signUpText: { color: '#4F46E5', fontWeight: '700', fontSize: 15 },
});