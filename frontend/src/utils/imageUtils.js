/**
 * Image URL utilities for handling blog images
 */

/**
 * Get the full URL for an image
 * Handles both relative URLs (from uploads) and absolute URLs (external images)
 */
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  // If already a full URL (starts with http:// or https://), return as-is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If it's a relative URL from our uploads, prepend backend URL
  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
  
  // Ensure imageUrl starts with /
  const path = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  
  return `${backendUrl}${path}`;
};

/**
 * Get blog image URL with fallback
 * Tries featured_image, then image_url, then fallback
 */
export const getBlogImageUrl = (blog, fallback = null) => {
  const imageUrl = blog?.featured_image || blog?.image_url || blog?.image;
  return getImageUrl(imageUrl) || fallback;
};

export default {
  getImageUrl,
  getBlogImageUrl
};
