import { Link, useLocation } from "react-router-dom";
import React from "react";

function Navbar() {
  const location = useLocation();
  const isVertical = location.pathname.startsWith("/editor");

  const isActive = (path: string): string => {
    return location.pathname === path
      ? "bg-blue-100/60 text-blue-700 font-semibold"
      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900";
  };

  const navBaseClasses =
    "fixed top-4 z-50 m-4 bg-white/80 backdrop-blur-md rounded-lg shadow-lg border border-gray-200/50 transition-all duration-300 ease-in-out flex";

  const navLayoutClasses = isVertical
    ? "flex-col w-60 h-auto p-2"
    : "flex-row items-center w-auto mx-auto max-w-fit p-1.5  inset-x-0 max-w-max mx-auto"; // max-w-fit makes it hug content horizontally

  const listBaseClasses = "flex items-center"; // items-center works for both row/col alignment here

  const listLayoutClasses = isVertical
    ? "flex-col space-y-1 w-full"
    : "flex-row space-x-1";

  const linkBaseClasses =
    "flex items-center rounded-md transition-colors duration-150 text-sm";

  const linkPaddingClasses = isVertical ? "px-3 py-2 w-full" : "px-2.5 py-1.5"; // w-full for vertical links bg

  const logoContainerClasses = `shrink-0 ${
    isVertical
      ? "py-3 px-3 border-b border-gray-200/80 mb-2 text-center"
      : "px-2"
  }`;

  const logoTextClasses = `font-bold tracking-wider group-hover:text-blue-600 transition-colors duration-200 ${
    isVertical ? "text-xl text-gray-800" : "text-lg text-gray-700"
  }`;

  const linksContainerClasses = `flex ${
    isVertical ? "flex-grow py-2" : "justify-start"
  }`; // flex-grow for vertical footer push

  return (
    <nav className={`${navBaseClasses} ${navLayoutClasses}`}>
      <div className={logoContainerClasses}>
        <Link
          to="/"
          className="flex justify-center items-center space-x-2 group"
        >
          <span className={logoTextClasses}>
            <img className="max-w-dvw" src="/logo.svg" alt="logo" />
          </span>
        </Link>
      </div>

      <div className={linksContainerClasses}>
        <ul className={`${listBaseClasses} ${listLayoutClasses}`}>
          <li>
            <Link
              to="/"
              className={`${linkBaseClasses} ${linkPaddingClasses} ${isActive(
                "/"
              )}`}
            >
              <span className={isVertical ? "ml-1" : ""}>Home</span>
            </Link>
          </li>
          <li>
            <Link
              to="/templates/business"
              className={`${linkBaseClasses} ${linkPaddingClasses} ${isActive(
                "/templates/business"
              )}`}
            >
              <span className={isVertical ? "ml-1" : ""}>Business</span>
            </Link>
          </li>
          <li>
            <Link
              to="/templates/marketing"
              className={`${linkBaseClasses} ${linkPaddingClasses} ${isActive(
                "/templates/marketing"
              )}`}
            >
              <span className={isVertical ? "ml-1" : ""}>Marketing</span>
            </Link>
          </li>
          <li>
            <Link
              to="/templates/education"
              className={`${linkBaseClasses} ${linkPaddingClasses} ${isActive(
                "/templates/education"
              )}`}
            >
              <span className={isVertical ? "ml-1" : ""}>Education</span>
            </Link>
          </li>
        </ul>
      </div>

      {isVertical && (
        <div className="mt-auto p-3 border-t border-gray-200/80">
          <p className="text-xs text-gray-500 text-center">
            © 2025 Template AF
          </p>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
