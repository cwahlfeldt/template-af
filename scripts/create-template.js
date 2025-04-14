#!/usr/bin/env node

/**
 * Template Creation Script
 * 
 * This script helps automate the creation of new templates
 * by scaffolding the necessary files and structure.
 * 
 * Usage:
 *   node scripts/create-template.js <category> <name>
 * 
 * Example:
 *   node scripts/create-template.js invoices basic
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Setup readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Get arguments
const [, , category, name] = process.argv;

// Validate arguments
if (!category || !name) {
  console.error('Error: Missing required parameters.');
  console.log('Usage: node scripts/create-template.js <category> <name>');
  console.log('Example: node scripts/create-template.js invoices basic');
  process.exit(1);
}

// Create kebab case versions of names
const categoryKebab = category.toLowerCase().replace(/\s+/g, '-');
const nameKebab = name.toLowerCase().replace(/\s+/g, '-');

// Create pascal case versions of names
const categoryPascal = category
  .split(/[-_\s]+/)
  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  .join('');
const namePascal = name
  .split(/[-_\s]+/)
  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  .join('');

// Path to templates directory
const templatesPath = path.join(__dirname, '../src/templates');
const categoryPath = path.join(templatesPath, categoryKebab);
const templatePath = path.join(categoryPath, nameKebab);

// Check if directory already exists
if (fs.existsSync(templatePath)) {
  console.error(`Error: Template "${nameKebab}" already exists in category "${categoryKebab}".`);
  process.exit(1);
}

// Prompt for template details
rl.question('Template display name: ', (displayName) => {
  rl.question('Template description: ', (description) => {
    rl.question('Industry (business, marketing, education, healthcare, technology, hospitality): ', (industry) => {
      rl.question('Tags (comma separated): ', (tagsInput) => {
        rl.question('Icon (emoji): ', (icon) => {
          // Process user input
          const tags = tagsInput.split(',').map(tag => tag.trim());
          
          // Create directories
          fs.mkdirSync(templatePath, { recursive: true });
          
          // Create component file
          const componentContent = generateComponentFile(categoryPascal, namePascal);
          fs.writeFileSync(
            path.join(templatePath, `${namePascal}${categoryPascal}.tsx`),
            componentContent
          );
          
          // Create styles file
          const stylesContent = generateStylesFile(categoryKebab, nameKebab);
          fs.writeFileSync(
            path.join(templatePath, 'styles.css'),
            stylesContent
          );
          
          // Create metadata file
          const metadataContent = generateMetadataFile(
            categoryKebab,
            nameKebab,
            displayName,
            description,
            industry,
            tags,
            icon
          );
          fs.writeFileSync(
            path.join(templatePath, 'metadata.ts'),
            metadataContent
          );
          
          // Create index file
          const indexContent = generateIndexFile(categoryPascal, namePascal);
          fs.writeFileSync(
            path.join(templatePath, 'index.ts'),
            indexContent
          );
          
          console.log(`\nTemplate created successfully at: ${templatePath}\n`);
          console.log('Next steps:');
          console.log('1. Implement the template component');
          console.log('2. Add template fields in metadata.ts');
          console.log(`3. Register your template in src/templates/_core/initTemplates.ts`);
          console.log('');
          
          rl.close();
        });
      });
    });
  });
});

/**
 * Generate the component file content
 */
function generateComponentFile(categoryPascal, namePascal) {
  return `import React from 'react';
import EditableText from '../../../components/editor/EditableText';
import ImageUploadOverlay from '../../../components/editor/ImageUploadOverlay';
import { TemplateComponentProps } from '../../_core/types';
import './styles.css';

/**
 * ${namePascal} ${categoryPascal} template component
 */
const ${namePascal}${categoryPascal}: React.FC<TemplateComponentProps> = ({
  values,
  onValueChange,
  isEditMode,
  variant = 'standard',
  size = 'default',
  showBackSide = false,
}) => {
  // TODO: Implement the template component
  
  return (
    <div className="relative">
      <div className="${nameKebab}-${categoryKebab} w-[350px] bg-white rounded-lg shadow-md p-4">
        <h2 className="text-xl font-bold">
          <EditableText
            value={values.title || "Title"}
            fieldId="title"
            className="block"
            onValueChange={onValueChange}
            isEditMode={isEditMode}
          />
        </h2>
        
        <p className="mt-2">
          <EditableText
            value={values.content || "Content goes here"}
            fieldId="content"
            className="block"
            onValueChange={onValueChange}
            isEditMode={isEditMode}
          />
        </p>
      </div>
    </div>
  );
};

export default ${namePascal}${categoryPascal};
`;
}

/**
 * Generate the styles file content
 */
function generateStylesFile(categoryKebab, nameKebab) {
  return `/* ${nameKebab}-${categoryKebab} Styles */
.${nameKebab}-${categoryKebab} {
  position: relative;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.${nameKebab}-${categoryKebab}:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

/* Print-specific styles */
@media print {
  .${nameKebab}-${categoryKebab} {
    box-shadow: none !important;
    border: 1px solid #e2e2e2;
    break-inside: avoid;
    page-break-inside: avoid;
  }
}

/* Variant-specific styles */
.standard-variant {
  /* Standard style is the default */
}
`;
}

/**
 * Generate the metadata file content
 */
function generateMetadataFile(categoryKebab, nameKebab, displayName, description, industry, tags, icon) {
  // Format tags array as string
  const tagsString = tags.map(tag => `'${tag}'`).join(', ');
  
  return `import { TemplateField, IndustryType } from '../../_core/types';

// Template metadata
export const metadata = {
  id: '${nameKebab}-${categoryKebab}',
  name: '${displayName}',
  description: '${description}',
  industry: '${industry}' as IndustryType,
  tags: [${tagsString}],
  icon: '${icon}',
  variants: {
    standard: {
      name: 'Standard',
      description: 'Standard design',
    }
    // Add more variants as needed
  },
  hasBackSide: false
};

// Template fields schema
export const fields: TemplateField[] = [
  { 
    id: 'title', 
    label: 'Title', 
    type: 'text', 
    default: 'Title' 
  },
  {
    id: 'content',
    label: 'Content',
    type: 'text',
    default: 'Content goes here',
  }
  // Add more fields as needed
];`;
}

/**
 * Generate the index file content
 */
function generateIndexFile(categoryPascal, namePascal) {
  return `import { TemplateDefinition } from '../../_core/types';
import ${namePascal}${categoryPascal} from './${namePascal}${categoryPascal}';
import { metadata, fields } from './metadata';

// Combine component, metadata, and fields into a complete template definition
const ${namePascal.toLowerCase()}${categoryPascal}Template: TemplateDefinition = {
  ...metadata,
  fields,
  component: ${namePascal}${categoryPascal}
};

export default ${namePascal.toLowerCase()}${categoryPascal}Template;`;
}
