import React from 'react';

/**
 * Component for adding image upload functionality to template images
 * 
 * @param {Object} props - Component props
 * @param {string} props.fieldId - The field ID for the image
 * @param {function} props.onValueChange - Function to call when image changes
 * @param {boolean} props.isEditMode - Whether edit mode is active
 * @returns {JSX.Element|null} Image upload overlay or null when not in edit mode
 */
const ImageUploadOverlay = ({ fieldId, onValueChange, isEditMode }) => {
  if (!isEditMode) return null;
  
  const handleImageClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          onValueChange(fieldId, event.target.result);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };
  
  return (
    <div 
      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
      onClick={handleImageClick}
    >
      <span className="text-white text-sm font-medium px-2 py-1 bg-black bg-opacity-75 rounded">
        Change Image
      </span>
    </div>
  );
};

export default ImageUploadOverlay;
