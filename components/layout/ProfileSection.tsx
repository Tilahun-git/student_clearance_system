"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LogOut, ChevronDown, KeyRound } from "lucide-react";

export default function ProfileSection() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  if (status === "loading") {
    return <div className="skeleton w-8 h-8 rounded-full" />;
  }

  if (!session?.user) return null;

  const name = session.user.name || "User";
  // Use activeRole (the role the user selected at login) not roles[0]
  const role = session.user.activeRole ?? session.user.roles?.[0] ?? "";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-slate-100 transition"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
          {initials}
        </div>
        <div className="hidden sm:flex flex-col items-start leading-tight">
          <span className="text-xs font-semibold text-slate-800 max-w-[120px] truncate">{name}</span>
          {role && (
            <span className="text-[10px] text-slate-400 uppercase tracking-wide">
              {role.replace(/_/g, " ")}
            </span>
          )}
        </div>
        <ChevronDown
          size={14}
          className={`text-slate-400 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden modal-panel">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-800 truncate">{name}</p>
            <p className="text-xs text-slate-400 truncate">{session.user.email}</p>
          </div>
          <button
            onClick={() => {
              setOpen(false);
              router.push("/auth/change-password?voluntary=1");
            }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition border-b border-slate-100"
          >
            <KeyRound size={15} className="text-slate-400" />
            Change Password
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
