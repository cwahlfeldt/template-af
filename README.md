# Template AF

Template AF is a web application that provides pre-defined templates for various businesses and platforms. Users can customize templates with their own text and images, then download the results.

## Features

- Browse templates by industry
- Edit template content with a simple interface
- Preview templates in real-time
- Download templates as PNG images
- No authentication or database required

## Template Categories

- Business
- Marketing
- Education
- Healthcare
- Technology
- Hospitality

## Current Templates

- Business Cards (Standard, Double-Sided, QR Code)
- Invoice Template
- Social Media Post

## Technology Stack

- React with Vite for fast development
- React Router for navigation
- Tailwind CSS for styling
- html-to-image for template export

## Getting Started

### Prerequisites

- Node.js (version 14.0.0 or higher)
- npm (version 6.0.0 or higher)

### Installation

1. Clone the repository
   ```
   git clone <repository-url>
   cd template-af
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the development server
   ```
   npm run dev
   ```

4. Open your browser and navigate to http://localhost:5173

### Build for Production

```
npm run build
```

## Usage

1. Browse templates by industry on the homepage
2. Select a template to customize
3. Edit the template content in the editor
4. Preview your changes in real-time
5. Download the finished template

## Project Structure

- `/src/components` - Reusable UI components
- `/src/pages` - Page components
- `/src/templates` - Template definitions and implementations
- `/src/utils` - Utility functions

## Template System

The template system uses a modular approach where each template is a self-contained unit with its own:
- React component
- Metadata and field definitions
- Styling

Templates are organized by category:
```
/src/templates/
  ├── _core/             # Core template system
  ├── business-cards/    # Business card templates
  ├── invoices/          # Invoice templates
  ├── social-posts/      # Social media post templates
  └── [category]/        # Other template categories
```

### Creating a New Template

You can use the template creation script:

```bash
node scripts/create-template.js <category> <template-name>
```

#### Manual Template Creation

To create a new template manually:

1. **Create the Template Directory Structure**

   ```
   /src/templates/[category]/[template-name]/
   ```

2. **Create These Required Files**:

   - **Component Implementation** (`[TemplateName].tsx`):
     ```tsx
     import React from 'react';
     import EditableText from '../../../components/editor/EditableText';
     import ImageUploadOverlay from '../../../components/editor/ImageUploadOverlay';
     import { TemplateComponentProps } from '../../_core/types';
     import './styles.css';

     const TemplateNameComponent: React.FC<TemplateComponentProps> = ({
       values,
       onValueChange,
       isEditMode,
       variant = 'standard',
     }) => {
       return (
         <div className="your-template-class">
           {/* Your template implementation */}
           <EditableText
             value={values.title}
             fieldId="title"
             className="block"
             onValueChange={onValueChange}
             isEditMode={isEditMode}
           />
         </div>
       );
     };

     export default TemplateNameComponent;
     ```

   - **Metadata and Fields** (`metadata.ts`):
     ```typescript
     import { TemplateField, IndustryType } from '../../_core/types';

     // Template metadata
     export const metadata = {
       id: 'your-template-id',
       name: 'Your Template Name',
       description: 'Description of your template',
       industry: 'business' as IndustryType,
       tags: ['tag1', 'tag2'],
       icon: '📄', // Emoji icon
       variants: {
         standard: {
           name: 'Standard',
           description: 'Standard design',
         }
         // Add more variants if needed
       }
     };

     // Template fields schema
     export const fields: TemplateField[] = [
       { 
         id: 'title', 
         label: 'Title', 
         type: 'text', 
         default: 'Default Title' 
       },
       // Add more fields as needed
     ];
     ```

   - **Styles** (`styles.css`):
     ```css
     /* Your template styles */
     .your-template-class {
       position: relative;
       width: 400px;
       /* Add your styling */
     }
     ```

   - **Index File** (`index.ts`):
     ```typescript
     import { TemplateDefinition } from '../../_core/types';
     import TemplateNameComponent from './TemplateNameComponent';
     import { metadata, fields } from './metadata';

     const templateNameTemplate: TemplateDefinition = {
       ...metadata,
       fields,
       component: TemplateNameComponent
     };

     export default templateNameTemplate;
     ```

3. **Register the Template**:

   Open `/src/templates/_core/initTemplates.ts` and add your template:

   ```typescript
   import templateNameTemplate from '../category/template-name';

   // In the initializeTemplates function:
   templateRegistry.registerMany([
     // ...existing templates
     templateNameTemplate,
   ]);
   ```

### Advanced Template Features

- **Size Variants**: For templates with different size options (like social media posts)
- **Style Variants**: For templates with different styles or themes
- **Interactive Elements**: For templates with editable fields, images, or other interactive elements

See existing templates for examples of implementation patterns.

## License

MIT
