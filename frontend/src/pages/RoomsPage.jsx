import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import {
  StarIcon,
  MapPinIcon,
  CurrencyRupeeIcon,
} from "@heroicons/react/24/solid";
import Footer from "../components/Footer";

export default function RoomPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState(location.state?.rooms || []);
  const [loading, setLoading] = useState(!rooms.length);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!rooms.length) {
      const fetchRooms = async () => {
        try {
          setLoading(true);
          const res = await axios.get("http://localhost:4000/api/rooms/public");
          setRooms(res.data);
        } catch (err) {
          console.error("Error fetching rooms:", err);
          setError("Failed to fetch rooms. Please try again later.");
        } finally {
          setLoading(false);
        }
      };
      fetchRooms();
    }
  }, [rooms.length]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-gray-500 dark:text-gray-400">
        Loading rooms...
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500 dark:text-red-400">{error}</p>;
  }

  return (
    <div
      className="
      min-h-screen pt-24 px-6 md:px-12
      bg-gradient-to-b from-cyan-50 via-white to-cyan-100
      dark:bg-gradient-to-b dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 
      dark:text-gray-100 text-gray-800
    "
    >
      {/* HEADER */}
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h1
          className="
          text-4xl md:text-5xl font-extrabold 
          bg-gradient-to-r from-cyan-500 to-indigo-600 
          dark:from-violet-400 dark:to-fuchsia-500
          bg-clip-text text-transparent
        "
        >
          Explore Our Rooms
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Choose your perfect stay — comfort, luxury, and convenience.
        </p>
      </div>

      {/* ROOMS GRID */}
      <div
        className="
        max-w-6xl mx-auto 
        grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8
      "
      >
        {rooms.length > 0 ? (
          rooms.map((room) => (
            <div
              key={room._id || room.id}
              className="
              bg-white/85 backdrop-blur-lg 
              dark:bg-gray-800/60 
              border border-gray-200 dark:border-gray-700 
              rounded-2xl shadow-lg hover:shadow-xl
              transition-all transform hover:-translate-y-2 
              overflow-hidden flex flex-col
            "
              
            >
              {/* IMAGE */}
              {room.images?.length ? (
                <img
                  src={room.images[0]}
                  alt={room.type}
                  className="w-full h-52 object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-52 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500">
                  No Image Available
                </div>
              )}

              {/* CARD BODY */}
              <div className="p-5 flex flex-col flex-1 ">
                <h2 className="text-lg font-bold text-cyan-700 dark:text-violet-300">
                  {room.type || "Unnamed Room"}
                </h2>

                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                  <MapPinIcon className="w-4 h-4 text-cyan-500 dark:text-gray-400" />
                  {room.location || "Unknown"}
                </p>

                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 flex-1">
                  {(room.description || "No description available.").slice(
                    0,
                    80
                  )}
                  ...
                </p>

                {/* AMENITIES */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {(room.amenities || []).slice(0, 3).map((a, i) => (
                    <span
                      key={i}
                      className="
                      text-xs px-2 py-1 rounded-full
                      bg-cyan-100 text-cyan-800
                      dark:bg-gray-700 dark:text-gray-200
                    "
                    >
                      {a}
                    </span>
                  ))}
                </div>

                {/* PRICE + RATING */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <StarIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {room.rating || "4.0"}
                    </span>
                  </div>

                  <div className="text-gray-800 dark:text-gray-200 font-semibold flex items-center gap-1">
                    <CurrencyRupeeIcon className="w-4 h-4" />
                    {room.price || 0}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      /night
                    </span>
                  </div>
                </div>

                {/* BUTTON */}
                <button
                  className={`
                  mt-5 w-full py-2 text-sm font-semibold rounded-lg
                  transition-all duration-200
                  ${
                    room.available
                      ? "bg-gradient-to-r from-cyan-500 to-indigo-600 dark:from-violet-500 dark:to-fuchsia-600 text-white hover:opacity-90 hover:scale-[1.02]"
                      : "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                  }
                `}
                  onClick={() =>
                    room.available &&
                    navigate(`/roomdetails/${room._id || room.id}`)
                  }
                >
                  {room.available ? "Book Now" : "Unavailable"}
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500 dark:text-gray-400">
            No rooms found.
          </p>
        )}
      </div>

      <Footer />
    </div>
  );
}
