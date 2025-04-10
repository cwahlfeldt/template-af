import { Template, TemplateValues } from './templates';

// Interface for useTemplateValues hook return value
export interface UseTemplateValuesReturn {
  template: Template | null;
  values: TemplateValues;
  updateValue: (id: string, value: any) => void;
  loading: boolean;
}
