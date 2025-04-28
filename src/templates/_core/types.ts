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

// Print configuration
export interface PrintConfig {
  // Allowed export formats
  formats: Array<'pdf' | 'png'>;
  aspectRatio: string;
  initialScale: number;
  
  // Paper dimensions (when exporting to PDF)
  dimensions?: {
    width: number;
    height: number;
    unit: 'mm' | 'in' | 'pt';
  };
  
  // Orientation (when exporting to PDF)
  orientation?: 'portrait' | 'landscape';
  
  // Margins (when exporting to PDF)
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

// Template component props
export interface TemplateComponentProps {
  values: TemplateValues;
  onValueChange: (id: string, value: any) => void;
  isEditMode: boolean;
  variant?: string;
  size?: string;
  showBackSide?: boolean;
  printConfig?: PrintConfig;
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
  
  // Print settings
  printConfig?: PrintConfig;
  
  // Does this template have front/back sides?
  hasBackSide?: boolean;
}