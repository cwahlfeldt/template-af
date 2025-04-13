import React from "react";
import { useLocation } from "react-router-dom";
import HorizontalNavbar from "./HorizontalNavbar";
import VerticalNavbar from "./VerticalNavbar";

/**
 * Main Navbar component that conditionally renders either the 
 * horizontal or vertical navbar based on the current route
 */
const Navbar: React.FC = () => {
  const location = useLocation();
  const isEditorRoute = location.pathname.startsWith("/editor");

  // Render the appropriate navbar based on the route
  return isEditorRoute ? <VerticalNavbar /> : <HorizontalNavbar />;
};

export default Navbar;