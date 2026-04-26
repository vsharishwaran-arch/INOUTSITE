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
    
    // Handle URLs with /v{version}/ (older format)
    const cloudinaryMatchWithVersion = url.match(/(.*\/v\d+\/)(.*)/);
    if (cloudinaryMatchWithVersion) {
      const baseUrl = cloudinaryMatchWithVersion[1];
      const restOfUrl = cloudinaryMatchWithVersion[2];
      return `${baseUrl}${transformation}/${restOfUrl}`;
    }
    
    // Handle standard format: https://res.cloudinary.com/{cloud_name}/image/upload/{public_id}
    // or: https://res.cloudinary.com/{cloud_name}/video/upload/{public_id}
    const cloudinaryMatch = url.match(/(.*\/upload\/)(.+)$/);
    if (cloudinaryMatch) {
      const baseUrl = cloudinaryMatch[1];
      const publicId = cloudinaryMatch[2];
      return `${baseUrl}${transformation}/${publicId}`;
    }

    // Fallback: return original URL if pattern doesn't match
    return url;
  } catch (error) {
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
