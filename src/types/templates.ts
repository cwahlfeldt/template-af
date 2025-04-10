// Define more specific industry types
export type IndustryType = 
  | 'business'
  | 'marketing'
  | 'education'
  | 'healthcare'
  | 'technology'
  | 'hospitality';

// Define field types with string literals
export type FieldType = 'text' | 'image' | 'color' | 'array' | 'calculated';

// Define template types with string literals
export type TemplateType = 
  | 'business-card' 
  | 'invoice' 
  | 'social-post'
  | 'lesson-plan'
  | 'medical-form'
  | 'spec-sheet'
  | 'hotel-flyer';

// Define item interface for invoice items
export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

// Base field interface
export interface Field {
  id: string;
  label: string;
  type: FieldType;
  default: any;
}

// Template field (with type-specific properties)
export interface TemplateField extends Field {
  // Additional properties specific to different field types
  options?: string[]; // For select fields
}

// Template definition
export interface TemplateDefinition {
  type: TemplateType;
  fields: TemplateField[];
}

// Full template object
export interface Template {
  id: string;
  name: string;
  description: string;
  industry: IndustryType;
  tags: string[];
  icon: string;
  template: TemplateDefinition;
}

// Template values interface (for dynamic values)
export interface TemplateValues {
  [key: string]: any;
}

// More specific type for social post values
export interface SocialPostValues extends TemplateValues {
  headline: string;
  subtext: string;
  callToAction: string;
  brandColor: string;
  backgroundImage?: string;
  logo?: string;
}

// More specific type for business card values
export interface BusinessCardValues extends TemplateValues {
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  logo?: string;
}

// More specific type for invoice values
export interface InvoiceValues extends TemplateValues {
  companyName: string;
  companyInfo: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  clientName: string;
  clientAddress: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: string | number;
  total: number;
  notes: string;
  logo?: string;
}