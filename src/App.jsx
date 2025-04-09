import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import TemplateEditor from './pages/TemplateEditor';
import TemplateList from './pages/TemplateList';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/templates/:industry" element={<TemplateList />} />
            <Route path="/editor/:templateId" element={<TemplateEditor />} />
          </Routes>
        </main>
        <footer className="bg-gray-100 py-4 text-center text-gray-600">
          <p>© 2025 Template AF. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
