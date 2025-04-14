/**
 * @deprecated - This file is being replaced by the new template system in src/templates
 * Use imports from src/templates/_core instead
 */

import { IndustryType } from '../templates/_core/types';
import { 
  templateRegistry,
  initializeTemplates
} from '../templates/_core';

// Initialize templates to ensure they're loaded
initializeTemplates();

/**
 * Function to retrieve a template by ID
 * @param id Template ID
 * @returns Template or undefined if not found
 */
export const getTemplateById = (id: string) => {
  return templateRegistry.getTemplateById(id);
};

/**
 * Function to retrieve templates by industry
 * @param industry Industry type
 * @returns Array of templates for the specified industry
 */
export const getTemplatesByIndustry = (industry: IndustryType) => {
  return templateRegistry.getTemplatesByIndustry(industry);
};

/**
 * Function to retrieve all templates
 * @returns Array of all templates
 */
export const getAllTemplates = () => {
  return templateRegistry.getAllTemplates();
};

export default templateRegistry.getAllTemplates();