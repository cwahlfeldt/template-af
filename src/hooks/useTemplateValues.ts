import { useState, useEffect } from 'react';
import { useTemplates } from '../templates/_core/TemplateProvider';
import { TemplateDefinition, TemplateValues } from '../templates/_core/types';

interface UseTemplateValuesReturn {
  template: TemplateDefinition | null;
  values: TemplateValues;
  updateValue: (id: string, value: any) => void;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook to manage template values and their updates
 * @param templateId - The ID of the template to load
 * @returns Template data, values, and update function
 */
const useTemplateValues = (templateId: string): UseTemplateValuesReturn => {
  const { getTemplateById } = useTemplates();
  const [template, setTemplate] = useState<TemplateDefinition | null>(null);
  const [values, setValues] = useState<TemplateValues>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the template
    const fetchedTemplate = getTemplateById(templateId);
    
    if (fetchedTemplate) {
      setTemplate(fetchedTemplate);
      
      // Initialize form values with defaults
      const initialValues: TemplateValues = {};
      fetchedTemplate.fields.forEach(field => {
        initialValues[field.id] = field.default;
      });
      
      setValues(initialValues);
      setLoading(false);
    } else {
      setError(`Template with ID "${templateId}" not found`);
      setLoading(false);
    }
  }, [templateId, getTemplateById]);

  /**
   * Update a template value by field ID
   * Handles both simple values and nested paths (e.g., 'items.0.description')
   */
  const updateValue = (id: string, value: any): void => {
    // Handle nested object paths like 'items.0.description'
    if (id.includes('.')) {
      const parts = id.split('.');
      const newValues = { ...values };
      
      let current = newValues;
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!current[part]) {
          // Create the missing object/array
          current[part] = isNaN(Number(parts[i + 1])) ? {} : [];
        }
        current = current[part];
      }
      
      current[parts[parts.length - 1]] = value;
      setValues(newValues);
    } else {
      // Handle simple paths
      setValues({
        ...values,
        [id]: value
      });
    }
  };

  return {
    template,
    values,
    updateValue,
    loading,
    error
  };
};

export default useTemplateValues;