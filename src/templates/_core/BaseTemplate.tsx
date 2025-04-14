import React from 'react';
import { TemplateComponentProps } from './types';

/**
 * Base class for all template components
 * Provides common functionality for templates
 * 
 * This is an abstract component that should be extended by specific template implementations
 */
const BaseTemplate: React.FC<TemplateComponentProps> = ({
  values,
  onValueChange,
  isEditMode,
  variant,
  size,
  showBackSide,
}) => {
  // This is a base component that should be extended
  // If rendered directly, show a message
  return (
    <div className="bg-gray-100 p-6 rounded-lg flex items-center justify-center">
      <p className="text-gray-500">
        BaseTemplate should not be used directly. 
        Please extend this component for specific templates.
      </p>
    </div>
  );
};

export default BaseTemplate;