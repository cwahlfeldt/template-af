import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { templateRegistry } from './TemplateRegistry';
import { TemplateDefinition, IndustryType } from './types';
import { initializeTemplates } from './initTemplates';

interface TemplateContextType {
  templates: TemplateDefinition[];
  loading: boolean;
  error: string | null;
  getTemplateById: (id: string) => TemplateDefinition | undefined;
  getTemplatesByIndustry: (industry: IndustryType) => TemplateDefinition[];
  getTemplatesByTags: (tags: string[]) => TemplateDefinition[];
}

// Create the context
const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

// Provider props
interface TemplateProviderProps {
  children: ReactNode;
}

/**
 * Provider component that manages template loading and access
 */
export const TemplateProvider: React.FC<TemplateProviderProps> = ({ children }) => {
  const [templates, setTemplates] = useState<TemplateDefinition[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load templates on mount
  useEffect(() => {
    try {
      // Make sure templates are initialized
      initializeTemplates();
      
      // Get all templates from the registry
      const loadedTemplates = templateRegistry.getAllTemplates();
      setTemplates(loadedTemplates);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load templates:', err);
      setError('Failed to load templates. Please try again later.');
      setLoading(false);
    }
  }, []);

  // Wrapper functions for registry methods
  const getTemplateById = (id: string) => templateRegistry.getTemplateById(id);
  const getTemplatesByIndustry = (industry: IndustryType) => templateRegistry.getTemplatesByIndustry(industry);
  const getTemplatesByTags = (tags: string[]) => templateRegistry.getTemplatesByTags(tags);

  // Context value
  const contextValue: TemplateContextType = {
    templates,
    loading,
    error,
    getTemplateById,
    getTemplatesByIndustry,
    getTemplatesByTags
  };

  return (
    <TemplateContext.Provider value={contextValue}>
      {children}
    </TemplateContext.Provider>
  );
};

/**
 * Hook to use the template context
 */
export const useTemplates = (): TemplateContextType => {
  const context = useContext(TemplateContext);
  
  if (context === undefined) {
    throw new Error('useTemplates must be used within a TemplateProvider');
  }
  
  return context;
};