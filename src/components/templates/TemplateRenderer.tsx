import React from 'react';
import BusinessCard from './BusinessCard';
import Invoice from './Invoice';
import SocialPost from './SocialPost';
import { TemplateRendererProps } from '../../types/components';
import { BusinessCardValues, InvoiceValues, SocialPostValues, TemplateType } from '../../types/templates';

/**
 * Component that renders the appropriate template based on template type
 * 
 * @param props - Component props
 * @returns The selected template component
 */
const TemplateRenderer: React.FC<TemplateRendererProps> = ({ template, values, onValueChange, isEditMode, size = 'default' }) => {
  switch (template.type as TemplateType) {
    case 'business-card':
      return (
        <BusinessCard 
          values={values as BusinessCardValues} 
          onValueChange={onValueChange} 
          isEditMode={isEditMode} 
        />
      );

    case 'invoice':
      return (
        <Invoice 
          values={values as InvoiceValues} 
          onValueChange={onValueChange} 
          isEditMode={isEditMode} 
        />
      );

    case 'social-post':
      return (
        <SocialPost 
          values={values as SocialPostValues} 
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
