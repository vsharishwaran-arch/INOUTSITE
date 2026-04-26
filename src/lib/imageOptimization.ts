/**
 * Utility functions for optimizing Cloudinary image URLs.
 * Reduces image payload size while maintaining visual quality.
 */

/**
 * Generate optimized Cloudinary image URL.
 * @param {string} url - Cloudinary URL or local image path
 * @param {Object} options - Optimization options
 * @returns {string} - Optimized URL
 */
export function getOptimizedImageUrl(url, options = {}) {
  if (!url) return '';

  // Skip non-Cloudinary URLs (local images, etc.)
  if (!url.includes('cloudinary')) {
    return url;
  }

  const {
    width = 400,      // Default width for product cards
    quality = 'auto', // Auto quality for best compression
    format = 'auto',  // Auto format (WebP if supported)
    crop = 'fill',    // Crop strategy
    gravity = 'auto', // Smart cropping
  } = options;

  try {
    // Build transformation string
    const transformation = `w_${width},q_${quality},f_${format},c_${crop},g_${gravity}`;
    
    // Cloudinary URL format: https://res.cloudinary.com/{cloud}/image/upload/{transformations}/{public_id}
    // We need to insert transformations after /upload/ but before the public_id
    // Handle URLs like: https://res.cloudinary.com/divgqy8pk/image/upload/v1777202996/inout-fashion/products/piiebwowqjcp77j7o2ui.jpg
    
    const uploadMatch = url.match(/(.*\/upload\/)(.*)/);
    if (uploadMatch) {
      const baseUrl = uploadMatch[1]; // Everything up to and including /upload/
      const afterUpload = uploadMatch[2]; // Everything after /upload/
      
      // Insert transformation right after /upload/
      const optimized = `${baseUrl}${transformation}/${afterUpload}`;
      console.debug(`[ImageOptimization] Optimized: ${optimized}`);
      return optimized;
    }

    // Fallback: return original URL if pattern doesn't match
    console.warn(`[ImageOptimization] URL doesn't match Cloudinary pattern: ${url}`);
    return url;
  } catch (error) {
    console.error(`[ImageOptimization] Error: ${error.message}`);
    // Return original URL if optimization fails
    return url;
  }
}

/**
 * Generate srcset for responsive images.
 * @param {string} url - Cloudinary URL
 * @returns {string} - Srcset string for responsive images
 */
export function getImageSrcSet(url) {
  if (!url || !url.includes('cloudinary')) {
    return url;
  }

  return [
    `${getOptimizedImageUrl(url, { width: 300 })} 300w`,
    `${getOptimizedImageUrl(url, { width: 400 })} 400w`,
    `${getOptimizedImageUrl(url, { width: 600 })} 600w`,
    `${getOptimizedImageUrl(url, { width: 800 })} 800w`,
  ].join(', ');
}

/**
 * Get sizes attribute for responsive images.
 * @param {boolean} isMobile - Is mobile viewport
 * @returns {string} - Sizes attribute
 */
export function getImageSizes(isMobile = false) {
  return isMobile 
    ? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
    : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
}
