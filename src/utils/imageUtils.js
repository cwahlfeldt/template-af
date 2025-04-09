/**
 * Converts an image file to a data URL.
 * @param {File} file - The image file to convert
 * @returns {Promise<string>} A promise that resolves to the data URL
 */
export const fileToDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target.result);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Validates that a file is an image and within size limits.
 * @param {File} file - The file to validate
 * @param {number} maxSizeInMB - Maximum file size in MB
 * @returns {boolean} Whether the file is valid
 */
export const validateImageFile = (file, maxSizeInMB = 2) => {
  // Check if file is an image
  if (!file.type.match('image.*')) {
    return false;
  }
  
  // Check file size (convert MB to bytes)
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    return false;
  }
  
  return true;
};

/**
 * Resizes an image to a maximum width and height while maintaining aspect ratio.
 * @param {string} dataUrl - The data URL of the image
 * @param {number} maxWidth - Maximum width in pixels
 * @param {number} maxHeight - Maximum height in pixels
 * @returns {Promise<string>} A promise that resolves to the resized image data URL
 */
export const resizeImage = (dataUrl, maxWidth = 800, maxHeight = 600) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = dataUrl;
    
    img.onload = () => {
      // Calculate new dimensions
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      // Create canvas and draw resized image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert canvas to data URL
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
  });
};
