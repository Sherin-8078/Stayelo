import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NavLink } from "react-router-dom";

const ResponsiveMenu = ({
  open,
  user,
  onLogout,
  closeMenu,
  onOpenLogin,
  theme,
}) => {
  const links = [
    { name: "Home", path: "/" },
    { name: "Rooms", path: "/rooms" },
    { name: "My Bookings", path: "/my-bookings", role: "CUSTOMER" },
    { name: "About Us", path: "/aboutus" },
    { name: "Contact", path: "/contact" },
  ];

  // Close menu when clicking outside
  const handleOutsideClick = (e) => {
    if (e.target.id === "modal-overlay") closeMenu?.();
  };

  return (
    <AnimatePresence mode="wait">
      {open && (
        <motion.div
          id="modal-overlay"
          onClick={handleOutsideClick}
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 0.3 }}
          className="fixed top-20 left-0 w-full h-screen z-20 md:hidden"
        >
          <div
            className={`flex flex-col justify-center items-center gap-10 p-6 mx-4 rounded-3xl 
            ${
              theme === "dark"
                ? "bg-gray-900 text-gray-100 shadow-xl"
                : "bg-white text-gray-900 shadow-lg"
            }`}
          >
            {/* Navigation Links */}
            <ul className="flex flex-col justify-center items-center gap-8 text-xl font-semibold">
              {/* Show only non-admin links */}
              {user?.role !== "ADMIN" &&
                links.map((link) => {
                  if (link.role && user?.role !== link.role) return null;
                  return (
                    <li key={link.name}>
                      <NavLink
                        to={link.path}
                        onClick={closeMenu}
                        className={({ isActive }) =>
                          `transition-all ${
                            isActive
                              ? "text-cyan-500 dark:text-fuchsia-400"
                              : "hover:text-cyan-400 dark:hover:text-fuchsia-400"
                          }`
                        }
                      >
                        {link.name}
                      </NavLink>
                    </li>
                  );
                })}

              {/* Admin Dashboard Link */}
              {user?.role === "ADMIN" && (
                <li>
                  <NavLink
                    to="/adminDashboard"
                    onClick={closeMenu}
                    className="transition-all text-cyan-500 dark:text-fuchsia-400 hover:text-cyan-400 dark:hover:text-fuchsia-300"
                  >
                    Dashboard
                  </NavLink>
                </li>
              )}
            </ul>

            {/* Login / Logout Buttons */}
            <div className="flex flex-col gap-3 mt-6">
              {!user ? (
                <button
                  className="py-2 px-6 bg-cyan-500 dark:bg-fuchsia-500 text-white rounded-full font-semibold hover:opacity-90 transition"
                  onClick={() => {
                    onOpenLogin?.(); // open login popup in Navbar
                    closeMenu?.(); // close mobile menu
                  }}
                >
                  Log in
                </button>
              ) : (
                <button
                  onClick={() => {
                    onLogout?.();
                    closeMenu?.();
                  }}
                  className="py-2 px-6 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600 transition"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ResponsiveMenu;
