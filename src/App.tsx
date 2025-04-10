import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import TemplateEditor from "./pages/TemplateEditor";
import TemplateList from "./pages/TemplateList";

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <div className="flex">
          <header className="sticky top-0 left-0 h-screen">
            <Navbar />
          </header>
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/editor/:templateId" element={<TemplateEditor />} />
              <Route path="/templates/:industry" element={<TemplateList />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
