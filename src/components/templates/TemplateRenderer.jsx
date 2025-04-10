import React from 'react';
import BusinessCard from './BusinessCard';
import Invoice from './Invoice';
import SocialPost from './SocialPost';

/**
 * Component that renders the appropriate template based on template type
 * 
 * @param {Object} props - Component props
 * @param {Object} props.template - Template definition
 * @param {Object} props.values - Template values
 * @param {function} props.onValueChange - Function to call when values change
 * @param {boolean} props.isEditMode - Whether edit mode is active
 * @param {string} props.size - Size variant for responsive templates
 * @returns {JSX.Element} The selected template component
 */
const TemplateRenderer = ({ template, values, onValueChange, isEditMode, size = 'default' }) => {
  switch (template.type) {
    case 'business-card':
      return (
        <BusinessCard 
          values={values} 
          onValueChange={onValueChange} 
          isEditMode={isEditMode} 
        />
      );

    case 'invoice':
      return (
        <Invoice 
          values={values} 
          onValueChange={onValueChange} 
          isEditMode={isEditMode} 
        />
      );

    case 'social-post':
      return (
        <SocialPost 
          values={values} 
          onValueChange={onValueChange} 
          isEditMode={isEditMode}
          size={size}
        />
      );

    default:
      return (
        <div className="bg-gray-100 p-6 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Preview not available for this template type.</p>
        </div>
      );
  }
};

export default TemplateRenderer;
