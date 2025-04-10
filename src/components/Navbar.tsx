import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path
      ? "bg-blue-900 text-white"
      : "text-indigo-100 hover:bg-blue-900 hover:text-white";
  };

  return (
    <nav className="h-full bg-blue-800 text-white shadow-xl flex flex-col w-60 transition-all duration-300 ease-in-out">
      {/* Logo section */}
      <div className="py-4 px-6 border-b border-indigo-700">
        <Link to="/" className="flex items-center space-x-3">
          <span className="text-2xl font-bold tracking-wider">TemplateAF</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="mb-6">
          <ul className="space-y-1">
            <li>
              <Link
                to="/"
                className={`flex items-center px-4 py-3 rounded-md transition-colors duration-200 ${isActive(
                  "/"
                )}`}
              >
                <span className="ml-2">Home</span>
              </Link>
            </li>
            <li>
              <Link
                to="/templates/business"
                className={`flex items-center px-4 py-3 rounded-md transition-colors duration-200 ${isActive(
                  "/templates/business"
                )}`}
              >
                <span className="ml-2">Business</span>
              </Link>
            </li>
            <li>
              <Link
                to="/templates/marketing"
                className={`flex items-center px-4 py-3 rounded-md transition-colors duration-200 ${isActive(
                  "/templates/marketing"
                )}`}
              >
                <span className="ml-2">Marketing</span>
              </Link>
            </li>
            <li>
              <Link
                to="/templates/education"
                className={`flex items-center px-4 py-3 rounded-md transition-colors duration-200 ${isActive(
                  "/templates/education"
                )}`}
              >
                <span className="ml-2">Education</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer section - optional */}
      <div className="p-4 border-t border-indigo-700">
        <p className="text-xs text-indigo-300 text-center">
          © 2025 Template AF
        </p>
      </div>
    </nav>
  );
}

export default Navbar;
