import { TemplateDefinition } from './types';
import templateRegistry from './TemplateRegistry';
import { initializeTemplates } from './initTemplates';

/**
 * Template loader responsible for dynamically loading templates
 * and registering them with the template registry
 * 
 * Note: This class is kept for compatibility with existing code,
 * but we now use manual initialization via initTemplates.ts
 * 
 * @deprecated Use initializeTemplates() from initTemplates.ts instead
 */
class TemplateLoader {
  private initialized: boolean = false;
  
  /**
   * Initialize the template loader and load all templates
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return Promise.resolve();
    }
    
    // Use the manual initialization function
    initializeTemplates();
    this.initialized = true;
    return Promise.resolve();
  }
  
  /**
   * Check if templates are loaded
   * @returns True if templates are loaded, false otherwise
   */
  isLoaded(): boolean {
    return templateRegistry.isInitialized();
  }
}

// Singleton instance
export const templateLoader = new TemplateLoader();

export default templateLoader;