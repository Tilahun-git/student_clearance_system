"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { KeyRound } from "lucide-react";
import toast from "react-hot-toast";

export default function ChangePasswordPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent]         = useState(false);
  const [showNew, setShowNew]                 = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [loading, setLoading]                 = useState(false);

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-300">
        <div className="w-8 h-8 border-2 border-blue-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to change password");
        return;
      }

      toast.success("Password changed successfully!");

      // Go back to the dashboard for the current active role
      const activeRole = session?.user?.activeRole;
      if (activeRole) {
        window.location.href = `/api/authenticate/select-role?role=${encodeURIComponent(activeRole)}`;
      } else {
        router.replace("/auth/login");
      }
    } catch {
      toast.error("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-300 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
            <KeyRound className="w-7 h-7 text-blue-900" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-5">Change Password</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="Enter current password"
                className="w-full border border-gray-300 p-3 rounded-xl pr-10 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800"
              />
              <button type="button" onClick={() => setShowCurrent((p) => !p)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                {showCurrent ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="At least 8 characters"
                className="w-full border border-gray-300 p-3 rounded-xl pr-10 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800"
              />
              <button type="button" onClick={() => setShowNew((p) => !p)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                {showNew ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {newPassword.length > 0 && (
              <div className="mt-1.5 flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <div key={level} className={`h-1 flex-1 rounded-full transition-colors ${
                    newPassword.length >= level * 3
                      ? level <= 1 ? "bg-red-400" : level <= 2 ? "bg-amber-400" : level <= 3 ? "bg-blue-400" : "bg-emerald-500"
                      : "bg-slate-200"
                  }`} />
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Repeat new password"
                className={`w-full border p-3 rounded-xl pr-10 focus:ring-2 focus:outline-none text-gray-800 ${
                  confirmPassword && confirmPassword !== newPassword
                    ? "border-red-300 focus:ring-red-400"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
              />
              <button type="button" onClick={() => setShowConfirm((p) => !p)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || (!!confirmPassword && confirmPassword !== newPassword)}
            className="bg-blue-900 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-1"
          >
            {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {loading ? "Saving…" : "Change Password"}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm text-gray-400 hover:text-gray-600 text-center transition"
          >
            ← Cancel
          </button>

        </form>
      </div>
    </div>
  );
}
