import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EsewaSuccessScreen() {
  const { oid, amt, refId, verify } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [isPendingVerification, setIsPendingVerification] = useState(false);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      if (oid && amt && refId) {
        // Check if verification is pending
        if (verify === 'pending') {
          setSuccess(true);
          setIsPendingVerification(true);
          setMessage('Payment received! Verification is in progress. Your booking will be confirmed shortly.');
        } else {
          // eSewa success callback - payment already verified by backend
          setSuccess(true);
          setMessage('Payment successful! Your booking has been confirmed.');
        }
      } else {
        setSuccess(false);
        setMessage('Invalid payment response');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      setSuccess(false);
      setMessage('Error verifying payment');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToBookings = () => {
    router.replace('/(tabs)/bookings');
  };

  const handleGoToHome = () => {
    router.replace('/(tabs)');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Verifying your payment...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: success ? '#D1FAE5' : '#FEE2E2' }]}>
          {success ? (
            <Ionicons name="checkmark-circle" size={80} color="#10B981" />
          ) : (
            <Ionicons name="close-circle" size={80} color="#EF4444" />
          )}
        </View>

        <Text style={[styles.title, { color: success ? '#065F46' : '#991B1B' }]}>
          {success ? 'Payment Successful!' : 'Payment Failed'}
        </Text>

        <Text style={styles.message}>{message}</Text>

        {isPendingVerification && (
          <View style={styles.warningBox}>
            <Ionicons name="information-circle" size={24} color="#F59E0B" />
            <Text style={styles.warningText}>
              Your payment is being verified with eSewa. This usually takes a few moments.
            </Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleGoToBookings}>
            <Text style={styles.primaryButtonText}>Go to My Bookings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleGoToHome}>
            <Text style={styles.secondaryButtonText}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#E2E8F0',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#1E293B',
    fontSize: 16,
    fontWeight: '600',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
});
