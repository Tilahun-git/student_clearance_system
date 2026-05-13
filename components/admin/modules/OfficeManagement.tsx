"use client";

import { useEffect, useState } from "react";
import { Building2,UserCheck,Users,} from "lucide-react";
import { loadOffice } from "@/lib/api/offices";

export default function OfficeManagement() {
  const [offices, setOffices] = useState<any[]>([]);
  const [staffOptions, setStaffOptions] = useState<any[]>([]);
  const [selectedOffice, setSelectedOffice] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
   loadOffices();
  }, []);

  async function loadOffices() {
    try {
      setLoading(true);
      const offices  = await loadOffice();
      setOffices(Array.isArray(offices) ? offices : []);
    } catch (error) {
      console.error(error);
      setOffices([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadStaff(officeCode: string, officeId: string) {
    try {
      setSelectedOffice(officeId);
      const res = await fetch(`/api/staff/by-role/${officeCode}`);
      const data = await res.json();
      setStaffOptions(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(error);
      setStaffOptions([]);
    }
  }

  async function assignManager(officeId: string, staffId: string) {
    try {
      setAssigning(true);
      await fetch("/api/offices/assign-manager",{
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            officeId,
            staffId,
          }),
        }
      );

      await loadOffices();
      setSelectedOffice(null);
    } catch (error) {
      console.error(error);
    } finally {
      setAssigning(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            Office Management
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Manage offices and assign office
            managers
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-pink-100">
                <Building2 className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">
                  Total Offices
                </p>
                <h2 className="text-lg font-bold text-slate-800">
                  {offices.length}
                </h2>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-100">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Offices
              </h2>
              <p className="text-sm text-slate-500">
                Assign staff managers for
                offices
              </p>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="p-10 text-center text-slate-500">
            Loading offices...
          </div>
        ) : offices.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            No offices found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-175">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left">
                  <th className="px-6 py-4 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Office
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Code
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Manager
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>
                {offices.map((office) => (
                  <tr
                    key={office.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-pink-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">
                            {office.office_name}
                          </p>
                          <p className="text-xs text-slate-400">
                            Clearance Office
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-semibold tracking-wide text-slate-700">
                        {office.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {office.manager?.user?.name ? (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                            <UserCheck className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-700">
                              {office.manager.user.name}
                            </p>
                            <p className="text-xs text-green-600">
                              Assigned
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-red-500 font-medium">
                          Not Assigned
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {selectedOffice === office.id ? (
                        <select
                          onChange={(e) => assignManager(office.id,e.target.value)}
                          className=" w-full rounded-xl border border-slate-30 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" >
                          <option>
                            Select Staff
                          </option>
                          {staffOptions.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.user.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <button
                          onClick={() =>
                            loadStaff(
                              office.code,
                              office.id
                            )
                          }
                          disabled={assigning}
                          className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-xl
                            bg-blue-600
                            hover:bg-blue-700
                            text-white
                            px-4
                            py-2
                            text-sm
                            font-medium
                            transition
                          "
                        >

                          <UserCheck className="w-4 h-4" />

                          Select Manager

                        </button>

                      )}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}