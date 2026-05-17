"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ChevronDown, User, Mail, Lock, Building2, School, ShieldCheck, Check, Eye, EyeOff } from "lucide-react";
import { fetchRoles, fetchSchools, fetchDepartments, createUser } from "@/lib/api/admin";
import { RoleType } from "@prisma/client";

interface Role       { id: string; name: RoleType }
interface School     { id: string; name: string }
interface Department { id: string; name: string; schoolId: string }

interface UserForm {
  name:         string;
  email:        string;
  password:     string;
  roles:        string[];
  schoolId:     string;
  departmentId: string;
}

const SCHOOL_ROLES = ["SCHOOL_DEAN"];
const DEPT_ROLES   = ["DEPARTMENT_HEAD", "ADVISOR"];

const ROLE_COLORS: Record<string, string> = {
  ADMIN:           "bg-red-50 text-red-700 border-red-200",
  ADVISOR:         "bg-blue-50 text-blue-700 border-blue-200",
  DEPARTMENT_HEAD: "bg-purple-50 text-purple-700 border-purple-200",
  SCHOOL_DEAN:     "bg-indigo-50 text-indigo-700 border-indigo-200",
  REGISTRAR:       "bg-amber-50 text-amber-700 border-amber-200",
  LIBRARY:         "bg-teal-50 text-teal-700 border-teal-200",
  FINANCE:         "bg-green-50 text-green-700 border-green-200",
  STUDENT_DEAN:    "bg-pink-50 text-pink-700 border-pink-200",
  CAFETERIA:       "bg-orange-50 text-orange-700 border-orange-200",
  DORMITORY:       "bg-cyan-50 text-cyan-700 border-cyan-200",
  CAMPUS_POLICE:   "bg-slate-50 text-slate-700 border-slate-200",
};

const inputClass =
  "w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 " +
  "focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition placeholder:text-slate-400";

const selectClass =
  "w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 " +
  "focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition " +
  "disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed appearance-none";

