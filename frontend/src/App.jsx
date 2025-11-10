import React , { useState, useEffect }from 'react'
import Navbar from './components/Navbar'
import { Routes, Route, Navigate } from "react-router-dom";
import AdminDashboard from './pages/AdminDashboard';
import ContactPage from './pages/ContactPage';
import Home from './pages/Home';
import RoomDetailsPage from './pages/RoomDetailsPage';
import RoomsPage from './pages/RoomsPage';
import CostomerManagementPage from './components/CustomerManagementPage';
import MyBookingsPage from './pages/MyBookings';
import AboutUs from './pages/AboutUs';
import BookingConfirmation from './pages/BookingConfirmation';
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
    <div className="min-h-screen bg-white dark:bg-gray-900  dark:text-white text-gray-900 transition-colors duration-300">
      <Navbar theme={theme} setTheme={setTheme} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/adminDashboard"element={<AdminDashboard />} />
        <Route path='/contact' element={<ContactPage />} />
        <Route path="/roomdetails/:id" element={<RoomDetailsPage />} />
        <Route path='/admin' element={<AdminDashboard />} />
        <Route path='/rooms' element={<RoomsPage />} />
        <Route path='/customer-management' element={<CostomerManagementPage />} />
        <Route path='/my-bookings' element={<MyBookingsPage />} />
        <Route path='/aboutus' element={<AboutUs />} />
        <Route path="/booking-confirmation/:bookingId" element={<BookingConfirmation />} />
      </Routes>
    </div>
  )                                       
}

export default App
