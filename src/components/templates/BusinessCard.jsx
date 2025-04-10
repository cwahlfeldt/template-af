import React, { useState } from 'react';
import EditableText from '../editor/EditableText';
import ImageUploadOverlay from '../editor/ImageUploadOverlay';

/**
 * Business Card template component with multiple designs
 * 
 * @param {Object} props - Component props
 * @param {Object} props.values - Template values
 * @param {function} props.onValueChange - Function to call when values change
 * @param {boolean} props.isEditMode - Whether edit mode is active
 * @returns {JSX.Element} Business card template
 */
const BusinessCard = ({ values, onValueChange, isEditMode }) => {
  const [design, setDesign] = useState('standard');
  
  // Different design layouts
  const designs = {
    standard: 'Standard',
    modern: 'Modern',
    minimal: 'Minimal'
  };
  
  // Only show the design selector in edit mode
  const DesignSelector = () => {
    if (!isEditMode) return null;
    
    return (
      <div className="absolute -top-12 left-0 flex items-center space-x-2">
        <span className="text-xs font-medium text-gray-700">Card Style:</span>
        <select
          value={design}
          onChange={(e) => setDesign(e.target.value)}
          className="text-xs border border-gray-300 rounded-md p-1"
        >
          {Object.entries(designs).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>
    );
  };
  
  // Render the appropriate design
  switch (design) {
    case 'modern':
      return (
        <div className="relative">
          <DesignSelector />
          <div className="business-card bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-lg shadow-md w-[350px] h-[200px] flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-white">
                  <EditableText 
                    value={values.name} 
                    fieldId="name" 
                    className="block" 
                    onValueChange={onValueChange}
                    isEditMode={isEditMode}
                  />
                </h2>
                <p className="text-indigo-100">
                  <EditableText 
                    value={values.title} 
                    fieldId="title" 
                    className="block" 
                    onValueChange={onValueChange}
                    isEditMode={isEditMode}
                  />
                </p>
              </div>
              <div className="relative w-16 h-16 bg-white rounded-full flex items-center justify-center overflow-hidden">
                {values.logo && (
                  <>
                    <img src={values.logo} alt="Logo" className="w-12 h-12 object-contain" />
                    <ImageUploadOverlay 
                      fieldId="logo" 
                      onValueChange={onValueChange}
                      isEditMode={isEditMode}
                    />
                  </>
                )}
              </div>
            </div>
            <div className="text-sm text-white mt-2">
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
                  className="block text-indigo-100" 
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
        </div>
      );
      
    case 'minimal':
      return (
        <div className="relative">
          <DesignSelector />
          <div className="business-card bg-white p-6 rounded-lg shadow-md w-[350px] h-[200px] flex flex-col justify-between border-l-4 border-gray-800">
            <div>
              <h2 className="text-2xl font-light text-gray-800 mb-1">
                <EditableText 
                  value={values.name} 
                  fieldId="name" 
                  className="block" 
                  onValueChange={onValueChange}
                  isEditMode={isEditMode}
                />
              </h2>
              <p className="text-gray-500 text-sm mb-3">
                <EditableText 
                  value={values.title} 
                  fieldId="title" 
                  className="block" 
                  onValueChange={onValueChange}
                  isEditMode={isEditMode}
                />
              </p>
              <p className="font-medium text-gray-800 text-sm">
                <EditableText 
                  value={values.company} 
                  fieldId="company" 
                  className="block" 
                  onValueChange={onValueChange}
                  isEditMode={isEditMode}
                />
              </p>
            </div>
            
            <div className="flex justify-between items-end">
              <div className="text-xs text-gray-600 space-y-1">
                <div>
                  <EditableText 
                    value={values.phone} 
                    fieldId="phone" 
                    className="block" 
                    onValueChange={onValueChange}
                    isEditMode={isEditMode}
                  />
                </div>
                <div>
                  <EditableText 
                    value={values.email} 
                    fieldId="email" 
                    className="block" 
                    onValueChange={onValueChange}
                    isEditMode={isEditMode}
                  />
                </div>
                <div>
                  <EditableText 
                    value={values.website} 
                    fieldId="website" 
                    className="block" 
                    onValueChange={onValueChange}
                    isEditMode={isEditMode}
                  />
                </div>
                <div>
                  <EditableText 
                    value={values.address} 
                    fieldId="address" 
                    className="block" 
                    onValueChange={onValueChange}
                    isEditMode={isEditMode}
                  />
                </div>
              </div>
              
              <div className="relative w-16 h-16">
                {values.logo && (
                  <>
                    <img src={values.logo} alt="Logo" className="w-16 h-16 object-contain opacity-70" />
                    <ImageUploadOverlay 
                      fieldId="logo" 
                      onValueChange={onValueChange}
                      isEditMode={isEditMode}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      );
      
    // Standard design (default)
    default:
      return (
        <div className="relative">
          <DesignSelector />
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
        </div>
      );
  }
};

export default BusinessCard;
