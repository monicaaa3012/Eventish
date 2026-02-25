import React, { useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { apiCall } from '../../config/api';

export default function EsewaPaymentScreen() {
  const { paymentUrl, formData, bookingId } = useLocalSearchParams();
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [hasNavigated, setHasNavigated] = useState(false);
  const [showTimeoutAlert, setShowTimeoutAlert] = useState(false);

  // Parse formData from JSON string
  const parsedFormData = typeof formData === 'string' ? JSON.parse(formData) : formData;

  // Add timeout to check payment status after 5 minutes
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (!hasNavigated) {
        setShowTimeoutAlert(true);
        checkPaymentStatus();
      }
    }, 300000); // 5 minutes (300 seconds)

    return () => clearTimeout(timeout);
  }, [hasNavigated]);

  // Check payment status with backend
  const checkPaymentStatus = async () => {
    try {
      const data = await apiCall(`/esewa/status/${bookingId}`, {
        method: 'GET'
      });

      if (data.success && data.status === 'completed') {
        // Payment was successful
        Alert.alert(
          'Payment Successful',
          'Your payment has been verified successfully!',
          [
            {
              text: 'View Booking',
              onPress: () => router.replace('/(tabs)/bookings')
            }
          ]
        );
      } else if (data.status === 'pending') {
        // Payment still pending
        Alert.alert(
          'Payment Pending',
          'Your payment is still being processed. Please check your bookings later or contact support if the issue persists.',
          [
            {
              text: 'Check Bookings',
              onPress: () => router.replace('/(tabs)/bookings')
            },
            {
              text: 'Contact Support',
              style: 'cancel'
            }
          ]
        );
      } else {
        // Payment failed
        Alert.alert(
          'Payment Status Unknown',
          'We could not verify your payment status. Please check your bookings or contact support.',
          [
            {
              text: 'Check Bookings',
              onPress: () => router.replace('/(tabs)/bookings')
            }
          ]
        );
      }
    } catch (error: any) {
      console.error('Error checking payment status:', error);
      Alert.alert(
        'Connection Error',
        'Unable to verify payment status. Please check your bookings.',
        [
          {
            text: 'Check Bookings',
            onPress: () => router.replace('/(tabs)/bookings')
          }
        ]
      );
    }
  };

  // Generate HTML form that auto-submits to eSewa
  const generatePaymentHTML = () => {
    // Log the form data for debugging
    console.log('=== eSewa Payment Form Data ===');
    console.log('Payment URL:', paymentUrl);
    console.log('Form Data:', parsedFormData);
    console.log('==============================');

    const fields = Object.entries(parsedFormData)
      .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}" />`)
      .join('\n');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>eSewa Payment</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              text-align: center;
              color: white;
            }
            .spinner {
              border: 4px solid rgba(255, 255, 255, 0.3);
              border-top: 4px solid white;
              border-radius: 50%;
              width: 40px;
              height: 40px;
              animation: spin 1s linear infinite;
              margin: 20px auto;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            .debug {
              display: none;
              background: rgba(0,0,0,0.8);
              padding: 20px;
              margin-top: 20px;
              border-radius: 10px;
              text-align: left;
              font-size: 12px;
              max-width: 90%;
              overflow-x: auto;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="spinner"></div>
            <h2>Redirecting to eSewa...</h2>
            <p>Please wait while we process your payment</p>
            <div class="debug" id="debugInfo">
              <strong>Form Data:</strong><br/>
              ${Object.entries(parsedFormData).map(([k, v]) => `${k}: ${v}`).join('<br/>')}
            </div>
          </div>
          <form id="esewaForm" action="${paymentUrl}" method="POST">
            ${fields}
          </form>
          <script>
            console.log('=== eSewa Form Submission ===');
            console.log('Action URL:', '${paymentUrl}');
            console.log('Form Data:', ${JSON.stringify(parsedFormData)});
            
            // Show debug info if form doesn't submit
            setTimeout(() => {
              const debugDiv = document.getElementById('debugInfo');
              if (debugDiv) debugDiv.style.display = 'block';
            }, 5000);
            
            // Auto-submit form after a brief delay
            setTimeout(() => {
              console.log('Submitting form to eSewa...');
              document.getElementById('esewaForm').submit();
            }, 1000);
          </script>
        </body>
      </html>
    `;
  };

  const handleNavigationStateChange = (navState: any) => {
    const { url } = navState;
    
    console.log("WebView navigation:", url);
    
    // Check if we're being redirected to success or failure URLs
    // Handle both backend redirect and frontend redirect
    if (url.includes('/payment/esewa/success') || url.includes('/esewa/success')) {
      try {
        setHasNavigated(true);
        // Extract query parameters
        const urlObj = new URL(url);
        const oid = urlObj.searchParams.get('oid');
        const amt = urlObj.searchParams.get('amt');
        const refId = urlObj.searchParams.get('refId');
        
        console.log("Payment success detected:", { oid, amt, refId });
        
        // Navigate to success screen
        router.replace({
          pathname: '/(customer)/esewa-success',
          params: { oid, amt, refId }
        });
      } catch (error) {
        console.error("Error parsing success URL:", error);
        router.replace('/(customer)/esewa-success');
      }
    } else if (url.includes('/payment/esewa/failure') || url.includes('/esewa/failure')) {
      setHasNavigated(true);
      console.log("Payment failure detected");
      // Navigate to failure screen
      router.replace('/(customer)/esewa-failure');
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Payment',
      'Are you sure you want to cancel this payment?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: () => router.back()
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
          <Ionicons name="close" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>eSewa Payment</Text>
        <View style={{ width: 24 }} />
      </View>

      <WebView
        ref={webViewRef}
        source={{ html: generatePaymentHTML() }}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error:', nativeEvent);
          Alert.alert(
            'Error Loading Payment',
            'Failed to load eSewa payment page. Please check your internet connection and try again.',
            [
              { text: 'Retry', onPress: () => router.back() },
              { text: 'Cancel', style: 'cancel' }
            ]
          );
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('HTTP error:', nativeEvent.statusCode, nativeEvent.description);
          Alert.alert(
            'Connection Error',
            `HTTP Error ${nativeEvent.statusCode}: ${nativeEvent.description || 'Unable to connect to eSewa'}`,
            [
              { text: 'Retry', onPress: () => router.back() },
              { text: 'Cancel', style: 'cancel' }
            ]
          );
        }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        mixedContentMode="always"
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={styles.loadingText}>Loading payment gateway...</Text>
          </View>
        )}
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  cancelButton: {
    padding: 4,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
  },
});
