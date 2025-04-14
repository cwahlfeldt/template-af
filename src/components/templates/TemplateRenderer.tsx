import React from "react";
import { TemplateDefinition } from "../../templates/_core/types";

interface TemplateRendererProps {
  template: TemplateDefinition;
  values: any;
  onValueChange: (id: string, value: any) => void;
  isEditMode: boolean;
  size?: string;
  variant?: string;
  showBackSide?: boolean;
}

/**
 * Component that renders the appropriate template based on template definition
 * This is a thin wrapper that delegates rendering to the template's component
 */
const TemplateRenderer: React.FC<TemplateRendererProps> = ({
  template,
  values,
  onValueChange,
  isEditMode,
  size = "default",
  variant = "standard",
  showBackSide = false,
}) => {
  if (!template || !template.component) {
    return (
      <div className="bg-gray-100 p-6 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">
          Preview not available for this template.
        </p>
      </div>
    );
  }

  // Create an instance of the template's component
  const TemplateComponent = template.component;
  
  return (
    <TemplateComponent
      values={values}
      onValueChange={onValueChange}
      isEditMode={isEditMode}
      size={size}
      variant={variant}
      showBackSide={showBackSide}
    />
  );
};

export default TemplateRenderer;