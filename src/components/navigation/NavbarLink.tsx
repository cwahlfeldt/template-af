import React from "react";
import { Link, useLocation } from "react-router-dom";

interface NavbarLinkProps {
  to: string;
  isVertical: boolean;
  icon: React.ReactNode;
  text: string;
}

const NavbarLink: React.FC<NavbarLinkProps> = ({ to, isVertical, icon, text }) => {
  const location = useLocation();
  
  const isActive = location.pathname === to
    ? "bg-blue-100/60 text-blue-700 font-semibold"
    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900";

  const linkBaseClasses = "flex items-center rounded-md transition-colors duration-150 text-sm";
  const linkPaddingClasses = isVertical ? "px-3 py-2 w-full" : "px-2.5 py-1.5";

  return (
    <li>
      <Link
        to={to}
        className={`${linkBaseClasses} ${linkPaddingClasses} ${isActive}`}
      >
        <span>
          {isVertical ? icon : text}
        </span>
      </Link>
    </li>
  );
};

export default NavbarLink;