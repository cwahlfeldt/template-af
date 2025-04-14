import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// Initialize template system
import "./templates/_core/initTemplates";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
