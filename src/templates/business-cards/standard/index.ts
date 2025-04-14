import { TemplateDefinition } from '../../_core/types';
import StandardBusinessCard from './StandardBusinessCard';
import { metadata, fields } from './metadata';

// Combine component, metadata, and fields into a complete template definition
const standardBusinessCardTemplate: TemplateDefinition = {
  ...metadata,
  fields,
  component: StandardBusinessCard
};

export default standardBusinessCardTemplate;