export default function CreateUserPage() {
  const [rolesFromDB, setRolesFromDB]         = useState<Role[]>([]);
  const [schools, setSchools]                 = useState<School[]>([]);
  const [departments, setDepartments]         = useState<Department[]>([]);
  const [filteredDepts, setFilteredDepts]     = useState<Department[]>([]);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showPassword, setShowPassword]       = useState(false);
  const [submitting, setSubmitting]           = useState(false);

  const [user, setUser] = useState<UserForm>({
    name: "", email: "", password: "", roles: [],
    schoolId: "", departmentId: "",
  });

  useEffect(() => {
    fetchRoles()
      .then((d) => setRolesFromDB(Array.isArray(d) ? d.filter((r: Role) => r.name !== "STUDENT") : []))
      .catch(() => toast.error("Failed to load roles"));
    fetchSchools()
      .then((d) => setSchools(Array.isArray(d) ? d : []))
      .catch(() => toast.error("Failed to load schools"));
    fetchDepartments()
      .then((d) => setDepartments(Array.isArray(d) ? d : []))
      .catch(() => toast.error("Failed to load departments"));
  }, []);

  function toggleRole(roleName: RoleType) {
    setUser((prev) => ({
      ...prev,
      roles: prev.roles.includes(roleName)
        ? prev.roles.filter((r) => r !== roleName)
        : [...prev.roles, roleName],
    }));
  }

  function handleSchoolChange(schoolId: string) {
    setUser((prev) => ({ ...prev, schoolId, departmentId: "" }));
    setFilteredDepts(departments.filter((d) => d.schoolId === schoolId));
  }

  function clearForm() {
    setUser({ name: "", email: "", password: "", roles: [], schoolId: "", departmentId: "" });
    setFilteredDepts([]);
  }

  const needsSchool = user.roles.some((r) => SCHOOL_ROLES.includes(r));
  const needsDept   = user.roles.some((r) => DEPT_ROLES.includes(r));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createUser(user);
      toast.success("User created successfully!");
      clearForm();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 px-4 py-8">
      <div className="max-w-xl mx-auto">

        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-800">Create Staff Account</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Fill in the details below to create a new staff user account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Account Details
            </p>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Enter name"
                  value={user.name}
                  onChange={(e) => setUser((p) => ({ ...p, name: e.target.value }))}
                  required
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="Enter email"
                  value={user.email}
                  onChange={(e) => setUser((p) => ({ ...p, email: e.target.value }))}
                  required
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Temporary Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="password"
                  value={user.password}
                  onChange={(e) => setUser((p) => ({ ...p, password: e.target.value }))}
                  required
                  minLength={8}
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Role Assignment
            </p>

            {/* Role multi-select */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Roles</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowRoleDropdown((p) => !p)}
                  className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-xl bg-white text-left flex items-center justify-between transition
                    ${showRoleDropdown ? "border-indigo-400 ring-2 ring-indigo-400" : "border-slate-200 hover:border-slate-300"}`}
                >
                  <span className={user.roles.length > 0 ? "text-slate-800" : "text-slate-400"}>
                    {user.roles.length > 0
                      ? `${user.roles.length} role${user.roles.length > 1 ? "s" : ""} selected`
                      : "Select roles…"}
                  </span>
                  <ChevronDown
                    size={15}
                    className={`text-slate-400 transition-transform ${showRoleDropdown ? "rotate-180" : ""}`}
                  />
                </button>

                {showRoleDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowRoleDropdown(false)} />
                    <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-white border border-slate-200 rounded-xl shadow-lg overflow-y-auto max-h-56">
                      {rolesFromDB.map((role) => {
                        const checked = user.roles.includes(role.name);
                        const color   = ROLE_COLORS[role.name] ?? "bg-slate-50 text-slate-700 border-slate-200";
                        return (
                          <label
                            key={role.id}
                            className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-slate-50 transition"
                          >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition
                              ${checked ? "bg-indigo-600 border-indigo-600" : "border-slate-300 bg-white"}`}
                            >
                              {checked && <Check size={10} className="text-white" strokeWidth={3} />}
                            </div>
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={checked}
                              onChange={() => toggleRole(role.name)}
                            />
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${color}`}>
                              {role.name.replace(/_/g, " ")}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Selected role badges */}
              {user.roles.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {user.roles.map((r) => {
                    const color = ROLE_COLORS[r] ?? "bg-slate-50 text-slate-700 border-slate-200";
                    return (
                      <span key={r} className={`inline-flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 text-xs font-medium rounded-full border ${color}`}>
                        {r.replace(/_/g, " ")}
                        <button
                          type="button"
                          onClick={() => toggleRole(r as RoleType)}
                          className="ml-0.5 rounded-full hover:bg-black/10 p-0.5 transition"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
            {(needsSchool || needsDept) && (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  {needsSchool ? "Assign to School" : "School"}
                </label>
                <div className="relative">
                  <School className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <select
                    value={user.schoolId}
                    onChange={(e) => handleSchoolChange(e.target.value)}
                    required={needsSchool || needsDept}
                    className={selectClass}
                  >
                    <option value="">Select school…</option>
                    {schools.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            )}

            {needsDept && (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Department</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <select
                    value={user.departmentId}
                    onChange={(e) => setUser((p) => ({ ...p, departmentId: e.target.value }))}
                    required
                    disabled={!user.schoolId}
                    className={selectClass}
                  >
                    <option value="">
                      {user.schoolId ? "Select department…" : "Select school first"}
                    </option>
                    {filteredDepts.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || user.roles.length === 0}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition flex items-center justify-center gap-2 shadow-sm"
          >
            {submitting && (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {submitting ? "Creating…" : "Create User Account"}
          </button>

        </form>
      </div>
    </div>
  );
}
