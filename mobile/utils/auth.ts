import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserData {
  name?: string;
  email?: string;
  role: string;
  userId?: string;
}

export const AuthUtils = {
  // Store authentication data
  async storeAuth(token: string, role: string, userData?: Partial<UserData>) {
    try {
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('role', role.toLowerCase());
      
      if (userData) {
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Error storing auth data:', error);
    }
  },

  // Store user data separately
  async storeUserData(userData: UserData) {
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  },

  // Get stored token
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('token');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  // Get stored role
  async getRole(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('role');
    } catch (error) {
      console.error('Error getting role:', error);
      return null;
    }
  },

  // Get stored user data
  async getUserData(): Promise<UserData | null> {
    try {
      const userData = await AsyncStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('token');
      return !!token;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  },

  // Clear authentication data (logout)
  async clearAuth() {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('role');
      await AsyncStorage.removeItem('userData');
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  },

  // Get auth headers for API calls
  async getAuthHeaders(): Promise<{ [key: string]: string }> {
    try {
      const token = await AsyncStorage.getItem('token');
      return token ? { Authorization: `Bearer ${token}` } : {};
    } catch (error) {
      console.error('Error getting auth headers:', error);
      return {};
    }
  },
};