"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowToast(false);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setToastType("error");
        setToastMessage(data.error || "Something went wrong");
        setShowToast(true);
        return;
      }

      setToastType("success");
      setToastMessage("Registered successfully! Redirecting to login...");
      setShowToast(true);

      setEmail("");
      setPassword("");
      setRole("STUDENT");

      // Redirect after toast disappears
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (err) {
      setToastType("error");
      setToastMessage("Server error. Please try again.");
      setShowToast(true);
    }
  };

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (!showToast) return;
    const timer = setTimeout(() => setShowToast(false), 3000);
    return () => clearTimeout(timer);
  }, [showToast]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-300 px-4">
      {/* Toast Notification */}
      <div
        className={`
          fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg
          text-white font-semibold text-sm
          transition-all duration-300 transform
          ${showToast ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}
          ${toastType === "success" ? "bg-green-600" : "bg-red-600"}
        `}
      >
        {toastType === "success" ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        <span>{toastMessage}</span>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 relative">
        {/* University Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/wldu_logo.jpg"
            alt="University Logo"
            width={80}
            height={80}
            className="rounded-full shadow-md"
          />
        </div>

        <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">Register</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-gray-500 focus:outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-gray-500 focus:outline-none"
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-gray-500 focus:outline-none"
          >
            <option value="STUDENT">Student</option>
            <option value="ADMIN">Admin</option>
          </select>

          <button
            type="submit"
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Register
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Already have an account?{" "}
          <span
            onClick={() => router.push("/auth/login")}
            className="text-blue-800 font-semibold hover:underline cursor-pointer"
          >
            Login here
          </span>
        </p>
      </div>
    </div>
  );
}