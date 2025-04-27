/**
 * @deprecated - This file is deprecated and exists only for backwards compatibility.
 * Import types directly from src/templates/_core/types.ts instead.
 */

import { ReactNode } from 'react';
import { TemplateValues } from '../templates/_core/types';

// Editable text component props
export interface EditableTextProps {
  value: string;
  fieldId: string;
  className: string;
  onValueChange: (id: string, value: any) => void;
  isEditMode: boolean;
}

// Image upload overlay props
export interface ImageUploadOverlayProps {
  fieldId: string;
  onValueChange: (id: string, value: any) => void;
  isEditMode: boolean;
}

// Navbar props
export interface NavbarProps {
  children?: ReactNode;
}

// Color picker props
export interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

// Template list props
export interface TemplateListProps {
  industry?: string;
}

// Preview option interface - Moved to _core/types.ts
export interface PreviewOption {
  id: string;
  name: string;
}