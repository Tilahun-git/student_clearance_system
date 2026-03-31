"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Advisor } from "@/types/userData";

type Student = {
  studentId: string;
  firstName: string;
  middleName: string;
  lastName: string;
};

export default function AssignAdvisor() {
  const params = useSearchParams();
  const router = useRouter();

  const studentId = params.get("studentId");

  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [advisorId, setAdvisorId] = useState("");
  const [student, setStudent] = useState<Student>();

  useEffect(() => {
    if (!studentId) return;

    fetch(`/api/students/${studentId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch student");
        return res.json();
      })
      .then(setStudent)
      .catch(() => toast.error("Failed to load student"));

    fetch("/api/staff/advisors")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch advisors");
        return res.json();
      })
      .then(setAdvisors)
      .catch(() => toast.error("Failed to load advisors"));
  }, [studentId]);

  const handleAssign = async () => {
    if (!studentId) return toast.error("Missing student ID");
    if (!advisorId) return toast.error("Select advisor");

    const res = await fetch("/api/admin/assign-advisor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, advisorId }),
    });

    const data = await res.json();

    if (!res.ok) return toast.error(data.error || "Failed");

    toast.success("Advisor assigned successfully");
    router.push("/admin/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-200 px-4">

      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border p-8 space-y-6">

        <h2 className="text-2xl font-bold text-gray-800 text-center">
          Assign Advisor
        </h2>

        <div className="space-y-4">

          <div>
            <label className="text-sm text-gray-600">Student ID</label>
            <input
              value={student?.studentId || "undefined"}
              readOnly
              className="w-full mt-1 px-3 py-2 border rounded-lg bg-gray-100 text-gray-800"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Full Name</label>
            <input
              value={
                student
                  ? `${student.firstName} ${student.middleName || ""} ${student.lastName}`
                  : ""
              }
              readOnly
              className="w-full mt-1 px-3 py-2 border rounded-lg bg-gray-100 text-gray-800"
            />
          </div>

        </div>

        <div>
          <label className="text-sm text-gray-600">Select Advisor</label>

          <select
            value={advisorId}
            onChange={(e) => setAdvisorId(e.target.value)}
            className="w-full mt-1 border border-gray-300 bg-white text-gray-800 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
          >
            <option value=""> Select Advisor </option>

            {advisors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.user?.name || "Unnamed Advisor"}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleAssign}
          className="w-full bg-slate-600 hover:bg-slate-700 text-white py-2 rounded-lg font-semibold transition"
        >
          Assign Advisor
        </button>

      </div>
    </div>
  );
}