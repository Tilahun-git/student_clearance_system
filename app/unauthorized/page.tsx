"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShieldAlert, LogIn, LayoutDashboard } from "lucide-react";
import { getRedirectByRole } from "@/lib/roles";

export default function UnauthorizedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isLoading   = status === "loading";
  const isLoggedIn  = status === "authenticated" && !!session?.user;
  const activeRole  = session?.user?.activeRole;
  const dashboardUrl = activeRole ? getRedirectByRole(activeRole) : null;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-6">
      <div className="bg-white shadow-lg rounded-2xl p-10 max-w-md w-full text-center">

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <ShieldAlert className="w-16 h-16 text-red-500" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          403 — Access Denied
        </h1>

        {/* Message — context-aware */}
        <p className="text-gray-500 mb-6 text-sm leading-relaxed">
          {isLoading ? (
            "Checking your session…"
          ) : isLoggedIn ? (
            <>
              You are logged in as{" "}
              <span className="font-semibold text-gray-700">
                {session.user.name}
              </span>
              {activeRole && (
                <>
                  {" "}({activeRole.replace(/_/g, " ")})
                </>
              )}
              , but you do not have permission to access this page.
            </>
          ) : (
            "You need to log in to access this page."
          )}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          ) : isLoggedIn && dashboardUrl ? (
            <>
              <button
                onClick={() => router.push(dashboardUrl)}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
              >
                <LayoutDashboard size={16} />
                Go to My Dashboard
              </button>
              <button
                onClick={() => router.push("/auth/login")}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition"
              >
                <LogIn size={16} />
                Switch Account
              </button>
            </>
          ) : (
            <button
              onClick={() => router.push("/auth/login")}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
            >
              <LogIn size={16} />
              Go to Login
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
