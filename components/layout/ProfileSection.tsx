"use client";

import { useState } from "react";
import Image from "next/image";
import LogoutButton from "../UI/LogoutButton";
import { useSession } from "next-auth/react";

export default function ProfileSection() {
  const { data: session, status } = useSession();
  const [showLogout, setShowLogout] = useState(false);

  if (status === "loading" || !session?.user) return null;

  const name = session.user.name || "User";
  const email = session.user.email || "Email";
  const role = session.user.roles?.join(", ") || "";
  const profileImage = "/studentImage.jpg"; 

  return (
    <div className="relative flex items-center gap-4">
      <div className="flex flex-col items-end leading-tight text-right">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          {name}
        </p>

        <p className="text-xs text-gray-500">{email}</p>

        {role && (
          <p className="text-xs text-gray-400 italic">{role}</p>
        )}
      </div>

      <div
        className="relative cursor-pointer"
        onClick={() => setShowLogout((prev) => !prev)}
      >
        <Image
          src={profileImage}
          alt="User profile"
          width={55}
          height={55}
          className="rounded-full object-cover border-2 border-yellow-400 shadow-md"
        />

        {showLogout && (
          <div className="absolute right-0 mt-2 w-28">
            <LogoutButton />
          </div>
        )}
      </div>
    </div>
  );
}