"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { X, User, Mail, Hash, ShieldCheck, Lock, Eye, EyeOff } from "lucide-react";

type Props = {
  onClose:   () => void;
  onSuccess: () => void;
};

interface ProctorForm {
  firstName:   string;
  lastName:    string;
  middleName:  string;
  email:       string;
  password:    string;
  blockNumber: string;
}

const inputClass =
  "w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 " +
  "focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400 transition placeholder:text-slate-400";

const EMPTY: ProctorForm = {
  firstName:   "",
  lastName:    "",
  middleName:  "",
  email:       "",
  password:    "12345678",   // default — super proctor can change before submitting
  blockNumber: "",
};

export default function AddProctorModal({ onClose, onSuccess }: Props) {
  const [form, setForm]           = useState<ProctorForm>(EMPTY);
  const [showPassword, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function set(field: keyof ProctorForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      toast.error("First name, last name and email are required");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/super-proctor/proctors", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName:   form.firstName.trim(),
          lastName:    form.lastName.trim(),
          middleName:  form.middleName.trim() || null,
          email:       form.email.trim().toLowerCase(),
          password:    form.password,
          blockNumber: form.blockNumber ? Number(form.blockNumber) : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to register proctor");

      toast.success(`${form.firstName} ${form.lastName} registered as proctor`);
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Top accent */}
        <div className="h-1.5 w-full bg-violet-500" />

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-100">
              <ShieldCheck className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Register New Proctor</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                A user account with DORMITORY role will be created automatically
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X size={15} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-4">

          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                First Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="First name"
                  value={form.firstName}
                  onChange={(e) => set("firstName", e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Last Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Last name"
                  value={form.lastName}
                  onChange={(e) => set("lastName", e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Middle name */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Middle Name{" "}
              <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Middle name"
                value={form.middleName}
                onChange={(e) => set("middleName", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Email Address <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                placeholder="proctor@example.com"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                required
                className={inputClass}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Temporary Password <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Default: 12345678"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                required
                minLength={8}
                className={`${inputClass} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPw((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Default is <span className="font-mono font-medium text-slate-500">12345678</span>. Proctor will be prompted to change it on first login.
            </p>
          </div>

          {/* Block number */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Block Number{" "}
              <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="number"
                placeholder="e.g. 3"
                min={1}
                value={form.blockNumber}
                onChange={(e) => set("blockNumber", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting && (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {submitting ? "Registering…" : "Register Proctor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
