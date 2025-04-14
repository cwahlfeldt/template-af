import { ReactNode } from 'react';

// Industry types
export type IndustryType = 
  | 'business'
  | 'marketing'
  | 'education'
  | 'healthcare'
  | 'technology'
  | 'hospitality';

// Field types
export type FieldType = 'text' | 'image' | 'color' | 'array' | 'calculated';

// Template field definition
export interface TemplateField {
  id: string;
  label: string;
  type: FieldType;
  default: any;
  options?: string[];
}

// Template values (data entered by users)
export interface TemplateValues {
  [key: string]: any;
}

// Preview size configuration
export interface PreviewSize {
  id: string;
  name: string;
  width?: number;
  height?: number;
  className?: string;
}

// Template component props
export interface TemplateComponentProps {
  values: TemplateValues;
  onValueChange: (id: string, value: any) => void;
  isEditMode: boolean;
  variant?: string;
  size?: string;
  showBackSide?: boolean;
}

// Template definition
export interface TemplateDefinition {
  // Basic metadata
  id: string;
  name: string;
  description: string;
  industry: IndustryType;
  tags: string[];
  icon: string;
  
  // Template structure
  fields: TemplateField[];
  
  // The actual component
  component: React.ComponentType<TemplateComponentProps>;
  
  // Optional configuration
  variants?: {
    [key: string]: {
      name: string;
      description?: string;
    }
  };
  
  // Preview settings
  previewSizes?: PreviewSize[];
  
  // Does this template have front/back sides?
  hasBackSide?: boolean;
}