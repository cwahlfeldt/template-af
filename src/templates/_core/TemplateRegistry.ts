import { TemplateDefinition, IndustryType } from './types';

/**
 * Central registry for all templates in the application
 * This class manages the collection of templates and provides methods to access them
 */
class TemplateRegistry {
  private templates: TemplateDefinition[] = [];
  private initialized: boolean = false;

  /**
   * Register a template with the registry
   * @param template Template definition to register
   */
  register(template: TemplateDefinition): void {
    // Check if a template with this ID already exists
    const existingIndex = this.templates.findIndex(t => t.id === template.id);
    
    if (existingIndex >= 0) {
      // Replace existing template
      this.templates[existingIndex] = template;
    } else {
      // Add new template
      this.templates.push(template);
    }
  }

  /**
   * Register multiple templates at once
   * @param templates Array of template definitions
   */
  registerMany(templates: TemplateDefinition[]): void {
    templates.forEach(template => this.register(template));
  }

  /**
   * Retrieve all templates
   * @returns Array of all registered templates
   */
  getAllTemplates(): TemplateDefinition[] {
    return [...this.templates];
  }

  /**
   * Get a template by its ID
   * @param id Template ID
   * @returns Template or undefined if not found
   */
  getTemplateById(id: string): TemplateDefinition | undefined {
    return this.templates.find(t => t.id === id);
  }

  /**
   * Get templates filtered by industry
   * @param industry Industry type to filter by
   * @returns Array of templates for the specified industry
   */
  getTemplatesByIndustry(industry: IndustryType): TemplateDefinition[] {
    return this.templates.filter(t => t.industry === industry);
  }

  /**
   * Get templates filtered by tags
   * @param tags Tags to filter by (any match)
   * @returns Array of templates with any of the specified tags
   */
  getTemplatesByTags(tags: string[]): TemplateDefinition[] {
    return this.templates.filter(t => 
      t.tags.some(tag => tags.includes(tag))
    );
  }

  /**
   * Mark the registry as initialized
   */
  setInitialized(): void {
    this.initialized = true;
  }

  /**
   * Check if the registry is initialized
   * @returns True if initialized, false otherwise
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

// Singleton instance
export const templateRegistry = new TemplateRegistry();

export default templateRegistry;