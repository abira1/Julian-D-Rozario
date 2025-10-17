// API Configuration for deployment
export const API_CONFIG = {
  // Base URL for API calls - adjust based on deployment
  BASE_URL: '/api',
  
  // Full API base path
  getApiPath: (endpoint) => {
    const basePath = '/api';
    return `${basePath}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  },
  
  // Upload path
  UPLOAD_URL: '/upload_image.php'
};

export default API_CONFIG;