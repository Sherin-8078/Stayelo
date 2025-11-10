import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
const Hero = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const roomTypes = ["Single Room", "Double Room", "Deluxe Room", "Suite"];

  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [selected, setSelected] = useState("Select");
  const [isOpen, setIsOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectRoom = (room) => {
    setSelected(room);
    setIsOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();

    // Build query params
    const query = new URLSearchParams();
    if (destination) query.append("destination", destination);
    if (checkIn) query.append("checkIn", checkIn);
    if (checkOut) query.append("checkOut", checkOut);
    if (guests) query.append("guests", guests);
    if (selected !== "Select") query.append("roomType", selected);

    // Navigate to rooms page with query
    navigate(`/rooms?${query.toString()}`);
  };

  return (
    <div className="flex flex-col items-start justify-center px-6 md:px-16 lg:px-24 xl:px-32 text-white bg-[url('/herobg.jpg')] bg-cover bg-no-repeat h-screen relative">
      {/* Headline */}
      <h2 className="text-white text-4xl font-extrabold md:text-5xl lg:text-6xl">
        Find Your{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-600
                          dark:from-violet-400 dark:to-fuchsia-500">
          Perfect Stay
        </span>
      </h2>

      <p className="mt-2 mb-6 text-base md:text-lg max-w-xl">
        Book your next adventure with us. We offer the best deals on hotels and accommodations.
      </p>

      {/* Search Form */}
      <form
        onSubmit={handleSearch}
        className="bg-white text-gray-700 rounded-lg px-6 py-4 flex flex-col md:flex-row max-md:items-start gap-4 max-md:mx-auto w-max shadow-lg"
      >
        {/* Destination */}
        <div className="flex flex-col">
          <label htmlFor="destinationInput" className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-gray-800"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 2C8.1 2 5 5.1 5 9c0 4.5 7 13 7 13s7-8.5 7-13c0-3.9-3.1-7-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"
              />
            </svg>
            Destination
          </label>
          <input
            id="destinationInput"
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none focus:border-indigo-400"
            placeholder="Type here"
            required
          />
        </div>

        {/* Check In */}
        <div className="flex flex-col">
          <label htmlFor="checkIn" className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-gray-800"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8h18M8 3v2m8-2v2M4 8h16v13H4V8Z"
              />
            </svg>
            Check In
          </label>
          <input
            id="checkIn"
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none focus:border-indigo-400"
            required
          />
        </div>

        {/* Check Out */}
        <div className="flex flex-col">
          <label htmlFor="checkOut" className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-gray-800"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8h18M8 3v2m8-2v2M4 8h16v13H4V8Z"
              />
            </svg>
            Check Out
          </label>
          <input
            id="checkOut"
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none focus:border-indigo-400"
            required
          />
        </div>

        {/* Guests */}
        <div className="flex flex-col">
          <label htmlFor="guests">Guests</label>
          <input
            id="guests"
            type="number"
            min={1}
            max={10}
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none focus:border-indigo-400"
          />
        </div>

        {/* Room Type Dropdown */}
        <div className="flex flex-col relative" ref={dropdownRef}>
          <label>Room Type</label>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-44 text-left px-4 pr-2 py-2 border rounded bg-white text-gray-800 border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none mt-1"
          >
            <span>{selected}</span>
            <svg
              className={`w-5 h-5 inline float-right transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#6B7280"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isOpen && (
            <ul className="absolute z-10 w-44 bg-white border border-gray-300 rounded shadow-md mt-1 py-2 max-h-40 overflow-y-auto">
              {roomTypes.map((room) => (
                <li
                  key={room}
                  className="px-4 py-2 hover:bg-indigo-500 hover:text-white cursor-pointer text-sm"
                  onClick={() => handleSelectRoom(room)}
                >
                  {room}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="mt-3 md:mt-0 w-fit px-6 py-2 text-white font-semibold rounded-lg
                     bg-gradient-to-r from-cyan-500 to-indigo-600
                     dark:from-violet-500 dark:to-fuchsia-600
                     shadow-md hover:opacity-90 hover:scale-[1.02] transition-all float-right flex items-center gap-2"
        >
          <FaSearch />Search
        </button>
      </form>
    </div>
  );
};

export default Hero;
