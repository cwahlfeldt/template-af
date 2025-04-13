import { Link, useLocation } from "react-router-dom";
import React from "react";

function Navbar() {
  const location = useLocation();
  const isVertical = location.pathname.startsWith("/editor");
  // const isVertical = false;

  const isActive = (path: string): string => {
    return location.pathname === path
      ? "bg-blue-100/60 text-blue-700 font-semibold"
      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900";
  };

  const navBaseClasses =
    "m-4 bg-white/90 backdrop-blur-md rounded-lg shadow-lg border border-latte-pink transition-all duration-300 ease-in-out flex";

  const navLayoutClasses = isVertical
    ? "flex-col h-max p-2"
    : "flex-row items-center w-auto mx-auto max-w-fit p-2  inset-x-0 max-w-max mx-auto"; // max-w-fit makes it hug content horizontally

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
      : "pl-3 pr-5"
  }`;

  const logoTextClasses = `font-bold tracking-wider group-hover:text-blue-600 transition-colors duration-200 ${
    isVertical ? "text-xl text-latte-text" : "text-lg text-latte-text"
  }`;

  const linksContainerClasses = `flex ${
    isVertical ? "flex-grow py-2" : "justify-start"
  }`;

  const navWrapperClasses = `nav-wrapper fixed z-50 flex ${
    isVertical ? "items-center h-full" : "w-full top-0 justify-center"
  }`;

  return (
    <div className={navWrapperClasses}>
      <nav className={`${navBaseClasses} ${navLayoutClasses}`}>
        <div className={logoContainerClasses}>
          <Link
            to="/"
            className="flex justify-center items-center space-x-2 group"
          >
            <span className={logoTextClasses}>
              <img
                className="max-w-dvw"
                src={isVertical ? "/logo-small.svg" : "/logo.svg"}
                alt="logo"
              />
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
                <span>
                  {isVertical ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                      />
                    </svg>
                  ) : (
                    "Home"
                  )}
                </span>
              </Link>
            </li>
            <li>
              <Link
                to="/templates/business"
                className={`${linkBaseClasses} ${linkPaddingClasses} ${isActive(
                  "/templates/business"
                )}`}
              >
                <span>
                  {isVertical ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z"
                      />
                    </svg>
                  ) : (
                    "Business"
                  )}
                </span>
              </Link>
            </li>
            <li>
              <Link
                to="/templates/marketing"
                className={`${linkBaseClasses} ${linkPaddingClasses} ${isActive(
                  "/templates/marketing"
                )}`}
              >
                <span>
                  {isVertical ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
                      />
                    </svg>
                  ) : (
                    "Marketing"
                  )}
                </span>
              </Link>
            </li>
            <li>
              <Link
                to="/templates/education"
                className={`${linkBaseClasses} ${linkPaddingClasses} ${isActive(
                  "/templates/education"
                )}`}
              >
                <span>
                  {isVertical ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                      />
                    </svg>
                  ) : (
                    "Education"
                  )}
                </span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
