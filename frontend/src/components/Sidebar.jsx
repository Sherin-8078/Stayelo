import React from "react";
import {
  FaChartBar,
  FaHome,
  FaBed,
  FaUsers,
  FaDoorOpen,
} from "react-icons/fa";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  onSectionSelect,
  activeSection,
}) {
  const menuItems = [
    { key: "dashboard", name: "Dashboard", icon: <FaHome /> },
    { key: "booking", name: "Bookings", icon: <FaBed /> },
    { key: "rooms", name: "Rooms", icon: <FaBed /> },
    { key: "customers", name: "Customers", icon: <FaUsers /> },
    { key: "reports", name: "Reports", icon: <FaChartBar /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 transition-all duration-300
        bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 pt-32 shadow-md flex flex-col
        ${sidebarOpen ? "w-64" : "w-16"}
        ${!sidebarOpen ? "md:w-16" : ""} 
        ${sidebarOpen ? "translate-x-0" : "-translate-x-64 md:translate-x-0"} 
        transform md:translate-x-0`}
      >
        {/* Header */}
        <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
          {sidebarOpen && (
            <h1 className="text-2xl font-extrabold text-cyan-400  tracking-wide dark:text-fuchsia-400">
              Stayleo Admin
            </h1>
          )}
          <button
            className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 md:block hidden "
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-2 mt-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => onSectionSelect(item.key)}
              className={`flex items-center w-full gap-3 p-2 rounded font-medium transition-all duration-200
              ${
                activeSection === item.key
                  ? "bg-cyan-100 dark:bg-fuchsia-800 text-cyan-700 dark:text-fuchsia-200"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-cyan-600 dark:hover:text-fuchsia-400"
              }
              ${!sidebarOpen && "justify-center"}`}
            >
              <span className="text-lg">{item.icon}</span>
              {sidebarOpen && <span>{item.name}</span>}
            </button>
          ))}
        </div>

        {/* Footer */}
        {sidebarOpen && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-col items-center gap-2">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Admin</p>
            <button
              className="w-full bg-red-500 hover:bg-red-600 text-white py-1.5 rounded-lg transition text-sm flex justify-center items-center gap-2"
              onClick={handleLogout}
            >
              <FaDoorOpen size={14} /> Logout
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
