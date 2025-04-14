import { TemplateDefinition } from '../../_core/types';
import DoubleSidedBusinessCard from './DoubleSidedBusinessCard';
import { metadata, fields } from './metadata';

// Combine component, metadata, and fields into a complete template definition
const doubleSidedBusinessCardTemplate: TemplateDefinition = {
  ...metadata,
  fields,
  component: DoubleSidedBusinessCard
};

export default doubleSidedBusinessCardTemplate;