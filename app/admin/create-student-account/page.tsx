
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function CreateStudentAccount() {
  const params = useSearchParams();
  const router = useRouter();

  const studentId = params.get("studentId"); 

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentId) {
      return toast.error("Student ID missing");
    }

    try {
      const res = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          studentId, 
          roles: ["STUDENT"],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return toast.error(data.error);
      }

      toast.success("Account created successfully");

      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 1500);
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-200 px-4">

      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 space-y-6 border">

        <h2 className="text-2xl font-bold text-gray-800 text-center">
          Create Student Account
        </h2>

        <form onSubmit={handleCreateAccount} className="space-y-4">

          <div>
            <label className="text-sm text-gray-600">Student ID</label>
            <input
              value={studentId || ""}
              readOnly
              className="w-full mt-1 px-3 py-2 border rounded-lg bg-gray-100 text-gray-700"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600"> Name</label>
            <input
              type="text"
              required
              placeholder="Enter full name"
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              required
              placeholder="Enter email"
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">
              Temporary Password
            </label>
            <input
              type="password"
              required
              placeholder="Enter temporary password"
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition"
          >
            Create Account
          </button>

        </form>
      </div>
    </div>
  );
}