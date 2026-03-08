"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/auth/login" })}
      className="
        flex items-center justify-center
        gap-2
        bg-red-600 hover:bg-red-700
        text-white font-semibold
        px-5 py-3
        rounded-xl
        shadow-md
        transition-all
        duration-200
        hover:scale-105
        focus:outline-none focus:ring-2 focus:ring-red-400
      "
    >
      {/* Optional icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10V5"
        />
      </svg>
      Logout
    </button>
  );
}