"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { fetchStudentProfile } from "@/lib/api/student";
import { Reasons } from "@/lib/constants/reasons";

export default function ClearanceRequestModal({
  onClose,
  onSuccess, // ✅ NEW
}: {
  onClose: () => void;
  onSuccess: () => void; // ✅ NEW
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);

  const [form, setForm] = useState({
    reason: "",
    academicYear: "",
    semester: "",
  });

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchStudentProfile();
        setStudent(data);
      } catch {
        toast.error("Failed to load student info");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function close() {
    onClose();
  }

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const { name, value } = e.target;

    if (name === "academicYear") {
      setForm({ ...form, academicYear: value, semester: "" });
      return;
    }

    setForm({ ...form, [name]: value });
  }

  function getYears() {
    const y = new Date().getFullYear();
    return [`${y - 1}/${y}`, `${y}/${y + 1}`];
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const res = await fetch("/api/clearance/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: form.reason,
          academicYear: form.academicYear,
          semester: form.semester,
        }),
      });

      const data = await res.json();

      if (!res.ok) return toast.error(data.error);

      toast.success("Request submitted 🎉");

      onSuccess(); // ✅ 🔥 THIS FIXES YOUR PROBLEM
      onClose();   // ✅ close modal

    } catch {
      toast.error("Server error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">

      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50">

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Clearance Request
            </h2>
            <p className="text-xs text-slate-500">
              Fill in your details to continue
            </p>
          </div>

          <button
            onClick={close}
            className="text-slate-500 hover:text-black text-xl"
          >
            ✕
          </button>

        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {loading ? (
            <p className="text-center text-slate-500">Loading...</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">

                <input
                  value={student.studentId}
                  readOnly
                  className="input"
                />

                <input
                  value={`${student.firstName} ${student.middleName} ${student.lastName}`}
                  readOnly
                  className="input"
                />

              </div>

              <div className="grid grid-cols-3 gap-3">

                <input value={student.faculty?.name} readOnly className="input" />
                <input value={student.school?.name} readOnly className="input" />
                <input value={student.department?.name} readOnly className="input" />

              </div>

              <div className="grid grid-cols-2 gap-3">

                <select
                  name="reason"
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">Reason</option>
                  {Reasons.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>

                <select
                  name="academicYear"
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">Academic Year</option>
                  {getYears().map((y) => (
                    <option key={y}>{y}</option>
                  ))}
                </select>

                <select
                  name="semester"
                  onChange={handleChange}
                  className="input"
                  disabled={!form.academicYear}
                >
                  <option value="">Semester</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                </select>

              </div>

              <div className="flex justify-end gap-3 pt-4">

                <button
                  type="button"
                  onClick={close}
                  className="px-4 py-2 rounded-lg text-black bg-slate-200 hover:bg-slate-300"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Submit
                </button>

              </div>

            </>
          )}

        </form>

      </div>

      <style jsx>{`
        .input {
          width: 100%;
          padding: 10px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          font-size: 14px;
          color: #0f172a;
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.98);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>

    </div>
  );
}