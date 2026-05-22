"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { KeyRound, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { routes } from "@/lib/roles";
import Link from "next/link";


type Step =
  | "credentials"   
  | "role-picker"  
  | "change-password"; 

function PasswordInput({
  value,
  onChange,
  placeholder,
  show,
  onToggle,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="w-full border border-gray-300 p-3 rounded-xl pr-10 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
      >
        {show ? <FaEyeSlash /> : <FaEye />}
      </button>
    </div>
  );
}

function StrengthBar({ password }: { password: string }) {
  if (!password.length) return null;
  return (
    <div className="mt-1.5 flex gap-1">
      {[1, 2, 3, 4].map((level) => (
        <div
          key={level}
          className={`h-1 flex-1 rounded-full transition-colors ${
            password.length >= level * 3
              ? level <= 1 ? "bg-red-400"
                : level <= 2 ? "bg-amber-400"
                : level <= 3 ? "bg-blue-400"
                : "bg-emerald-500"
              : "bg-slate-200"
          }`}
        />
      ))}
    </div>
  );
}


export default function LoginPage() {
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);

  const [step, setStep]           = useState<Step>("credentials");
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);

  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [availableRoles, setAvailableRoles]   = useState<string[]>([]);
  const [selectedRole, setSelectedRole]       = useState<string | null>(null);
  const [selectingRole, setSelectingRole]     = useState<string | null>(null);

  const [pendingRole, setPendingRole]         = useState<string | null>(null);
  const [currentPwd, setCurrentPwd]           = useState("");
  const [newPwd, setNewPwd]                   = useState("");
  const [confirmPwd, setConfirmPwd]           = useState("");
  const [showCurrent, setShowCurrent]         = useState(false);
  const [showNew, setShowNew]                 = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [changingPwd, setChangingPwd]         = useState(false);

  useEffect(() => { emailRef.current?.focus(); }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", { redirect: false, email, password });

      if (res?.error) {
        setError("Email or password is incorrect.");
        return;
      }

      const sessionRes  = await fetch("/api/auth/session");
      const session     = await sessionRes.json();
      const userRoles: string[] = session?.user?.roles ?? [];
      const mustChange: boolean = session?.user?.mustChangePassword ?? false;

      if (userRoles.length === 0) {
        setError("No roles assigned to this account. Contact your administrator.");
        return;
      }

      const staffRoles = userRoles.filter((r: string) => r !== "STUDENT");

      if (staffRoles.length === 0) {
        if (mustChange) {
          setPendingRole("STUDENT");
          setStep("change-password");
          return;
        }
        window.location.href = `/api/authenticate/select-role?role=STUDENT`;
        return;
      }

      if (staffRoles.length === 1) {
        if (mustChange) {
          setPendingRole(staffRoles[0]);
          setStep("change-password");
          return;
        }
        window.location.href = `/api/authenticate/select-role?role=${encodeURIComponent(staffRoles[0])}`;
        return;
      }

      setAvailableRoles(staffRoles);
      setStep("role-picker");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = async (role: string) => {
    setSelectingRole(role);
    try {
      const sessionRes = await fetch("/api/auth/session");
      const session    = await sessionRes.json();
      const mustChange: boolean = session?.user?.mustChangePassword ?? false;

      if (mustChange) {
        setPendingRole(role);
        setStep("change-password");
        return;
      }

      window.location.href = `/api/authenticate/select-role?role=${encodeURIComponent(role)}`;
    } finally {
      setSelectingRole(null);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPwd !== confirmPwd) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPwd.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setChangingPwd(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to change password");
        return;
      }

      toast.success("Password changed! Redirecting…");

      window.location.href = `/api/authenticate/select-role?role=${encodeURIComponent(pendingRole!)}`;
    } catch {
      toast.error("Server error. Please try again.");
    } finally {
      setChangingPwd(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-300 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 relative">

        <div className="flex justify-center mb-6">
          <img src="/wldu_logo.jpg" alt="University Logo" width={80} className="rounded-full shadow-md" />
        </div>
        {step === "credentials" && (
          <>
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">Login</h2>
            {error && <p className="text-red-500 text-center mb-4 text-sm">{error}</p>}
            <form onSubmit={handleLogin} className="flex flex-col gap-4 text-black">
              <input
                ref={emailRef}
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-gray-500 focus:outline-none"
              />
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
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-900 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {loading ? "Signing in…" : "Login"}
              </button>
            </form>
            <Link
              href="/auth/forgot-password"
              className="text-blue-600 text-sm"
            >
              Forgot Password?
            </Link>
          </>
        )}

        {step === "role-picker" && (
          <>
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">Select Your Role</h2>
            <p className="text-gray-500 text-sm text-center mb-4">
              Your account has multiple roles. Choose one to continue.
            </p>
            <div className="flex flex-col gap-2">
              {availableRoles.map((role) => {
                const isLoading = selectingRole === role;
                return (
                  <button
                    key={role}
                    onClick={() => handleRoleSelect(role)}
                    disabled={selectingRole !== null}
                    className="w-full flex items-center justify-between bg-blue-700 hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl transition-colors"
                  >
                    <span className="font-medium">{role.replace(/_/g, " ")}</span>
                    {isLoading
                      ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <span className="text-white/60 text-sm">→</span>
                    }
                  </button>
                );
              })}
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={() => { setStep("credentials"); setError(""); setAvailableRoles([]); }}
                className="text-sm text-gray-400 hover:text-gray-600 transition"
              >
                ← Back to login
              </button>
            </div>
          </>
        )}
        {step === "change-password" && (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <KeyRound className="w-6 h-6 text-blue-900" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">Set Your Password</h2>
            <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <PasswordInput
                  value={currentPwd}
                  onChange={setCurrentPwd}
                  placeholder="Enter your temporary password"
                  show={showCurrent}
                  onToggle={() => setShowCurrent((p) => !p)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <PasswordInput
                  value={newPwd}
                  onChange={setNewPwd}
                  placeholder="At least 8 characters"
                  show={showNew}
                  onToggle={() => setShowNew((p) => !p)}
                />
                <StrengthBar password={newPwd} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPwd}
                    onChange={(e) => setConfirmPwd(e.target.value)}
                    placeholder="Repeat new password"
                    required
                    className={`w-full border p-3 rounded-xl pr-10 focus:ring-2 focus:outline-none text-gray-800 ${
                      confirmPwd && confirmPwd !== newPwd
                        ? "border-red-300 focus:ring-red-400"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((p) => !p)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {confirmPwd && confirmPwd !== newPwd && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={changingPwd || (!!confirmPwd && confirmPwd !== newPwd)}
                className="bg-blue-900 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-1"
              >
                {changingPwd && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {changingPwd ? "Saving…" : "Set Password"}
              </button>

            </form>
          </>
        )}

      </div>
    </div>
  );
}
