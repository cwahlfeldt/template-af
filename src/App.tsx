// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import TemplateEditor from "./pages/TemplateEditor";
import TemplateList from "./pages/TemplateList";
import MainLayout from "./components/layouts/MainLayout"; // Import the new layout component
import "./App.css";

const App: React.FC = () => {
  return (
    <Router>
      {/* Set a background color or global styles on the root if needed */}
      <div className="min-h-screen bg-latte-base">
        {" "}
        {/* Example background */}
        {/* Navbar is rendered once, outside the main layout */}
        {/* It remains fixed regardless of the content padding */}
        <Navbar />
        {/* Routes are defined using React Router v6 structure */}
        <Routes>
          {/* Define a Layout Route: Routes nested under this will use MainLayout */}
          <Route element={<MainLayout />}>
            {/* These routes will be rendered inside MainLayout's <Outlet /> */}
            <Route path="/" element={<Home />} />
            <Route path="/editor/:templateId" element={<TemplateEditor />} />
            <Route path="/templates/:industry" element={<TemplateList />} />
            {/* Add any other routes that should have the standard layout and padding here */}
          </Route>

          {/* You could have routes outside the MainLayout if they need a different structure */}
          {/* e.g., <Route path="/login" element={<LoginPage />} /> */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
