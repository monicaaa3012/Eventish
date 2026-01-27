// Service Categories Configuration
// This file centralizes all service categories used across the web app

export const SERVICE_CATEGORIES = [
  // Photography & Videography
  { value: "photography", label: "Photography", icon: "📸", group: "media", description: "Professional event photography" },
  { value: "videography", label: "Videography", icon: "🎥", group: "media", description: "Video recording and editing" },
  
  // Food & Beverage
  { value: "catering", label: "Catering", icon: "🍽️", group: "food", description: "Food and beverage services" },
  { value: "cake", label: "Cakes", icon: "🎂", group: "food", description: "Custom cakes and desserts" },
  { value: "desserts", label: "Desserts", icon: "🍰", group: "food", description: "Sweet treats and desserts" },
  { value: "bartending", label: "Bartending", icon: "🍷", group: "food", description: "Professional bar services" },
  
  // Music & Entertainment
  { value: "music", label: "Music", icon: "🎵", group: "entertainment", description: "Musical performances" },
  { value: "dj", label: "DJ Services", icon: "🎧", group: "entertainment", description: "DJ and music mixing" },
  { value: "band", label: "Live Band", icon: "🎸", group: "entertainment", description: "Live musical performances" },
  { value: "entertainment", label: "Entertainment", icon: "🎭", group: "entertainment", description: "General entertainment services" },
  { value: "mc", label: "MC Services", icon: "🎤", group: "entertainment", description: "Master of ceremonies" },
  { value: "dance", label: "Dance", icon: "💃", group: "entertainment", description: "Dance performances and instruction" },
  
  // Venue & Setup
  { value: "venue", label: "Venues", icon: "🏛️", group: "venue", description: "Event venues and spaces" },
  { value: "decoration", label: "Decoration", icon: "🎨", group: "venue", description: "Event decoration and styling" },
  { value: "flowers", label: "Flowers", icon: "🌸", group: "venue", description: "Floral arrangements" },
  { value: "lighting", label: "Lighting", icon: "💡", group: "venue", description: "Event lighting solutions" },
  { value: "sound", label: "Sound System", icon: "🔊", group: "venue", description: "Audio equipment and setup" },
  
  // Beauty & Fashion
  { value: "makeup", label: "Makeup", icon: "💄", group: "beauty", description: "Professional makeup services" },
  { value: "hair", label: "Hair Styling", icon: "✂️", group: "beauty", description: "Hair styling and grooming" },
  { value: "fashion", label: "Fashion", icon: "👗", group: "beauty", description: "Fashion and styling services" },
  { value: "jewelry", label: "Jewelry", icon: "💎", group: "beauty", description: "Jewelry and accessories" },
  
  // Planning & Coordination
  { value: "planning", label: "Event Planning", icon: "📋", group: "planning", description: "Complete event planning" },
  { value: "coordination", label: "Coordination", icon: "✅", group: "planning", description: "Event coordination services" },
  
  // Support Services
  { value: "transport", label: "Transport", icon: "🚗", group: "support", description: "Transportation services" },
  { value: "security", label: "Security", icon: "🛡️", group: "support", description: "Event security services" },
  { value: "cleaning", label: "Cleaning", icon: "🧹", group: "support", description: "Cleaning and maintenance" },
  
  // Print & Gifts
  { value: "printing", label: "Printing", icon: "🖨️", group: "print", description: "Printing and design services" },
  { value: "invitations", label: "Invitations", icon: "💌", group: "print", description: "Custom invitations" },
  { value: "gifts", label: "Gifts", icon: "🎁", group: "print", description: "Gift services" },
  { value: "favors", label: "Party Favors", icon: "🎀", group: "print", description: "Party favors and keepsakes" }
];

// Helper functions
export const getCategoryByValue = (value) => {
  return SERVICE_CATEGORIES.find(cat => cat.value === value);
};

export const getCategoriesByGroup = (group) => {
  return SERVICE_CATEGORIES.filter(cat => cat.group === group);
};

export const getPopularCategories = () => {
  // Return most commonly used categories
  const popularValues = ['photography', 'catering', 'venue', 'music', 'decoration', 'makeup', 'planning', 'dj'];
  return SERVICE_CATEGORIES.filter(cat => popularValues.includes(cat.value));
};

export const getAllCategoryValues = () => {
  return SERVICE_CATEGORIES.map(cat => cat.value);
};

export const getAllCategoryLabels = () => {
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

// Event type to service mapping for recommendations
export const EVENT_SERVICE_MAPPING = {
  'Wedding': ['catering', 'decoration', 'photography', 'music', 'makeup', 'flowers', 'venue'],
  'Birthday Party': ['catering', 'decoration', 'photography', 'music', 'cake', 'entertainment'],
  'Corporate Event': ['catering', 'photography', 'venue', 'sound', 'planning'],
  'Anniversary': ['catering', 'decoration', 'photography', 'music', 'flowers'],
  'Baby Shower': ['catering', 'decoration', 'photography', 'cake', 'gifts'],
  'Graduation': ['catering', 'decoration', 'photography', 'cake'],
  'Holiday Party': ['catering', 'decoration', 'music', 'entertainment'],
  'Conference': ['catering', 'photography', 'venue', 'sound', 'planning'],
  'Workshop': ['catering', 'venue', 'sound'],
  'Other': ['catering', 'decoration', 'photography']
};