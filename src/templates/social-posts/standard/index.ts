import { TemplateDefinition } from '../../_core/types';
import SocialPostTemplate from './SocialPostTemplate';
import { metadata, fields } from './metadata';

// Combine component, metadata, and fields into a complete template definition
const socialPostTemplate: TemplateDefinition = {
  ...metadata,
  fields,
  component: SocialPostTemplate
};

export default socialPostTemplate;