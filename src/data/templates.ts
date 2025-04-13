import { Template, IndustryType, TemplateType } from '../types/templates';
import { businessCardTemplate } from '../components/templates/business-card';
import { invoiceTemplate } from '../components/templates/invoice';
import { socialPostTemplate } from '../components/templates/social-post';

// Template data structure
const templates: Template[] = [
  businessCardTemplate,
  invoiceTemplate,
  socialPostTemplate,
];

/**
 * Function to retrieve a template by ID
 * @param id Template ID
 * @returns Template or undefined if not found
 */
export const getTemplateById = (id: string): Template | undefined => {
  return templates.find((template) => template.id === id);
};

/**
 * Function to retrieve templates by industry
 * @param industry Industry type
 * @returns Array of templates for the specified industry
 */
export const getTemplatesByIndustry = (industry: IndustryType): Template[] => {
  return templates.filter((template) => template.industry === industry);
};

/**
 * Function to retrieve all templates
 * @returns Array of all templates
 */
export const getAllTemplates = (): Template[] => {
  return [...templates];
};

export default templates;