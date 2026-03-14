"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { roleRedirect } from "@/lib/roles";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError(res.error || "Email or password is incorrect");
      return;
    }

    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();

    const userRoles: string[] = session?.user?.roles || [];

    if (userRoles.length === 0) {
      setError("No roles assigned. Contact admin.");
      return;
    }

    if (userRoles.length === 1) {
      router.push(roleRedirect[userRoles[0]] || "/login");
    } else {
      setAvailableRoles(userRoles);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-300 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 relative">
        
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/wldu_logo.jpg"
            alt="University Logo"
            width={80}
            height={80}
            className="rounded-full shadow-md"
          />
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
          Login
        </h2>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-center mb-4">{error}</p>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          
          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-gray-500 focus:outline-none"
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-gray-500 focus:outline-none"
            />

            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 cursor-pointer text-gray-500"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="bg-blue-900 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Login
          </button>
        </form>

        {/* Role Selection */}
        {availableRoles.length > 1 && (
          <div className="mt-6">
            <p className="text-gray-700 mb-2 text-center font-medium">
              Select role to continue:
            </p>

            <div className="flex flex-col gap-2 items-center">
              {availableRoles.map((role) => (
                <button
                  key={role}
                  onClick={() =>
                    router.push(roleRedirect[role] || "/login")
                  }
                  className="w-full max-w-xs bg-blue-700 text-white py-2 rounded hover:bg-blue-500 transition"
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Register Link */}
        <div className="mt-6 text-center text-gray-700">
          <p>
            Don't have an account?{" "}
            <Link
              href="/auth/register"
              className="text-blue-900 font-semibold hover:underline"
            >
              Register here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}