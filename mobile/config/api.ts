// mobile/config/api.ts
import { AuthUtils } from '../utils/auth'; 

// Constant for the base URL - ensure this matches your machine's IP
const BASE_URL = 'http://192.168.18.7:5000/api';

export const API_CONFIG = {
  BASE_URL: BASE_URL,
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      PROFILE: '/auth/profile',
    },
    VENDORS: {
      ME: '/vendors/me',
      PROFILE: '/vendors/profile',
    },
    EVENTS: {
      BASE: '/events',
      MY_EVENTS: '/events/my-events', 
    },
    SERVICES: {
      BASE: '/services',
      VENDOR: '/services/my-services',
    },
  },
};

/**
 * Generic API Caller
 * Automatically attaches JWT token and handles JSON parsing
 */
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  // 1. Await the token properly from AuthUtils
  const token = await AuthUtils.getToken();
  
  // 2. Setup standard headers
  const headers: any = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // 3. SPECIAL HANDLING FOR IMAGES (FormData)
  // If the body is FormData, we MUST remove 'Content-Type'.
  // The fetch API will automatically set it to 'multipart/form-data' with the correct boundary.
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
    
    // Check content type for parsing
    const contentType = response.headers.get("content-type");
    let data;
    
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    // 4. Handle Errors
    if (!response.ok) {
      if (response.status === 401) {
        console.warn("Unauthorized: Session may have expired.");
        // Optional: Trigger a logout if 401 is received
      }
      
      // Handle both backend styles: { message: "..." } or { error: "..." }
      const errorMessage = data?.message || data?.error || data || `HTTP Error ${response.status}`;
      throw new Error(errorMessage);
    }
    
    // 5. Return parsed data
    return data; 
  } catch (error: any) {
    console.error(`[API Error] ${endpoint}:`, error.message);
    throw error;
  }
};