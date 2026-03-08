import React from "react";

const Header = () => {
  return (
    <div className="w-full px-6 py-6 bg-gray-100">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border-l-4 border-yellow-500">
          <p className="text-gray-500 italic text-sm uppercase tracking-wide">
            Current Status
          </p>
          <h2 className="text-3xl font-bold text-yellow-600 mt-2">
            Pending
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border-l-4 border-green-500">
          <p className="text-gray-500 text-sm italic uppercase tracking-wide">
            Departments Approved
          </p>
          <h2 className="text-3xl font-bold text-green-600 mt-2">
            6/11
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border-l-4 border-red-500">
          <p className="text-gray-500 text-sm italic uppercase tracking-wide">
            Rejections
          </p>
          <h2 className="text-3xl font-bold text-red-600 mt-2">
            4
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm italic uppercase tracking-wide">
            Clearance Type
          </p>
          <h2 className="text-3xl font-bold text-blue-600 mt-2">
            Graduation
          </h2>
        </div>

      </div>
    </div>
  );
};

export default Header;