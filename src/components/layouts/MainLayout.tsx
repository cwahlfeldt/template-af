// src/layouts/MainLayout.tsx
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import FlowBoard from "../flowBoard/FlowBoard";

const MainLayout: React.FC = () => {
  const location = useLocation();
  const isVerticalNavRoute = location.pathname.startsWith("/editor");

  if (isVerticalNavRoute) {
    return (
      <main className="flex-grow">
        <Outlet />{" "}
      </main>
    );
  }

  return (
    <main className="flex-grow mx-auto container px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
      <Outlet />{" "}
    </main>
  );
};

export default MainLayout;
