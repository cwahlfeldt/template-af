import { Template } from '../../../types/templates';

/**
 * Default data for the Social Post template
 */
export const socialPostTemplate: Template = {
  id: "social-media-post",
  name: "Social Media Post",
  description: "Engaging social media template",
  industry: "marketing",
  tags: ["social", "marketing", "digital"],
  icon: "📱",
  template: {
    type: "social-post",
    fields: [
      {
        id: "headline",
        label: "Headline",
        type: "text",
        default: "Introducing Our New Service",
      },
      {
        id: "subtext",
        label: "Subtext",
        type: "text",
        default: "Learn how we can help you achieve your goals",
      },
      {
        id: "callToAction",
        label: "Call to Action",
        type: "text",
        default: "Learn More",
      },
      {
        id: "brandColor",
        label: "Brand Color",
        type: "color",
        default: "#ff5722",
      },
      {
        id: "logo",
        label: "Logo",
        type: "image",
        default: `data:image/svg+xml;base64,PHN2ZyBpZD0ibG9nby0zOSIgd2lkdGg9IjUwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgNTAgNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+IDxwYXRoIGQ9Ik0yNS4wMDAxIDBMNTAgMTUuMDA5OFYyNC45ODYzTDI1LjAwMDEgNDBMMCAyNC45ODYzVjE1LjAwOTlMMjUuMDAwMSAwWiIgZmlsbD0iI0E1QjRGQyIgY2xhc3M9ImNjb21wbGkyIj48L3BhdGg+IDxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMCAxNS4wMDk4TDI1IDBMNTAgMTUuMDA5OFYyNC45ODYzTDI1IDQwTDAgMjQuOTg2M1YxNS4wMDk4Wk0yNSAzMy42MzFMNDQuNjk2NyAyMS44MDIyVjE4LjE5NTFMNDQuNjk1NyAxOC4xOTQ1TDI1IDMwLjAxOTdMNS4zMDQyNiAxOC4xOTQ1TDUuMzAzMyAxOC4xOTUxVjIxLjgwMjJMMjUgMzMuNjMxWk0yNSAyNC41MDQ2TDQwLjEwMTggMTUuNDM3NkwzNi40MjI5IDEzLjIyOThMMjUgMjAuMDg4MUwxMy41NzcxIDEzLjIyOThMOS44OTgyMiAxNS40Mzc2TDI1IDI0LjUwNDZaTTI1IDE0LjU3M0wzMS44MjkgMTAuNDcyOUwyNSA2LjM3NDY3TDE4LjE3MSAxMC40NzI5TDI1IDE0LjU3M1oiIGZpbGw9IiNmZmZmZmYiIGNsYXNzPSJjY3VzdG9tIj48L3BhdGg+IDxwYXRoIGQ9Ik0yNS4wMDAxIDBMMCAxNS4wMDk5VjI0Ljk4NjNMMjUgNDBMMjUuMDAwMSAwWiIgZmlsbD0iI0E1QjRGQyIgY2xhc3M9ImNjb21wbGkyIiBmaWxsLW9wYWNpdHk9IjAuMyI+PC9wYXRoPiA8L3N2Zz4=`,
      },
      {
        id: "backgroundImage",
        label: "Background Image",
        type: "image",
        default: "",
      },
    ],
  },
};