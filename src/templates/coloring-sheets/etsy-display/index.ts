import { TemplateDefinition } from '../../_core/types';
import EtsyDisplayColoringSheet from './EtsyDisplayColoringSheet';
import { metadata, fields } from './metadata';

// Combine component, metadata, and fields into a complete template definition
const etsyDisplayColoringSheetTemplate: TemplateDefinition = {
  ...metadata,
  fields,
  component: EtsyDisplayColoringSheet
};

export default etsyDisplayColoringSheetTemplate;