import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  CartesianGrid,
  ReferenceDot,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const BookingTrendsChart = () => {
  const [range, setRange] = useState("1M");
  const [data, setData] = useState([]);
  const [darkMode, setDarkMode] = useState(false); // ✅ state to track dark mode

  // 📊 Fetch data from backend
  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/bookings/trends");
        setData(res.data);
      } catch (error) {
        console.error("Error fetching booking trends:", error);
      }
    };
    fetchTrends();
  }, []);

  // ✅ Detect dark mode changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDarkMode(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // initial check
    setDarkMode(document.documentElement.classList.contains("dark"));

    return () => observer.disconnect();
  }, []);

  const latestValue = data.length ? data[data.length - 1].bookings : null;

  const chartVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.3 } },
  };

  // ✅ choose color based on darkMode
  const strokeColor = darkMode ? "#e216c7" : "#06b6d4";

  return (
    <motion.div
      className="bg-white dark:bg-gray-900 shadow-sm rounded-2xl p-5"
      variants={chartVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100">
          Booking Trends
        </h3>
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {["1W", "1M", "3M", "6M", "1Y", "ALL"].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 text-sm rounded-md transition-all ${
                range === r
                  ? "bg-blue-500 text-white shadow"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={range}
          variants={chartVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data}>
              <defs>
                <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: darkMode ? "#d1d5db" : "#6b7280" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: darkMode ? "#d1d5db" : "#6b7280" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? "#1f2937" : "#fff",
                  borderRadius: "10px",
                  border: "none",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  color: darkMode ? "#fff" : "#000",
                }}
                labelStyle={{
                  fontWeight: "600",
                  color: darkMode ? "#fff" : "#374151",
                }}
              />

              <Area
                type="monotone"
                dataKey="bookings"
                stroke="none"
                fill="url(#colorBookings)"
              />

              <Line
                type="monotone"
                dataKey="bookings"
                stroke={strokeColor} // ✅ dynamic color
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={true}
                animationDuration={600}
              />

              {latestValue && (
                <ReferenceDot
                  x={data[data.length - 1].label}
                  y={latestValue}
                  r={4}
                  fill={strokeColor} // dot color also follows theme
                  stroke={darkMode ? "#111" : "#fff"}
                  strokeWidth={2}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </AnimatePresence>

      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
        Data for the selected period:{" "}
        <span className="font-medium">{range}</span>
      </p>
    </motion.div>
  );
};

export default BookingTrendsChart;
