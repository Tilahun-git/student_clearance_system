"use client";

import { useRouter } from "next/navigation";
import { ShieldAlert, LogIn } from "lucide-react";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 text-center shadow-lg">
        <div className="mb-4 flex justify-center">
          <ShieldAlert className="h-16 w-16 text-red-500" />
        </div>

        <h1 className="mb-3 text-3xl font-bold text-gray-800">
          Access Denied
        </h1>

        <p className="mb-6 text-sm leading-relaxed text-gray-500">
          You do not have permission to access this page.
        </p>

        <button
          onClick={() => router.push("/auth/login")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <LogIn size={16} />
          Go to Login
        </button>
      </div>
    </div>
  );
}
