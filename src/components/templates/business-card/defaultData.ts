import { Template } from '../../../types/templates';

/**
 * Default data for the Business Card template
 */
export const businessCardTemplate: Template = {
  id: "business-card",
  name: "Business Card",
  description: "Professional business card template",
  industry: "business",
  tags: ["card", "professional", "contact"],
  icon: "🪪",
  template: {
    type: "business-card",
    fields: [
      { id: "name", label: "Full Name", type: "text", default: "John Doe" },
      {
        id: "title",
        label: "Job Title",
        type: "text",
        default: "Software Engineer",
      },
      {
        id: "company",
        label: "Company Name",
        type: "text",
        default: "Tech Solutions Inc.",
      },
      {
        id: "email",
        label: "Email",
        type: "text",
        default: "john.doe@example.com",
      },
      {
        id: "phone",
        label: "Phone",
        type: "text",
        default: "(555) 123-4567",
      },
      {
        id: "website",
        label: "Website",
        type: "text",
        default: "www.example.com",
      },
      {
        id: "address",
        label: "Address",
        type: "text",
        default: "123 Business St, City, State 12345",
      },
      {
        id: "logo",
        label: "Logo",
        type: "image",
        default: `data:image/svg+xml;base64,PHN2ZyBpZD0ibG9nby0zOSIgd2lkdGg9IjUwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgNTAgNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+IDxwYXRoIGQ9Ik0yNS4wMDAxIDBMNTAgMTUuMDA5OFYyNC45ODYzTDI1LjAwMDEgNDBMMCAyNC45ODYzVjE1LjAwOTlMMjUuMDAwMSAwWiIgZmlsbD0iI0E1QjRGQyIgY2xhc3M9ImNjb21wbGkyIj48L3BhdGg+IDxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMCAxNS4wMDk4TDI1IDBMNTAgMTUuMDA5OFYyNC45ODYzTDI1IDQwTDAgMjQuOTg2M1YxNS4wMDk4Wk0yNSAzMy42MzFMNDQuNjk2NyAyMS44MDIyVjE4LjE5NTFMNDQuNjk1NyAxOC4xOTQ1TDI1IDMwLjAxOTdMNS4zMDQyNiAxOC4xOTQ1TDUuMzAzMyAxOC4xOTUxVjIxLjgwMjJMMjUgMzMuNjMxWk0yNSAyNC41MDQ2TDQwLjEwMTggMTUuNDM3NkwzNi40MjI5IDEzLjIyOThMMjUgMjAuMDg4MUwxMy41NzcxIDEzLjIyOThMOS44OTgyMiAxNS40Mzc2TDI1IDI0LjUwNDZaTTI1IDE0LjU3M0wzMS44MjkgMTAuNDcyOUwyNSA2LjM3NDY3TDE4LjE3MSAxMC40NzI5TDI1IDE0LjU3M1oiIGZpbGw9IiM0RjQ2RTUiIGNsYXNzPSJjY3VzdG9tIj48L3BhdGg+IDxwYXRoIGQ9Ik0yNS4wMDAxIDBMMCAxNS4wMDk5VjI0Ljk4NjNMMjUgNDBMMjUuMDAwMSAwWiIgZmlsbD0iI0E1QjRGQyIgY2xhc3M9ImNjb21wbGkyIiBmaWxsLW9wYWNpdHk9IjAuMyI+PC9wYXRoPiA8L3N2Zz4=`,
      },
    ],
  },
};