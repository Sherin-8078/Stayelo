import React, { useState, useEffect } from "react";
import { FaHotel } from "react-icons/fa6";
import { TiThMenu } from "react-icons/ti";
import { Button } from "./ui/Button";
import ResponsiveMenu from "./ResponsiveMenu";
import Login from "./Login";
import Profile from "./Profile";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import { Moon, Sun, User  } from "lucide-react";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [openLogin, setOpenLogin] = useState(false);
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [theme, setTheme] = useState(
    localStorage.theme ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light")
  );

  const navigate = useNavigate();
  const location = useLocation();

  // Scroll detection for navbar background
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Load user from local storage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  // Handle login success
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));

    if (userData.role === "ADMIN") navigate("/adminDashboard");
    else navigate("/");

    setTimeout(() => setOpenLogin(false), 100);
  };

  // Update theme
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.theme = theme;
  }, [theme]);

  const textColor =
    scrolled || location.pathname !== "/"
      ? "text-gray-900 dark:text-white"
      : "text-white";

  const links = [
    { name: "Home", path: "/" },
    { name: "Rooms", path: "/rooms" },
    { name: "My Bookings", path: "/my-bookings", role: "CUSTOMER" },
    { name: "About Us", path: "/aboutus" },
    { name: "Contact", path: "/contact" },
  ];

  // Default/fallback profile picture
  
  return (
    <>
      {/* NAVBAR */}
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled || location.pathname !== "/"
            ? "bg-white/60 dark:bg-gray-900/70 backdrop-blur-md shadow-md"
            : "bg-transparent"
        }`}
      >
        <div className="flex justify-between items-center py-5 px-6 md:px-12">
          {/* LOGO */}
          <div
            onClick={() => navigate("/")}
            className={`flex items-center gap-4 font-bold text-2xl cursor-pointer ${textColor}`}
          >
            <FaHotel size={30} />
            <div className="flex flex-row text-4xl">
              <p className={textColor}>Stay</p>
              <p className="text-cyan-300 dark:text-fuchsia-400">elo</p>
            </div>
          </div>

          {/* DESKTOP LINKS */}
          <div className="hidden md:block">
            {user?.role === "ADMIN" ? (
              <ul className="flex items-center gap-6 font-semibold">
                <li>
                  <NavLink
                    to="/adminDashboard"
                    className={({ isActive }) =>
                      `py-1 px-3 transition ${
                        isActive
                          ? "text-cyan-500 dark:text-fuchsia-400"
                          : `${textColor} hover:text-cyan-400 dark:hover:text-fuchsia-400`
                      }`
                    }
                  >
                    Dashboard
                  </NavLink>
                </li>
              </ul>
            ) : (
              <ul className="flex items-center gap-6 font-semibold">
                {links.map((link) => {
                  if (link.role && user?.role !== link.role) return null;
                  return (
                    <li key={link.name}>
                      <NavLink
                        to={link.path}
                        className={({ isActive }) =>
                          `py-1 px-3 transition ${
                            isActive
                              ? "text-cyan-500 dark:text-fuchsia-400"
                              : `${textColor} hover:text-cyan-400 dark:hover:text-fuchsia-400`
                          }`
                        }
                      >
                        {link.name}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* RIGHT SIDE CONTROLS */}
          <div className="flex items-center gap-5">
            {/* THEME TOGGLE */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-cyan-500 hover:text-white transition-all duration-300 dark:hover:bg-fuchsia-500"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* PROFILE / LOGIN */}
            {user ? (
              <>
                {user.role === "CUSTOMER" && (
                  <>
                    <span
                      className={`font-semibold ${textColor} md:block hidden`}
                    >
                      Hello, {user.name}
                    </span>
                    <div
                 className="relative ml-3 cursor-pointer"
                  onClick={() => setProfileOpen(true)}
                  >
                   {user?.profilePic ? (
                  <img
                   alt="profile"
                   src={user.profilePic}
                   className="h-9 w-9 rounded-full border-2 border-cyan-500 dark:border-fuchsia-400 hover:scale-105 transition-transform"
                   />
                   ) : (
                   <div className="h-9 w-9 rounded-full border-2 border-cyan-500 dark:border-fuchsia-400 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                   <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                   </div>
                    )}
                  </div>

                  </>
                )}

                {user.role === "ADMIN" && (
                  <>
                    <span className="text-gray-900 dark:text-fuchsia-200 font-semibold md:block hidden">
                      Hello, Admin
                    </span>
                    <Button
                      onClick={handleLogout}
                      className="bg-red-500 text-white hover:bg-red-600"
                    >
                      Logout
                    </Button>
                  </>
                )}
              </>
            ) : (
              <Button
                variant="default"
                className="rounded-full cursor-pointer text-lg font-bold dark:bg-fuchsia-600 dark:hover:bg-fuchsia-700 md:block hidden"
                onClick={() => setOpenLogin(true)}
              >
                Log in
              </Button>
            )}

            {/* MOBILE MENU ICON — hidden for admin users */}
            {user?.role !== "ADMIN" && (
              <div className="md:hidden" onClick={() => setOpen(!open)}>
                <TiThMenu
                  className={`text-4xl cursor-pointer ${
                    scrolled || location.pathname !== "/"
                      ? "text-gray-900 dark:text-white"
                      : "text-white"
                  }`}
                />
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <ResponsiveMenu
        open={open}
        user={user}
        onLogout={handleLogout}
        onOpenLogin={() => setOpenLogin(true)}
        closeMenu={() => setOpen(false)}
        theme={theme}
      />

      {/* LOGIN POPUP */}
      <Login
        open={openLogin}
        onClose={() => setOpenLogin(false)}
        onLogin={handleLoginSuccess}
      />

      {/* PROFILE POPUP */}
      <Profile
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        onProfileUpdate={(updatedUser) => setUser(updatedUser)}
      />
    </>
  );
};

export default Navbar;
