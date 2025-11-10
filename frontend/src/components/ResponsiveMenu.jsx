import { AnimatePresence, motion } from "framer-motion";
import { NavLink, useNavigate } from "react-router-dom";

const ResponsiveMenu = ({
  open,
  user,
  onLogout,
  onLogin,
  closeMenu,
  theme,
  setTheme,
}) => {
  const navigate = useNavigate();

  const links = [
    { name: "Home", path: "/" },
    { name: "Rooms", path: "/rooms" },
    { name: "My Bookings", path: "/my-bookings", role: "CUSTOMER" },
    { name: "About Us", path: "/aboutus" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <AnimatePresence mode="wait">
      {open && (
        <motion.div
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
            <ul className="flex flex-col justify-center items-center gap-8 text-xl font-semibold">
              {links.map((link) => {
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
            </ul>

            
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ResponsiveMenu;
