import React, { useState, useEffect } from "react";
import axios from "axios";
import { Moon, Sun, Loader2 } from "lucide-react";

const RoomOccupancyBar = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [occupancyData, setOccupancyData] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch occupancy data from backend
  useEffect(() => {
    const fetchOccupancy = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:4000/api/rooms", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Calculate occupancy per type
        const rooms = res.data || [];
        const grouped = rooms.reduce((acc, room) => {
          const type = room.type || "Unknown";
          if (!acc[type]) acc[type] = { total: 0, available: 0 };
          acc[type].total += 1;
          if (room.available) acc[type].available += 1;
          return acc;
        }, {});

        const formatted = Object.entries(grouped).map(([type, stats]) => {
          const occupiedRate =
            stats.total > 0
              ? Math.round(((stats.total - stats.available) / stats.total) * 100)
              : 0;
          return { type, rate: occupiedRate };
        });

        setOccupancyData(formatted);
      } catch (err) {
        console.error("Error fetching occupancy data:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOccupancy();
  }, []);

  return (
    <div
      className={`p-5 rounded-2xl shadow-xl transition-all duration-500 ${
        darkMode
          ? "bg-gray-900/90 border border-gray-700 text-gray-100"
          : "bg-white border border-gray-200 text-gray-800"
      }`}
    >
      {/* Header with toggle */}
      <div className="flex justify-between items-center mb-4">
        <h3
          className={`font-semibold text-lg ${
            darkMode ? "text-indigo-400" : "text-indigo-600"
          }`}
        >
          Occupancy by Room Type
        </h3>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-2 rounded-full border ${
            darkMode ? "border-gray-500" : "border-gray-300"
          } hover:scale-110 transition`}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* Loading Spinner */}
      {loading ? (
        <div className="flex justify-center items-center py-8 text-gray-400">
          <Loader2 className="animate-spin mr-2" size={18} />
          Loading occupancy data...
        </div>
      ) : occupancyData.length === 0 ? (
        <p className="text-center text-gray-500 py-4">
          No occupancy data available.
        </p>
      ) : (
        <div className="space-y-5">
          {occupancyData.map((room) => (
            <div key={room.type}>
              <div className="flex justify-between text-sm mb-1">
                <span
                  className={`font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {room.type}
                </span>
                <span
                  className={`font-semibold ${
                    darkMode ? "text-indigo-300" : "text-indigo-600"
                  }`}
                >
                  {room.rate}% occupied
                </span>
              </div>

              <div
                className={`w-full h-2 rounded-full transition-all duration-500 ${
                  darkMode ? "bg-gray-700" : "bg-gray-200"
                }`}
              >
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    darkMode ? "bg-indigo-500" : "bg-indigo-400"
                  }`}
                  style={{ width: `${room.rate}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomOccupancyBar;
