import React from 'react';
import EditableText from '../editor/EditableText';
import ImageUploadOverlay from '../editor/ImageUploadOverlay';

/**
 * Social Media Post template component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.values - Template values
 * @param {function} props.onValueChange - Function to call when values change
 * @param {boolean} props.isEditMode - Whether edit mode is active
 * @returns {JSX.Element} Social media post template
 */
const SocialPost = ({ values, onValueChange, isEditMode }) => {
  const handleColorChange = () => {
    if (!isEditMode) return;
    
    const color = prompt('Enter a new color (hex code, e.g. #ff5722):', values.brandColor);
    if (color && /^#[0-9A-F]{6}$/i.test(color)) {
      onValueChange('brandColor', color);
    }
  };
  
  return (
    <div 
      className="social-post rounded-lg shadow-md w-[600px] h-[600px] flex flex-col justify-between overflow-hidden relative"
      style={{ backgroundColor: values.brandColor || '#ff5722' }}
    >
      {values.backgroundImage && (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-75"
            style={{ backgroundImage: `url(${values.backgroundImage})` }}
          />
          {isEditMode && (
            <div className="absolute top-0 left-0 z-10 w-full h-full">
              <ImageUploadOverlay 
                fieldId="backgroundImage" 
                onValueChange={onValueChange}
                isEditMode={isEditMode}
              />
            </div>
          )}
        </>
      )}
      
      <div className="relative p-8 flex justify-between items-start">
        <div className="relative w-20 h-20">
          {values.logo && (
            <>
              <img src={values.logo} alt="Logo" className="w-20 h-20 object-contain" />
              {isEditMode && (
                <ImageUploadOverlay 
                  fieldId="logo" 
                  onValueChange={onValueChange}
                  isEditMode={isEditMode}
                />
              )}
            </>
          )}
        </div>
        
        {isEditMode && (
          <div 
            className="z-10 p-2 bg-white rounded-full shadow-md cursor-pointer"
            onClick={handleColorChange}
          >
            <span className="block w-6 h-6 rounded-full" style={{ backgroundColor: values.brandColor }} />
          </div>
        )}
      </div>
      
      <div className="relative p-8 text-white text-center">
        <h2 className="text-4xl font-bold mb-4 drop-shadow-md">
          <EditableText 
            value={values.headline} 
            fieldId="headline" 
            className="block" 
            onValueChange={onValueChange}
            isEditMode={isEditMode}
          />
        </h2>
        <p className="text-xl mb-8 drop-shadow-md">
          <EditableText 
            value={values.subtext} 
            fieldId="subtext" 
            className="block" 
            onValueChange={onValueChange}
            isEditMode={isEditMode}
          />
        </p>
        <button className="bg-white text-black font-semibold py-3 px-8 rounded-full text-xl">
          <EditableText 
            value={values.callToAction} 
            fieldId="callToAction" 
            className="inline" 
            onValueChange={onValueChange}
            isEditMode={isEditMode}
          />
        </button>
      </div>
    </div>
  );
};

export default SocialPost;
