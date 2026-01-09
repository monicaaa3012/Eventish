import { AuthUtils } from '../utils/auth'; 

// 1. Separate the Server Root from the API Root
// Using local IP for mobile device connectivity
const SERVER_URL = 'http://192.168.18.7:5000';
const BASE_URL = `${SERVER_URL}/api`;

export const API_CONFIG = {
  SERVER_URL: SERVER_URL, // Root URL for static files (images)
  BASE_URL: BASE_URL,     // API URL for data
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      PROFILE: '/auth/profile',
    },
    VENDORS: {
      // Merged: Public browsing & private management
      BROWSE: '/vendors',             // For browse-vendors.tsx
      ME: '/vendors/me',               // For update-profile.tsx
      PROFILE: '/vendors/profile',
      LOCATIONS: '/vendors/locations', // For filtering
    },
    EVENTS: {
      BASE: '/events',                // For create-event.tsx
      MY_EVENTS: '/events/my-events', // For event-details.tsx
    },
    SERVICES: {
      BASE: '/services',              // For service-details.tsx
      VENDOR: '/services/my-services', // For my-services.tsx
    },
    BOOKINGS: {
      BASE: '/bookings',
      MY_BOOKINGS: '/bookings/my-bookings', // For (tabs)/bookings.tsx
    }
  },
};

/**
 * Helper to get full image URL
 * Handles Windows backslashes and missing images
 */
export const getImageUrl = (imagePath: string | undefined) => {
  if (!imagePath) return 'https://via.placeholder.com/150';
  
  // 1. Convert Windows backslashes (\) to standard forward slashes (/)
  let cleanPath = imagePath.replace(/\\/g, '/');
  
  // 2. Remove any leading slash from the database path to avoid double slashes
  // Example: Change "/uploads/img.jpg" to "uploads/img.jpg"
  if (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.substring(1);
  }
  
  // 3. Construct final URL: SERVER_URL + / + cleanPath
  return `${API_CONFIG.SERVER_URL}/${cleanPath}`;
};

/**
 * Generic API Caller
 * Automatically attaches JWT token and handles JSON parsing
 */
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  const token = await AuthUtils.getToken();
  
  const headers: any = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // If sending images (FormData), fetch handles the boundary and content-type automatically
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const requestOptions: RequestInit = {
    ...options,
    headers: headers,
  };

  console.log(`[API] Calling: ${url}`);

  try {
    const response = await fetch(url, requestOptions);
    const contentType = response.headers.get("content-type");
    let data;
    
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    if (!response.ok) {
      const errorMessage = data?.message || data?.error || data || `HTTP Error ${response.status}`;
      throw new Error(errorMessage);
    }
    
    return data; 
  } catch (error: any) {
    console.error(`[API Error] ${endpoint}:`, error.message);
    throw error;
  }
};