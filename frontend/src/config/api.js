// API Configuration for deployment
export const API_CONFIG = {
  // Base URL for API calls - adjust based on deployment
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? '/julian_portfolio/api' 
    : '/api',
  
  // Full API base path
  getApiPath: (endpoint) => {
    const basePath = process.env.NODE_ENV === 'production' 
      ? '/julian_portfolio/api' 
      : '/api';
    return `${basePath}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  },
  
  // Upload path
  UPLOAD_URL: process.env.NODE_ENV === 'production'
    ? '/julian_portfolio/upload_image.php'
    : '/upload_image.php'
};

export default API_CONFIG;