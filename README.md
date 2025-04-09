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

- Business Card
- Invoice Template
- Social Media Post
- Lesson Plan
- Patient Intake Form
- Technical Specification Sheet
- Hotel Promotional Flyer

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
- `/src/data` - Template data and helper functions
- `/src/utils` - Utility functions

## Customization

To add new templates:
1. Add template definitions to `/src/data/templates.js`
2. Implement the template renderer in `TemplateRenderer` component

## License

MIT
