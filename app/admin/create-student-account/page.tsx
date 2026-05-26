"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

type FormState = {
  name: string;
  email: string;
  password: string;
};

function CreateStudentAccountContent() {
  const params = useSearchParams();

  const studentId = params.get("studentId");

  const [loadingStudent, setLoadingStudent] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    const fetchStudent = async () => {
      if (!studentId) {
        setLoadingStudent(false);
        return;
      }

      try {
        const res = await fetch(`/api/admin/student/${studentId}`);

        if (!res.ok) {
          throw new Error("Failed to fetch student");
        }

        const data = await res.json();

        setForm((prev) => ({
          ...prev,
          name: `${data.firstName ?? ""} ${data.middleName ?? ""}`.trim(),
        }));
      } catch (error) {
        console.error(error);
        toast.error("Failed to load student info");
      } finally {
        setLoadingStudent(false);
      }
    };

    fetchStudent();
  }, [studentId]);

  const handleCreateAccount = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!studentId) {
      toast.error("Student ID missing");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/create-student-user", {
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
        toast.error(data.error || "Failed to create account");
        return;
      }
      toast.success(data.message || "Account created successfully");

      setForm({
        name: "",
        email: "",
        password: "",
      });
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingStudent) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-slate-500 text-center text-sm">Loading student information...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center overflow-y-auto bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 space-y-6 border border-slate-200">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Create Student Account
          </h2>

          <p className="text-sm text-slate-500 text-center">
            Create login credentials for the selected student
          </p>
        </div>
        <form onSubmit={handleCreateAccount} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">
              Student ID
            </label>
            <input
              type="text"
              value={studentId || ""}
              readOnly
              className="w-full mt-1 px-3 py-2 border rounded-lg bg-gray-100 text-gray-700"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">
              Full Name
            </label>

            <input
              type="text"
              value={form.name}
              required
              placeholder="Enter full name"
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              required
              placeholder="Enter email"
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  email: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">
              Temporary Password
            </label>
            <input
              type="password"
              value={form.password}
              required
              placeholder="Enter temporary password"
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg font-semibold transition"
          >
            {submitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
export default function CreateStudentAccount() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-slate-500 text-sm">Loading page...</p>
        </div>
      }
    >
      <CreateStudentAccountContent />
    </Suspense>
  );
}