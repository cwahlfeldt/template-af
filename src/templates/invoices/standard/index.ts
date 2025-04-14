import { TemplateDefinition } from '../../_core/types';
import InvoiceTemplate from './InvoiceTemplate';
import { metadata, fields } from './metadata';

// Combine component, metadata, and fields into a complete template definition
const invoiceTemplate: TemplateDefinition = {
  ...metadata,
  fields,
  component: InvoiceTemplate
};

export default invoiceTemplate;