// src/App.tsx
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/navigation/Navbar";
import Home from "./pages/Home";
import TemplateEditor from "./pages/TemplateEditor";
import TemplateList from "./pages/TemplateList";
import MainLayout from "./components/layouts/MainLayout";
import { TemplateProvider } from "./templates/_core/TemplateProvider";
import { initializeTemplates } from "./templates/_core";
import "./App.css";

// Initialize templates when the app loads
initializeTemplates();

const App: React.FC = () => {
  // Ensure templates are initialized
  useEffect(() => {
    initializeTemplates();
  }, []);

  return (
    <TemplateProvider>
      <Router>
        <div className="min-h-screen bg-latte-base">
          <Navbar />
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/editor/:templateId" element={<TemplateEditor />} />
              <Route path="/templates/:industry" element={<TemplateList />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </TemplateProvider>
  );
};

export default App;