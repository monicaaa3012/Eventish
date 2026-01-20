// Service Categories Configuration
// This file centralizes all service categories used across the app

export interface ServiceCategory {
  value: string;
  label: string;
  icon: string;
  group?: string;
  description?: string;
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  // Photography & Videography
  { value: "photography", label: "Photography", icon: "camera", group: "media", description: "Professional event photography" },
  { value: "videography", label: "Videography", icon: "videocam", group: "media", description: "Video recording and editing" },
  
  // Food & Beverage
  { value: "catering", label: "Catering", icon: "restaurant", group: "food", description: "Food and beverage services" },
  { value: "cake", label: "Cakes", icon: "cafe", group: "food", description: "Custom cakes and desserts" },
  { value: "desserts", label: "Desserts", icon: "ice-cream", group: "food", description: "Sweet treats and desserts" },
  { value: "bartending", label: "Bartending", icon: "wine", group: "food", description: "Professional bar services" },
  
  // Music & Entertainment
  { value: "music", label: "Music", icon: "musical-notes", group: "entertainment", description: "Musical performances" },
  { value: "dj", label: "DJ Services", icon: "disc", group: "entertainment", description: "DJ and music mixing" },
  { value: "band", label: "Live Band", icon: "people", group: "entertainment", description: "Live musical performances" },
  { value: "entertainment", label: "Entertainment", icon: "happy", group: "entertainment", description: "General entertainment services" },
  { value: "mc", label: "MC Services", icon: "mic", group: "entertainment", description: "Master of ceremonies" },
  { value: "dance", label: "Dance", icon: "body", group: "entertainment", description: "Dance performances and instruction" },
  
  // Venue & Setup
  { value: "venue", label: "Venues", icon: "business", group: "venue", description: "Event venues and spaces" },
  { value: "decoration", label: "Decoration", icon: "color-palette", group: "venue", description: "Event decoration and styling" },
  { value: "flowers", label: "Flowers", icon: "flower", group: "venue", description: "Floral arrangements" },
  { value: "lighting", label: "Lighting", icon: "bulb", group: "venue", description: "Event lighting solutions" },
  { value: "sound", label: "Sound System", icon: "volume-high", group: "venue", description: "Audio equipment and setup" },
  
  // Beauty & Fashion
  { value: "makeup", label: "Makeup", icon: "brush", group: "beauty", description: "Professional makeup services" },
  { value: "hair", label: "Hair Styling", icon: "cut", group: "beauty", description: "Hair styling and grooming" },
  { value: "fashion", label: "Fashion", icon: "shirt", group: "beauty", description: "Fashion and styling services" },
  { value: "jewelry", label: "Jewelry", icon: "diamond", group: "beauty", description: "Jewelry and accessories" },
  
  // Planning & Coordination
  { value: "planning", label: "Event Planning", icon: "calendar", group: "planning", description: "Complete event planning" },
  { value: "coordination", label: "Coordination", icon: "checkmark-circle", group: "planning", description: "Event coordination services" },
  
  // Support Services
  { value: "transport", label: "Transport", icon: "car", group: "support", description: "Transportation services" },
  { value: "security", label: "Security", icon: "shield", group: "support", description: "Event security services" },
  { value: "cleaning", label: "Cleaning", icon: "brush-outline", group: "support", description: "Cleaning and maintenance" },
  
  // Print & Gifts
  { value: "printing", label: "Printing", icon: "print", group: "print", description: "Printing and design services" },
  { value: "invitations", label: "Invitations", icon: "mail", group: "print", description: "Custom invitations" },
  { value: "gifts", label: "Gifts", icon: "gift", group: "print", description: "Gift services" },
  { value: "favors", label: "Party Favors", icon: "bag", group: "print", description: "Party favors and keepsakes" }
];

// Helper functions
export const getCategoryByValue = (value: string): ServiceCategory | undefined => {
  return SERVICE_CATEGORIES.find(cat => cat.value === value);
};

export const getCategoriesByGroup = (group: string): ServiceCategory[] => {
  return SERVICE_CATEGORIES.filter(cat => cat.group === group);
};

export const getPopularCategories = (): ServiceCategory[] => {
  // Return most commonly used categories
  const popularValues = ['photography', 'catering', 'venue', 'music', 'decoration', 'makeup', 'planning', 'dj'];
  return SERVICE_CATEGORIES.filter(cat => popularValues.includes(cat.value));
};

export const getAllCategoryValues = (): string[] => {
  return SERVICE_CATEGORIES.map(cat => cat.value);
};

export const getAllCategoryLabels = (): string[] => {
  return SERVICE_CATEGORIES.map(cat => cat.label);
};

// Group definitions
export const SERVICE_GROUPS = {
  media: "Photography & Video",
  food: "Food & Beverage", 
  entertainment: "Music & Entertainment",
  venue: "Venue & Setup",
  beauty: "Beauty & Fashion",
  planning: "Planning & Coordination",
  support: "Support Services",
  print: "Print & Gifts"
};