"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { FaChevronDown } from "react-icons/fa";
import Link from "next/link";

interface Role {
  id: string;
  name: string;
}

interface UserForm {
  name: string;
  email: string;
  password: string;
  roles: string[];
}

export default function AdminRegisterPage() {
  const router = useRouter();

  const [rolesFromDB, setRolesFromDB] = useState<Role[]>([]);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const [user, setUser] = useState<UserForm>({
    name: "",
    email: "",
    password: "",
    roles: [],
  });

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        // ✅ FIX 1: correct endpoint
        const res = await fetch("/api/admin/roles");

        // ✅ FIX 2: handle bad response
        if (!res.ok) {
          toast.error("Failed to load roles");
          return;
        }

        const data = await res.json();

        // ✅ FIX 3: ensure it's an array
        if (Array.isArray(data)) {
          setRolesFromDB(data);
        } else {
          setRolesFromDB([]);
          toast.error("Invalid roles data");
        }

      } catch {
        toast.error("Failed to load roles");
      }
    };

    fetchRoles();
  }, []);

  const toggleRole = (roleName: string) => {
    setUser((prev) => ({
      ...prev,
      roles: prev.roles.includes(roleName)
        ? prev.roles.filter((r) => r !== roleName)
        : [...prev.roles, roleName],
    }));
  };

  const clearForm = () => {
    setUser({ name: "", email: "", password: "", roles: [] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalRoles =
      user.roles.length === 0 ? ["STUDENT"] : user.roles;

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
            className="border p-3 rounded-xl"
          />

          <input
            type="email"
            placeholder="Email"
            value={user.email}
            onChange={(e) =>
              setUser((prev) => ({ ...prev, email: e.target.value }))
            }
            required
            className="border p-3 rounded-xl"
          />

          <input
            type="password"
            placeholder="Password"
            value={user.password}
            onChange={(e) =>
              setUser((prev) => ({ ...prev, password: e.target.value }))
            }
            required
            className="border p-3 rounded-xl"
          />

          {/* ROLE DROPDOWN */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowRoleDropdown((prev) => !prev)}
              className="w-full border p-3 rounded-xl flex justify-between"
            >
              <span>
                {user.roles.length > 0
                  ? user.roles.join(", ")
                  : "Select roles"}
              </span>
              <FaChevronDown />
            </button>

            {showRoleDropdown && (
              <div className="absolute w-full bg-white border mt-1 rounded shadow max-h-40 overflow-y-auto">

                {/* ✅ FIX 4: safe render */}
                {rolesFromDB.length === 0 ? (
                  <div className="px-3 py-2 text-gray-500 text-sm">
                    No roles found
                  </div>
                ) : (
                  rolesFromDB.map((role) => (
                    <label
                      key={role.id}
                      className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100"
                    >
                      <input
                        type="checkbox"
                        checked={user.roles.includes(role.name)}
                        onChange={() => toggleRole(role.name)}
                      />
                      {role.name}
                    </label>
                  ))
                )}

              </div>
            )}
          </div>

          <button
            type="submit"
            className="bg-blue-900 text-white py-3 rounded-xl"
          >
            Register
          </button>

          <div className="text-center">
 <p>
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-blue-900 font-semibold hover:underline"
            >
              Register here
            </Link>
          </p>          
          </div>

        </form>
      </div>
    </div>
  );
}