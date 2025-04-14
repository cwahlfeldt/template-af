import { templateRegistry } from './TemplateRegistry';
import standardBusinessCardTemplate from '../business-cards/standard';
import doubleSidedBusinessCardTemplate from '../business-cards/double-sided';
import qrCodeBusinessCardTemplate from '../business-cards/qr-code';
import socialPostTemplate from '../social-posts/standard';
import invoiceTemplate from '../invoices/standard';

/**
 * Initialize the template registry with all available templates
 * 
 * This function manually registers all templates to avoid issues with
 * dynamic imports that may not work in all environments.
 * 
 * As new templates are added, they should be imported and registered here.
 */
export function initializeTemplates(): void {
  // Register all templates
  templateRegistry.registerMany([
    // Business cards
    standardBusinessCardTemplate,
    doubleSidedBusinessCardTemplate,
    qrCodeBusinessCardTemplate,
    
    // Social media posts
    socialPostTemplate,
    
    // Invoices
    invoiceTemplate,
    
    // Add more templates here as they are developed
  ]);
  
  // Mark the registry as initialized
  templateRegistry.setInitialized();
}

/**
 * Manually initialize the templates when this module is imported
 * This ensures templates are registered before they are needed
 */
initializeTemplates();

export default initializeTemplates;