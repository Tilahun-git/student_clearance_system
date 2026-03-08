"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [showToast, setShowToast] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  // Define roles available in the app
  const availableRoles = [
    "STUDENT",
    "ADMIN",
    "DEPARTMENT_HEAD",
    "REGISTRAR",
    "LIBRARY",
    "FINANCE",
    "DORMITORY",
    "CAFETERIA",
    "ICT",
    "SECURITY",
  ];

  const handleRoleChange = (role: string) => {
    if (roles.includes(role)) setRoles(roles.filter((r) => r !== role));
    else setRoles([...roles, role]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowToast(false);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, roles }),
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
      setRoles([]);

      setTimeout(() => router.push("/auth/login"), 2000);
    } catch (err) {
      setToastType("error");
      setToastMessage("Server error. Please try again.");
      setShowToast(true);
    }
  };

  useEffect(() => {
    if (!showToast) return;
    const timer = setTimeout(() => setShowToast(false), 3000);
    return () => clearTimeout(timer);
  }, [showToast]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-300 px-4">
      {showToast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white font-semibold text-sm ${toastType === "success" ? "bg-green-600" : "bg-red-600"}`}>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 relative">
        <div className="flex justify-center mb-6">
          <Image src="/wldu_logo.jpg" alt="University Logo" width={80} height={80} className="rounded-full shadow-md" />
        </div>

        <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">Register</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-gray-500 focus:outline-none" />

          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-gray-500 focus:outline-none" />

          <div className="relative">
  <span className="font-semibold text-gray-700">Select Roles (optional):</span>

  <button
    type="button"
    onClick={() => setShowRoleDropdown(!showRoleDropdown)}
    className="w-full border border-gray-300 p-3 rounded-xl text-left bg-white"
  >
    {roles.length > 0 ? roles.join(", ") : "Choose roles"}
  </button>

          {showRoleDropdown && (
            <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-xl shadow-md mt-1 max-h-60 overflow-y-auto p-2">
              {availableRoles.map((role) => (
                <label key={role} className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={roles.includes(role)}
                    onChange={() => handleRoleChange(role)}
                  />
                  {role}
                </label>
              ))}
            </div>
          )}
        </div>

          <button type="submit" className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-colors">
            Register
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Already have an account?{" "}
          <span onClick={() => router.push("/auth/login")} className="text-blue-800 font-semibold hover:underline cursor-pointer">
            Login here
          </span>
        </p>
      </div>
    </div>
  );
}