import React from "react";

const ReportCard = ({ title, value, change, positive }) => {
  return (
    <div className="bg-white shadow-sm rounded-2xl p-5 flex flex-col items-start justify-center">
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <h2 className="text-2xl font-bold mt-2">{value}</h2>
      <p
        className={`text-sm mt-1 ${
          positive ? "text-green-500" : "text-red-500"
        }`}
      >
        {change}
      </p>
    </div>
  );
};

export default ReportCard;