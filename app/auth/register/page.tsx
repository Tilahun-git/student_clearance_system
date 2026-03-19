"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";

import { RoleType } from "@prisma/client";

interface UserForm {
  name: string;
  email: string;
  password: string;
  roles: RoleType[]; 
}

export default function AdminRegisterPage() {
  const router = useRouter();

  // Only Admin can assign roles other than STUDENT
  const AVAILABLE_ROLES = [
    RoleType.ADVISOR,
    RoleType.DEPARTMENT_HEAD,
    RoleType.FINANCE,
    RoleType.LIBRARY,
    RoleType.REGISTRAR,
    RoleType.ADMIN,
  ];

  const [user, setUser] = useState<UserForm>({
    name: "",
    email: "",
    password: "",
    roles: [],
  });

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const toggleRole = (role: RoleType) => {
    setUser((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  };

  const clearForm = () => {
    setUser({ name: "", email: "", password: "", roles: [] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (user.roles.length === 0) {
      toast.error("Please select at least one role");
      return;
    }

    try {
      const res = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Something went wrong");
        return;
      }

      toast.success("User registered successfully!");
      clearForm();

      setTimeout(() => router.push("/auth/login"), 2000);
    } catch (error) {
      toast.error("Server error. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 relative">
        <div className="flex justify-center mb-6">
          <Image
            src="/wldu_logo.jpg"
            alt="University Logo"
            width={80}
            height={80}
            className="rounded-full shadow-md"
          />
        </div>

        <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
          Register User
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Name"
            value={user.name}
            onChange={(e) =>
              setUser((prev) => ({ ...prev, name: e.target.value }))
            }
            required
            className="border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-gray-500 focus:outline-none"
          />

          <input
            type="email"
            placeholder="Email"
            value={user.email}
            onChange={(e) =>
              setUser((prev) => ({ ...prev, email: e.target.value }))
            }
            required
            className="border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-gray-500 focus:outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={user.password}
            onChange={(e) =>
              setUser((prev) => ({ ...prev, password: e.target.value }))
            }
            required
            className="border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-gray-500 focus:outline-none"
          />

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowRoleDropdown((prev) => !prev)}
              className="w-full border border-gray-300 p-3 rounded-xl text-left bg-white flex justify-between items-center"
            >
              <span>
                {user.roles.length > 0
                  ? user.roles.join(", ")
                  : "Choose roles"}
              </span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showRoleDropdown && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-xl shadow-md mt-1 max-h-32 overflow-y-auto p-2">
                {AVAILABLE_ROLES.map((role) => (
                  <label
                    key={role}
                    className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={user.roles.includes(role)}
                      onChange={() => toggleRole(role)}
                    />
                    {role}
                  </label>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="bg-gray-700 hover:bg-gray-800 text-black font-semibold py-3 rounded-xl transition-colors"
          >
            Register User
          </button>
        </form>
      </div>
    </div>
  );
}