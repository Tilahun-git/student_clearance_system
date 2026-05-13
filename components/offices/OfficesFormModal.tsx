

"use client";
import { useState } from "react";
type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    office_name: string;
    code: string;
  }) => Promise<void>;
};
export default function OfficeFormModal({
  open,
  onClose,
  onSubmit,
}: Props) {
  const [office_name, setOfficeName] =
    useState("");

  const [code, setCode] = useState("");

  const [loading, setLoading] =
    useState(false);

  if (!open) return null;

  async function handleSubmit() {
    try {
      setLoading(true);

      await onSubmit({
        office_name,
        code,
      });

      setOfficeName("");
      setCode("");

      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <h2 className="text-xl font-bold text-slate-800">
          Create Office
        </h2>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Office Name
          </label>

          <input
            value={office_name}
            onChange={(e) =>
              setOfficeName(e.target.value)
            }
            className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Office Code
          </label>

          <input
            value={code}
            onChange={(e) =>
              setCode(e.target.value)
            }
            className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-2"
            placeholder="LIBRARY"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300"
          >
            Cancel
          </button>

          <button
            disabled={loading}
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white"
          >
            {loading
              ? "Saving..."
              : "Save Office"}
          </button>
        </div>
      </div>
    </div>
  );
}
