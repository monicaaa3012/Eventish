import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiCall, API_CONFIG } from '../../config/api';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // Matches Backend Enum
  const [loading, setLoading] = useState(false);

  // Define roles to match Backend: ["user", "vendor", "admin"]
  const roles = [
    { id: 'user', label: 'User' },
    { id: 'vendor', label: 'Vendor' },
    { id: 'admin', label: 'Admin' },
  ];
const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Missing Info', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    
    // 1. Prepare Payload
    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: role, // Ensure this matches: "user", "vendor", "admin"
    };

    console.log("[Registration] Sending:", payload);

    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      Alert.alert('Success', 'Account created successfully!', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') }
      ]);
    } catch (error: any) {
      // 2. Extract detailed error from backend response
      console.error("[Registration Error]:", error);
      
      // If your apiCall throws the error object, try to find the backend message
      const detailedError = error.response?.data?.message || error.message || "Registration failed";
      
      Alert.alert('Registration Error', detailedError);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <Text style={styles.logoText}>
              Create Account<Text style={{ color: '#4F46E5' }}>.</Text>
            </Text>
            <Text style={styles.subText}>
              Join the platform and start planning.
            </Text>
          </View>

          <View style={styles.form}>
            <View>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="email@eventish.com"
                placeholderTextColor="#94A3B8"
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
                placeholderTextColor="#94A3B8"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <View>
              <Text style={styles.label}>I am a...</Text>
              <View style={styles.roleContainer}>
                {roles.map((r) => (
                  <TouchableOpacity
                    key={r.id}
                    onPress={() => setRole(r.id)}
                    style={[
                      styles.roleButton,
                      role === r.id && styles.roleButtonActive
                    ]}
                  >
                    <Text style={[
                      styles.roleButtonText,
                      role === r.id && styles.roleButtonTextActive
                    ]}>
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            style={[styles.registerBtn, loading && { opacity: 0.7 }]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerBtnText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already a member? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={styles.signInText}>Login</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40, flexGrow: 1, justifyContent: 'center' },
  header: { marginBottom: 32 },
  logoText: { fontSize: 32, fontWeight: '900', color: '#1E293B', letterSpacing: -1 },
  subText: { fontSize: 16, color: '#64748B', marginTop: 8 },
  form: { gap: 20 },
  label: { fontSize: 12, fontWeight: '800', marginBottom: 8, color: '#475569', textTransform: 'uppercase', letterSpacing: 1 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, padding: 16, fontSize: 16, color: '#1E293B' },
  roleContainer: { flexDirection: 'row', gap: 10 },
  roleButton: { flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC', alignItems: 'center' },
  roleButtonActive: { borderColor: '#4F46E5', backgroundColor: '#EEF2FF' },
  roleButtonText: { fontSize: 14, fontWeight: '700', color: '#64748B' },
  roleButtonTextActive: { color: '#4F46E5' },
  registerBtn: { backgroundColor: '#1E293B', borderRadius: 18, padding: 20, alignItems: 'center', marginTop: 35, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  registerBtnText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 25 },
  footerText: { color: '#64748B', fontSize: 15 },
  signInText: { color: '#4F46E5', fontWeight: '800', fontSize: 15 },
});