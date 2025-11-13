import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";

// ✅ Pages
import Home from "./pages/Home";
import RoomsPage from "./pages/RoomsPage";
import RoomDetailsPage from "./pages/RoomDetailsPage";
import MyBookingsPage from "./pages/MyBookings";
import BookingConfirmation from "./pages/BookingConfirmation";
import AboutUs from "./pages/AboutUs";
import ContactPage from "./pages/ContactPage";
import AdminDashboard from "./pages/AdminDashboard";
import CustomerManagementPage from "./components/CustomerManagementPage";
import PaymentPage from "./pages/Paymentpage"; // ✅ Added this line

const App = () => {
  const [theme, setTheme] = useState(
    localStorage.theme ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light")
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.theme = theme;
  }, [theme]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 dark:text-white text-gray-900 transition-colors duration-300">
      <Navbar theme={theme} setTheme={setTheme} />

      <Routes>
        {/* 🌐 Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/roomdetails/:id" element={<RoomDetailsPage />} />
        <Route path="/payment" element={<PaymentPage />} /> {/* ✅ Added payment route */}
        <Route path="/my-bookings" element={<MyBookingsPage />} />
        <Route path="/booking-confirmation/:bookingId" element={<BookingConfirmation />} />
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* 🛠️ Admin Routes */}
        <Route path="/adminDashboard" element={<AdminDashboard />} />
        <Route path="/customer-management" element={<CustomerManagementPage />} />

        {/* 🚫 Fallback for unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;
