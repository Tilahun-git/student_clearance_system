import Link from "next/link";
import React from "react";

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-yellow-200 via-white to-yellow-200 px-6 text-center">
      
      <h1 className="text-9xl font-extrabold text-yellow-500 mb-6 drop-shadow-lg">
        404
      </h1>
      
      <h2 className="text-3xl font-semibold mb-4 text-gray-800">
        Page Not Found
      </h2>
      
      <p className="text-gray-600 mb-8 max-w-md">
        Oops! The page you are looking for does not exist. It might have been removed or the URL is incorrect.
      </p>
      
      <Link
        href="/student"
        className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-3 rounded-full shadow-md transition-all duration-300"
      >
        Go Back Home
      </Link>
      
    </div>
  );
};

export default NotFoundPage;