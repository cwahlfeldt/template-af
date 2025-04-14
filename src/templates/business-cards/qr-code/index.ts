import { TemplateDefinition } from '../../_core/types';
import QRCodeBusinessCard from './QRCodeBusinessCard';
import { metadata, fields } from './metadata';

// Combine component, metadata, and fields into a complete template definition
const qrCodeBusinessCardTemplate: TemplateDefinition = {
  ...metadata,
  fields,
  component: QRCodeBusinessCard
};

export default qrCodeBusinessCardTemplate;