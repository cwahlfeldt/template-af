import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-indigo-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">Template AF</Link>
          <div className="flex space-x-4">
            <Link to="/" className="hover:text-indigo-200 transition-colors">Home</Link>
            <Link to="/templates/business" className="hover:text-indigo-200 transition-colors">Business</Link>
            <Link to="/templates/marketing" className="hover:text-indigo-200 transition-colors">Marketing</Link>
            <Link to="/templates/education" className="hover:text-indigo-200 transition-colors">Education</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
