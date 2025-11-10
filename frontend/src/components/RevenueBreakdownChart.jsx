import React, { useState } from "react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Moon, Sun } from "lucide-react";

const initialData = [
  { name: "Rooms", value: 80000 },
  { name: "F&B", value: 25000 },
  { name: "Amenities", value: 15000 },
  { name: "Other", value: 5000 },
];

const RevenueBreakdownChart = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [data] = useState(initialData);

  const barColors = darkMode
    ? ["#6366F1", "#22D3EE", "#A78BFA", "#60A5FA"]
    : ["#4F46E5", "#06B6D4", "#7C3AED", "#3B82F6"];

  return (
    <div
      className={`p-5 rounded-2xl shadow-xl transition-all duration-500 ${
        darkMode
          ? "bg-gray-900/90 border border-gray-700 text-gray-100"
          : "bg-white border border-gray-200 text-gray-800"
      }`}
    >
      {/* Header with toggle */}
      <div className="flex justify-between items-center mb-3">
        <h3
          className={`font-semibold text-lg ${
            darkMode ? "text-indigo-400" : "text-indigo-600"
          }`}
        >
          Revenue Breakdown
        </h3>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full border border-gray-500 hover:scale-110 transition"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} barSize={35}>
          <XAxis
            dataKey="name"
            tick={{ fill: darkMode ? "#E5E7EB" : "#374151" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: darkMode ? "#1E293B" : "#E5E7EB", opacity: 0.4 }}
            contentStyle={{
              backgroundColor: darkMode ? "#1E293B" : "#F9FAFB",
              border: "none",
              borderRadius: "8px",
              color: darkMode ? "#E5E7EB" : "#111827",
            }}
          />
          <Bar radius={[10, 10, 0, 0]} dataKey="value">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueBreakdownChart;