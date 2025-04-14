import { ReactNode } from 'react';
import { 
  Template, 
  TemplateValues, 
  TemplateDefinition, 
  InvoiceItem, 
  BusinessCardValues,
  DoubleSidedCardValues,
  QRCodeCardValues,
  InvoiceValues,
  SocialPostValues
} from './templates';

// Generic props interface for template components
export interface TemplateComponentProps {
  values: TemplateValues;
  onValueChange: (id: string, value: any) => void;
  isEditMode: boolean;
}

// Template renderer props
export interface TemplateRendererProps extends TemplateComponentProps {
  template: TemplateDefinition;
  size?: string;
  cardStyle?: "standard" | "modern" | "minimal";
  showBackSide?: boolean;
}

// Business card props
export interface BusinessCardProps extends TemplateComponentProps {
  values: BusinessCardValues;
  cardStyle?: "standard" | "modern" | "minimal";
}

// Standard card props
export interface StandardCardProps extends TemplateComponentProps {
  values: BusinessCardValues;
  cardStyle?: "standard" | "modern" | "minimal";
}

// Double-sided card props
export interface DoubleSidedCardProps extends TemplateComponentProps {
  values: DoubleSidedCardValues;
  showBackSide?: boolean;
  onFlip?: () => void;
}

// QR code card props
export interface QRCodeCardProps extends TemplateComponentProps {
  values: QRCodeCardValues;
  showBackSide?: boolean;
  onFlip?: () => void;
}

// Invoice props
export interface InvoiceProps extends TemplateComponentProps {
  values: InvoiceValues;
}

// Social post props
export interface SocialPostProps extends TemplateComponentProps {
  values: SocialPostValues;
  size?: string;
}

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

// Invoice item props
export interface InvoiceItemProps {
  item: InvoiceItem;
  index: number;
  onUpdate: (index: number, field: string, value: any) => void;
  onRemove: (index: number) => void;
}

// Size variants for social post
export interface SizeVariant {
  width: number;
  height: number;
  className: string;
}

export interface SizeVariants {
  [key: string]: SizeVariant;
  instagram: SizeVariant;
  instagramStory: SizeVariant;
  facebook: SizeVariant;
  twitter: SizeVariant;
  linkedin: SizeVariant;
}

// Preview option interface
export interface PreviewOption {
  id: string;
  name: string;
}