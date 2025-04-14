import { TemplateField, IndustryType } from '../../_core/types';

// Template metadata
export const metadata = {
  id: 'qr-code-business-card',
  name: 'QR Code Business Card',
  description: 'Modern business card template with QR code for digital contact sharing',
  industry: 'business' as IndustryType,
  tags: ['card', 'professional', 'contact', 'qr-code', 'digital'],
  icon: '📱',
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
    label: 'Logo',
    type: 'image',
    default: `data:image/svg+xml;base64,PHN2ZyBpZD0ibG9nby0zOSIgd2lkdGg9IjUwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgNTAgNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+IDxwYXRoIGQ9Ik0yNS4wMDAxIDBMNTAgMTUuMDA5OFYyNC45ODYzTDI1LjAwMDEgNDBMMCAyNC45ODYzVjE1LjAwOTlMMjUuMDAwMSAwWiIgZmlsbD0iI0E1QjRGQyIgY2xhc3M9ImNjb21wbGkyIj48L3BhdGg+IDxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMCAxNS4wMDk4TDI1IDBMNTAgMTUuMDA5OFYyNC45ODYzTDI1IDQwTDAgMjQuOTg2M1YxNS4wMDk4Wk0yNSAzMy42MzFMNDQuNjk2NyAyMS44MDIyVjE4LjE5NTFMNDQuNjk1NyAxOC4xOTQ1TDI1IDMwLjAxOTdMNS4zMDQyNiAxOC4xOTQ1TDUuMzAzMyAxOC4xOTUxVjIxLjgwMjJMMjUgMzMuNjMxWk0yNSAyNC41MDQ2TDQwLjEwMTggMTUuNDM3NkwzNi40MjI5IDEzLjIyOThMMjUgMjAuMDg4MUwxMy41NzcxIDEzLjIyOThMOS44OTgyMiAxNS40Mzc2TDI1IDI0LjUwNDZaTTI1IDE0LjU3M0wzMS44MjkgMTAuNDcyOUwyNSA2LjM3NDY3TDE4LjE3MSAxMC40NzI5TDI1IDE0LjU3M1oiIGZpbGw9IiM0RjQ2RTUiIGNsYXNzPSJjY3VzdG9tIj48L3BhdGg+IDxwYXRoIGQ9Ik0yNS4wMDAxIDBMMCAxNS4wMDk5VjI0Ljk4NjNMMjUgNDBMMjUuMDAwMSAwWiIgZmlsbD0iI0E1QjRGQyIgY2xhc3M9ImNjb21wbGkyIiBmaWxsLW9wYWNpdHk9IjAuMyI+PC9wYXRoPiA8L3N2Zz4=`,
  },
  {
    id: 'qrCodeData',
    label: 'QR Code Data',
    type: 'text',
    default: "BEGIN:VCARD\nVERSION:3.0\nN:Doe;John\nFN:John Doe\nTITLE:Software Engineer\nORG:Tech Solutions Inc.\nEMAIL:john.doe@example.com\nTEL:(555) 123-4567\nURL:www.example.com\nADR:;;123 Business St;City;State;12345;USA\nEND:VCARD",
  },
  {
    id: 'qrCodeLabel',
    label: 'QR Code Label',
    type: 'text',
    default: 'Scan to connect',
  },
  {
    id: 'backContent',
    label: 'Back Content',
    type: 'text',
    default: 'Thank you for your interest! Scan the QR code on the front to add my contact information to your phone.',
  },
  {
    id: 'linkedinProfile',
    label: 'LinkedIn Profile',
    type: 'text',
    default: 'linkedin.com/in/johndoe',
  },
  {
    id: 'twitterHandle',
    label: 'Twitter Handle',
    type: 'text',
    default: '@johndoe',
  },
  {
    id: 'instagramHandle',
    label: 'Instagram Handle',
    type: 'text',
    default: '@johndoe_tech',
  }
];