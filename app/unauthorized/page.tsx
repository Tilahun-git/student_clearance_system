import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function Unauthorized() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-6">
      <div className="bg-white shadow-lg rounded-2xl p-10 max-w-md w-full text-center">
        
        <div className="flex justify-center mb-4">
          <ShieldAlert className="w-16 h-16 text-red-500" />
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          403 - Access Denied
        </h1>

        <p className="text-gray-600 mb-6">
          You do not have permission to access this page.  
          Please contact the system administrator if you believe this is an error.
        </p>

        <div className="flex justify-center gap-4">
          <Link
            href="/"
            className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Go Home
          </Link>

        </div>
      </div>
    </div>
  );
}