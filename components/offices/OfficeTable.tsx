"use client";

import { useEffect, useState } from "react";
import { fetchOffices } from "@/lib/api/offices";

export default function OfficeTable() {
  const [offices, setOffices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await fetchOffices();
      setOffices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setOffices([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">

      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold text-slate-800">
          Offices
        </h2>

        <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          {offices.length} total
        </span>
      </div>
      {loading ? (
        <div className="text-slate-500 text-sm py-6">
          Loading offices...
        </div>
      ) : offices.length === 0 ? (
        <div className="text-slate-500 text-sm py-6 text-center">
          No offices found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-600 border-b">
                <th className="py-3">Office Name</th>
                <th>Code</th>
                <th>Manager</th>
              </tr>
            </thead>

            <tbody>
              {offices.map((o) => (
                <tr
                  key={o.id}
                  className="border-b hover:bg-slate-50 transition"
                >
                  <td className="py-3 font-medium text-slate-800">
                    {o.office_name}
                  </td>

                  <td className="text-slate-600 uppercase tracking-wide">
                    {o.code}
                  </td>

                  <td className="text-slate-500">
                    {o.manager?.user?.name || (
                      <span className="text-red-400">
                        Not assigned
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>

        </div>
      )}
    </div>
  );
}