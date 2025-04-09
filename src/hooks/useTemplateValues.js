import { useState, useEffect } from 'react';
import { getTemplateById } from '../data/templates';

/**
 * Custom hook to manage template values and their updates
 * @param {string} templateId - The ID of the template to load
 * @returns {Object} Template data, values, and update function
 */
const useTemplateValues = (templateId) => {
  const [template, setTemplate] = useState(null);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the template
    const fetchedTemplate = getTemplateById(templateId);
    
    if (fetchedTemplate) {
      setTemplate(fetchedTemplate);
      
      // Initialize form values with defaults
      const initialValues = {};
      fetchedTemplate.template.fields.forEach(field => {
        initialValues[field.id] = field.default;
      });
      
      setValues(initialValues);
      setLoading(false);
    }
  }, [templateId]);

  /**
   * Update a template value by field ID
   * Handles both simple values and nested paths (e.g., 'items.0.description')
   */
  const updateValue = (id, value) => {
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
    loading
  };
};

export default useTemplateValues;
