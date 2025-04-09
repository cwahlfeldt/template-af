import React from 'react';
import EditableText from '../editor/EditableText';
import ImageUploadOverlay from '../editor/ImageUploadOverlay';

/**
 * Business Card template component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.values - Template values
 * @param {function} props.onValueChange - Function to call when values change
 * @param {boolean} props.isEditMode - Whether edit mode is active
 * @returns {JSX.Element} Business card template
 */
const BusinessCard = ({ values, onValueChange, isEditMode }) => {
  return (
    <div className="business-card bg-white p-6 rounded-lg shadow-md w-[350px] h-[200px] flex flex-col justify-between border border-gray-200">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            <EditableText 
              value={values.name} 
              fieldId="name" 
              className="block" 
              onValueChange={onValueChange}
              isEditMode={isEditMode}
            />
          </h2>
          <p className="text-gray-600">
            <EditableText 
              value={values.title} 
              fieldId="title" 
              className="block" 
              onValueChange={onValueChange}
              isEditMode={isEditMode}
            />
          </p>
        </div>
        <div className="relative w-16 h-16">
          {values.logo && (
            <>
              <img src={values.logo} alt="Logo" className="w-16 h-16 object-contain" />
              <ImageUploadOverlay 
                fieldId="logo" 
                onValueChange={onValueChange}
                isEditMode={isEditMode}
              />
            </>
          )}
        </div>
      </div>
      <div className="text-sm text-gray-700 mt-2">
        <p className="font-semibold">
          <EditableText 
            value={values.company} 
            fieldId="company" 
            className="block" 
            onValueChange={onValueChange}
            isEditMode={isEditMode}
          />
        </p>
        <p>
          <EditableText 
            value={values.address} 
            fieldId="address" 
            className="block" 
            onValueChange={onValueChange}
            isEditMode={isEditMode}
          />
        </p>
        <div className="flex flex-col mt-2">
          <EditableText 
            value={values.phone} 
            fieldId="phone" 
            className="block" 
            onValueChange={onValueChange}
            isEditMode={isEditMode}
          />
          <EditableText 
            value={values.email} 
            fieldId="email" 
            className="block" 
            onValueChange={onValueChange}
            isEditMode={isEditMode}
          />
          <EditableText 
            value={values.website} 
            fieldId="website" 
            className="block" 
            onValueChange={onValueChange}
            isEditMode={isEditMode}
          />
        </div>
      </div>
    </div>
  );
};

export default BusinessCard;
