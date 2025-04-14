// Export all types
export * from './types';

// Import and export registry
import templateRegistry from './TemplateRegistry';
export { templateRegistry };

// Export BaseTemplate component
export { default as BaseTemplate } from './BaseTemplate';

// Export template provider
export { TemplateProvider, useTemplates } from './TemplateProvider';

// Export initialization function
export { initializeTemplates } from './initTemplates';

// Helper functions to work with templates
export const getTemplateById = (id: string) => {
  return templateRegistry.getTemplateById(id);
};

export const getAllTemplates = () => {
  return templateRegistry.getAllTemplates();
};

export const getTemplatesByIndustry = (industry: string) => {
  return templateRegistry.getTemplatesByIndustry(industry as any);
};

export const getTemplatesByTags = (tags: string[]) => {
  return templateRegistry.getTemplatesByTags(tags);
};