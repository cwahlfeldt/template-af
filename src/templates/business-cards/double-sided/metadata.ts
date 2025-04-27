import { TemplateField, IndustryType } from '../../_core/types';

// Template metadata
export const metadata = {
  id: 'double-sided-business-card',
  name: 'Double-Sided Business Card',
  description: 'Professional double-sided business card template',
  industry: 'business' as IndustryType,
  tags: ['card', 'professional', 'contact', 'double-sided'],
  icon: '🔄',
  // Standard business card dimensions: 3.5" x 2"
  printConfig: {
    formats: ['pdf', 'png'] as Array<'pdf' | 'png'>,
    dimensions: {
      width: 3.5,
      height: 2,
      unit: 'in' as 'in' | 'mm' | 'pt'
    },
    orientation: 'landscape' as 'portrait' | 'landscape',
    margins: {
      top: 0.125,
      right: 0.125,
      bottom: 0.125,
      left: 0.125
    }
  },
  hasBackSide: true
};

// Template fields schema
export const fields: TemplateField[] = [
  { 
    id: 'name', 
    label: 'Full Name', 
    type: 'text', 
    default: 'John Doe' 
  },
  {
    id: 'title',
    label: 'Job Title',
    type: 'text',
    default: 'Software Engineer',
  },
  {
    id: 'company',
    label: 'Company Name',
    type: 'text',
    default: 'Tech Solutions Inc.',
  },
  {
    id: 'email',
    label: 'Email',
    type: 'text',
    default: 'john.doe@example.com',
  },
  {
    id: 'phone',
    label: 'Phone',
    type: 'text',
    default: '(555) 123-4567',
  },
  {
    id: 'website',
    label: 'Website',
    type: 'text',
    default: 'www.example.com',
  },
  {
    id: 'address',
    label: 'Address',
    type: 'text',
    default: '123 Business St, City, State 12345',
  },
  {
    id: 'logo',
    label: 'Logo (Front)',
    type: 'image',
    default: `data:image/svg+xml;base64,PHN2ZyBpZD0ibG9nby0zOSIgd2lkdGg9IjUwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgNTAgNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+IDxwYXRoIGQ9Ik0yNS4wMDAxIDBMNTAgMTUuMDA5OFYyNC45ODYzTDI1LjAwMDEgNDBMMCAyNC45ODYzVjE1LjAwOTlMMjUuMDAwMSAwWiIgZmlsbD0iI0E1QjRGQyIgY2xhc3M9ImNjb21wbGkyIj48L3BhdGg+IDxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMCAxNS4wMDk4TDI1IDBMNTAgMTUuMDA5OFYyNC45ODYzTDI1IDQwTDAgMjQuOTg2M1YxNS4wMDk4Wk0yNSAzMy42MzFMNDQuNjk2NyAyMS44MDIyVjE4LjE5NTFMNDQuNjk1NyAxOC4xOTQ1TDI1IDMwLjAxOTdMNS4zMDQyNiAxOC4xOTQ1TDUuMzAzMyAxOC4xOTUxVjIxLjgwMjJMMjUgMzMuNjMxWk0yNSAyNC41MDQ2TDQwLjEwMTggMTUuNDM3NkwzNi40MjI5IDEzLjIyOThMMjUgMjAuMDg4MUwxMy41NzcxIDEzLjIyOThMOS44OTgyMiAxNS40Mzc2TDI1IDI0LjUwNDZaTTI1IDE0LjU3M0wzMS44MjkgMTAuNDcyOUwyNSA2LjM3NDY3TDE4LjE3MSAxMC40NzI5TDI1IDE0LjU3M1oiIGZpbGw9IiM0RjQ2RTUiIGNsYXNzPSJjY3VzdG9tIj48L3BhdGg+IDxwYXRoIGQ9Ik0yNS4wMDAxIDBMMCAxNS4wMDk5VjI0Ljk4NjNMMjUgNDBMMjUuMDAwMSAwWiIgZmlsbD0iI0E1QjRGQyIgY2xhc3M9ImNjb21wbGkyIiBmaWxsLW9wYWNpdHk9IjAuMyI+PC9wYXRoPiA8L3N2Zz4=`,
  },
  {
    id: 'backLogo',
    label: 'Logo (Back)',
    type: 'image',
    default: '',
  },
  {
    id: 'tagline',
    label: 'Tagline',
    type: 'text',
    default: 'Innovative Solutions for Modern Businesses',
  },
  {
    id: 'backContent',
    label: 'Back Content',
    type: 'text',
    default: 'We specialize in custom software development, cloud solutions, and digital transformation. Contact us today to learn how we can help your business grow.',
  },
  {
    id: 'showMapOnBack',
    label: 'Show Map on Back',
    type: 'text',
    default: 'false',
  }
];