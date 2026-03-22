"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { RoleType } from "@prisma/client";
import { FaChevronDown } from "react-icons/fa";
import Link from 'next/link'

interface UserForm {
  name: string;
  email: string;
  password: string;
  roles: RoleType[];
}

export default function AdminRegisterPage() {
  const router = useRouter();

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

    const finalRoles =
      user.roles.length === 0
        ? [RoleType.STUDENT]
        : user.roles;

    try {
      const res = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...user,
          roles: finalRoles,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Something went wrong");
        return;
      }

      toast.success("User registered successfully!");
      clearForm();

      setTimeout(() => {
        router.push("/auth/login");
      }, 1500);
    } catch {
      toast.error("Server error. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-300 px-4">
      <div className="w-full max-w-md text-black bg-white rounded-2xl shadow-lg p-8">
        <div className="flex justify-center mb-6">
          <Image
            src="/wldu_logo.jpg"
            alt="University Logo"
            width={80}
            height={80}
            className="rounded-full shadow-md"
          />
        </div>

        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
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
            className="border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-900 focus:outline-none"
          />
          <input
            type="email"
            placeholder="Email Address"
            value={user.email}
            onChange={(e) =>
              setUser((prev) => ({ ...prev, email: e.target.value }))
            }
            required
            className="border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-900 focus:outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={user.password}
            onChange={(e) =>
              setUser((prev) => ({ ...prev, password: e.target.value }))
            }
            required
            className="border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-900 focus:outline-none"
          />

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowRoleDropdown((prev) => !prev)}
              className="w-full border border-gray-300 p-3 rounded-xl flex justify-between items-center bg-white hover:bg-gray-50 transition"
            >
              <span className="text-gray-700 text-sm">
                {user.roles.length > 0
                  ? user.roles.join(", ")
                  : "Select roles "}
              </span>

              <FaChevronDown className="text-gray-500 text-xs" />
            </button>

          {showRoleDropdown && (
            <div className="absolute top-full z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-md max-h-16 overflow-y-auto">

              {AVAILABLE_ROLES.map((role) => (
                <label
                  key={role}
                  className="flex items-center gap-2 px-2 py-1 text-xs cursor-pointer hover:bg-gray-100"
                >
                  <input
                    type="checkbox"
                    checked={user.roles.includes(role)}
                    onChange={() => toggleRole(role)}
                    className="accent-blue-900 w-3 h-3"
                  />

                  <span className="text-gray-700">
                    {role}
                  </span>
                </label>
              ))}

            </div>
          )}
          </div>

          <button
            type="submit"
            className="bg-blue-900 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Register User
          </button>
        <div className="mt-6 text-center text-gray-700">
          <p>
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-blue-900 font-semibold hover:underline"
            >
              Login here
            </Link>
          </p>
        </div>
        </form>
      </div>
    </div>
  );
}