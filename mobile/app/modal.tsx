import { Link, router, Stack } from 'expo-router';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function ModalScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Ensures the modal header is clean */}
      <Stack.Screen options={{ 
        headerShown: true, 
        title: 'Information',
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="#1E293B" />
          </TouchableOpacity>
        ),
        headerTitleStyle: { fontWeight: '800', color: '#1E293B' }
      }} />

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="information-circle" size={40} color="#4F46E5" />
        </View>
        
        <Text style={styles.title}>Welcome to the Modal</Text>
        <Text style={styles.description}>
          This is a presentation screen used for focused tasks or quick information. 
          You can easily dismiss this and go back to your planner.
        </Text>

        <TouchableOpacity 
          style={styles.primaryBtn} 
          onPress={() => router.dismissAll()}
        >
          <Text style={styles.btnText}>Return to Home</Text>
        </TouchableOpacity>

        <Link href="/" dismissTo style={styles.link}>
          <Text style={styles.linkText}>Dismiss and go back</Text>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  primaryBtn: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  link: {
    marginTop: 20,
    paddingVertical: 10,
  },
  linkText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});