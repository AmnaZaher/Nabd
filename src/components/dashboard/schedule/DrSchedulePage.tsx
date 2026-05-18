import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Loader2,
  X,
  Check,
} from "lucide-react";
import TopBar from "../TopBar";
import { useNavigate } from "react-router-dom";
import {
  scheduleApi,
  type DoctorSchedule,
  type CreateDoctorScheduleDto,
} from "../../../api/schedules";
import { staffApi } from "../../../api/staff";
import { getClinics } from "../../../api/clinics";
import { useAuth } from "../../../context/AuthContext";

// ─── Types ───────────────────────────────────────────────────────────────────
interface DrSchedulePageProps {
  onMenuClick: () => void;
  onAddUserClick: (type: "patient" | "staff", role?: string) => void;
  onProfileClick?: () => void;
}

interface DoctorOption {
  id: number;
  name: string;
}
interface ClinicOption {
  id: number;
  name: string;
}

// DayOfWeek: 0=Sunday … 6=Saturday (matches .NET enum)
const DAY_OPTIONS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const getDayIndex = (dayVal: any): number => {
  if (dayVal === undefined || dayVal === null) return -1;
  if (typeof dayVal === 'number') return dayVal;
  if (!isNaN(Number(dayVal))) return Number(dayVal);
  const dayStr = String(dayVal).trim().toLowerCase();
  const index = DAY_OPTIONS.findIndex(d => d.toLowerCase() === dayStr);
  return index;
};

const getDayName = (dayVal: any): string => {
  const index = getDayIndex(dayVal);
  if (index >= 0 && index < 7) return DAY_OPTIONS[index];
  if (dayVal !== undefined && dayVal !== null) return String(dayVal);
  return '';
};
const DAY_COLORS: Record<string, string> = {
  Monday: "bg-blue-500 text-white",
  Tuesday: "bg-blue-500 text-white",
  Wednesday: "bg-green-500 text-white",
  Thursday: "bg-orange-500 text-white",
  Friday: "bg-blue-500 text-white",
  Saturday: "bg-pink-500 text-white",
  Sunday: "bg-slate-500 text-white",
};

// "HH:mm:ss" → "HH:mm AM/PM"
const formatTime = (t: string) => {
  if (!t) return "N/A";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
};

// "HH:mm" (input[time]) → "HH:mm:ss"
const toTimeSpan = (v: string) => (v ? `${v}:00` : "");

// ─── SelectField ─────────────────────────────────────────────────────────────
const SelectField = ({
  label,
  options,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
      {label}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 pr-9"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      />
    </div>
  </div>
);

const TimeField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
      {label}
    </label>
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

// ─── Edit Modal ───────────────────────────────────────────────────────────────
const EditModal = ({
  schedule,
  doctors,
  clinics,
  onSave,
  onClose,
}: {
  schedule: DoctorSchedule;
  doctors: DoctorOption[];
  clinics: ClinicOption[];
  onSave: (id: number, data: CreateDoctorScheduleDto) => Promise<void>;
  onClose: () => void;
}) => {
  const [doctorId, setDoctorId] = useState(String(schedule.doctorId));
  const [clinicId, setClinicId] = useState(String(schedule.clinicId));
  const [day, setDay] = useState(String(schedule.dayOfWeek));
  const [from, setFrom] = useState(schedule.startTime?.slice(0, 5) ?? "");
  const [to, setTo] = useState(schedule.endTime?.slice(0, 5) ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!doctorId || !clinicId || !from || !to) {
      setError("All fields are required.");
      return;
    }
    setSaving(true);
    try {
      await onSave(schedule.id, {
        doctorId: Number(doctorId),
        clinicId: Number(clinicId),
        dayOfWeek: Number(day) as any,
        startTime: toTimeSpan(from),
        endTime: toTimeSpan(to),
        isActive: true,
      });
      onClose();
    } catch (e: any) {
      setError(e.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-slate-800">Edit Schedule</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <SelectField
            label="Doctor"
            placeholder="Select Doctor"
            value={doctorId}
            onChange={setDoctorId}
            options={doctors.map((d) => ({
              value: String(d.id),
              label: d.name,
            }))}
          />
          <SelectField
            label="Clinic"
            placeholder="Select Clinic"
            value={clinicId}
            onChange={setClinicId}
            options={clinics.map((c) => ({
              value: String(c.id),
              label: c.name,
            }))}
          />
          <SelectField
            label="Day"
            placeholder="Select Day"
            value={day}
            onChange={setDay}
            options={DAY_OPTIONS.map((d, i) => ({
              value: String(i),
              label: d,
            }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <TimeField label="From Time" value={from} onChange={setFrom} />
          <TimeField label="To Time" value={to} onChange={setTo} />
        </div>
        {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Check size={14} />
            )}{" "}
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const DrSchedulePage = ({
  onMenuClick,
  onAddUserClick,
  onProfileClick,
}: DrSchedulePageProps) => {
  const { isNurse } = useAuth();
  const navigate = useNavigate();
  // Dropdown data
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [clinics, setClinics] = useState<ClinicOption[]>([]);

  // Create form
  const [doctorId, setDoctorId] = useState("");
  const [clinicId, setClinicId] = useState("");
  const [day, setDay] = useState("1"); // Monday default
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState(false);

  // Filter
  const [filterDoctorId, setFilterDoctorId] = useState("");
  const [filterClinicId, setFilterClinicId] = useState("");

  // Table data
  const [schedules, setSchedules] = useState<DoctorSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 10;

  // Edit modal
  const [editTarget, setEditTarget] = useState<DoctorSchedule | null>(null);

  const extractList = (resObj: any): any[] => {
    if (!resObj) return [];
    if (Array.isArray(resObj)) return resObj;
    if (Array.isArray(resObj.data)) return resObj.data;
    if (Array.isArray(resObj.data?.data)) return resObj.data.data;
    if (Array.isArray(resObj.data?.schedules)) return resObj.data.schedules;
    if (Array.isArray(resObj.data?.items)) return resObj.data.items;
    if (Array.isArray(resObj.schedules)) return resObj.schedules;
    if (Array.isArray(resObj.items)) return resObj.items;
    return [];
  };

  // ── Load dropdown data once ──
  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const [staffRes, clinicRes] = await Promise.all([
          staffApi.getStaffs({ Role: "2", PageIndex: 0, PageSize: 1000 }), // Role 2 = Doctor
          getClinics({ PageIndex: 0, PageSize: 100 }),
        ]);
        const staffList: any[] = extractList(staffRes);
        setDoctors(
          staffList.map((s: any) => ({
            id: s.id ?? s.Id,
            name: s.fullNameEnglish ?? s.name ?? s.FullNameEnglish ?? "Unknown",
          })),
        );

        const clinicList: any[] = extractList(clinicRes);
        setClinics(
          clinicList.map((c: any) => ({
            id: c.id ?? c.Id,
            name: c.clinicNameEn ?? c.clinicNameAr ?? `Clinic #${c.id}`,
          })),
        );
      } catch (e) {
        console.error("Failed to load dropdowns", e);
      }
    };
    loadDropdowns();
  }, []);

  // ── Fetch schedules ──
  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const res = await scheduleApi.getSchedules({
        PageIndex: currentPage - 1,
        PageSize: PAGE_SIZE,
        DoctorId: filterDoctorId ? Number(filterDoctorId) : undefined,
        ClinicId: filterClinicId ? Number(filterClinicId) : undefined,
      });
      const any = res as any;
      const list: DoctorSchedule[] = extractList(any);
      const total: number =
        any?.data?.totalCount ??
        any?.data?.totalPages ??
        any?.totalCount ??
        list.length;
      setSchedules(list);
      setTotalCount(total);
      setTotalPages(
        Math.max(
          1,
          typeof any?.data?.totalPages === "number"
            ? any.data.totalPages
            : Math.ceil(total / PAGE_SIZE),
        ),
      );
    } catch (e) {
      console.error("Failed to fetch schedules", e);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterDoctorId, filterClinicId]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  // ── Create ──
  const handleCreate = async () => {
    setCreateError("");
    if (!doctorId || !clinicId || !fromTime || !toTime) {
      setCreateError("All fields are required.");
      return;
    }
    setCreating(true);
    try {
      await scheduleApi.createSchedule({
        doctorId: Number(doctorId),
        clinicId: Number(clinicId),
        dayOfWeek: Number(day) as any,
        startTime: toTimeSpan(fromTime),
        endTime: toTimeSpan(toTime),
        isActive: true,
      });
      setCreateSuccess(true);
      setDoctorId("");
      setClinicId("");
      setDay("1");
      setFromTime("");
      setToTime("");
      setCurrentPage(1);
      setTimeout(() => setCreateSuccess(false), 3000);
      fetchSchedules();
    } catch (e: any) {
      setCreateError(e.message || "Failed to create schedule.");
    } finally {
      setCreating(false);
    }
  };

  // ── Delete ──
  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this schedule?")) return;
    try {
      await scheduleApi.deleteSchedule(id);
      fetchSchedules();
    } catch (e: any) {
      alert(e.message || "Failed to delete.");
    }
  };

  // ── Update (from modal) ──
  const handleUpdate = async (id: number, data: CreateDoctorScheduleDto) => {
    await scheduleApi.updateSchedule(id, data);
    fetchSchedules();
  };

  const getClinicName = (id: number) =>
    clinics.find((c) => c.id === id)?.name ?? `Clinic #${id}`;
  const getDoctorName = (id: number) =>
    doctors.find((d) => d.id === id)?.name ?? `Doctor #${id}`;

  return (
    <div className="flex flex-col h-screen bg-[#f1f5f9] overflow-y-auto selection:bg-blue-100">
      <TopBar
        title="DR. Schedule"
        onMenuClick={onMenuClick}
        showAddUser={!isNurse}
        onAddUserClick={onAddUserClick}
        onProfileClick={onProfileClick}
      />

      <div className="flex flex-col gap-5 p-6 md:p-8">
        {/* Breadcrumb */}
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1">
            <button
              onClick={() => navigate("/dashboard")} // المسار الرئيسي للداشبورد
              className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 px-1.5 py-0.5 rounded-md transition-all duration-200 cursor-pointer flex items-center justify-center"
            >
              Dashboards
            </button>
            <span className="text-slate-300 select-none">›</span>
            <span className="text-blue-600">Doctor Management</span>
          </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Doctor Schedule Management
            </h2>
          <p className="text-sm text-slate-400 mt-0.5 font-medium">
            Configure hospital shift rosters and clinical rotations
          </p>
        </div>

        {/* ── Create Card ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
              <Plus size={12} className="text-white" strokeWidth={3} />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              Create Schedule
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <SelectField
              label="Doctor"
              placeholder="Select Doctor"
              value={doctorId}
              onChange={setDoctorId}
              options={doctors.map((d) => ({
                value: String(d.id),
                label: d.name,
              }))}
            />
            <SelectField
              label="Clinic"
              placeholder="Select Clinic"
              value={clinicId}
              onChange={setClinicId}
              options={clinics.map((c) => ({
                value: String(c.id),
                label: c.name,
              }))}
            />
            <SelectField
              label="Day"
              placeholder="Select Day"
              value={day}
              onChange={setDay}
              options={DAY_OPTIONS.map((d, i) => ({
                value: String(i),
                label: d,
              }))}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <TimeField
              label="From Time"
              value={fromTime}
              onChange={setFromTime}
            />
            <TimeField label="To Time" value={toTime} onChange={setToTime} />
            <div className="flex flex-col justify-end gap-1">
              {createError && (
                <p className="text-red-500 text-xs">{createError}</p>
              )}
              {createSuccess && (
                <p className="text-green-600 text-xs font-semibold">
                  ✓ Schedule created!
                </p>
              )}
              <button
                onClick={handleCreate}
                disabled={creating}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-2.5 rounded-lg transition-all text-sm"
              >
                {creating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} strokeWidth={2.5} />
                )}
                {creating ? "Adding..." : "Add Schedule"}
              </button>
            </div>
          </div>
        </div>

        {/* ── Filter Card ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              label="Filter by Doctor"
              placeholder="All Doctors"
              value={filterDoctorId}
              onChange={(v) => {
                setFilterDoctorId(v);
                setCurrentPage(1);
              }}
              options={doctors.map((d) => ({
                value: String(d.id),
                label: d.name,
              }))}
            />
            <SelectField
              label="Filter by Clinic"
              placeholder="All Clinics"
              value={filterClinicId}
              onChange={(v) => {
                setFilterClinicId(v);
                setCurrentPage(1);
              }}
              options={clinics.map((c) => ({
                value: String(c.id),
                label: c.name,
              }))}
            />
          </div>
        </div>

        {/* ── Table Card ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-white">
                  {[
                    "Doctor Name",
                    "Clinic",
                    "Day",
                    "From Time",
                    "To Time",
                    "Status",
                    "Actions",
                  ].map((col) => (
                    <th
                      key={col}
                      className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-500"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center text-slate-400"
                    >
                      <Loader2
                        className="animate-spin mx-auto mb-2"
                        size={22}
                      />
                      <p>Loading schedules…</p>
                    </td>
                  </tr>
                ) : schedules.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center text-slate-400 font-medium"
                    >
                      No schedules found.
                    </td>
                  </tr>
                ) : (
                  schedules.map((s, index) => {
                    const dayName = getDayName(s.dayOfWeek) || "Unknown";
                    const docName = s.doctorName ?? getDoctorName(s.doctorId);
                    const clinicName =
                      s.clinicName ?? getClinicName(s.clinicId);
                    const initials = docName
                      .split(" ")
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((w) => w[0])
                      .join("")
                      .toUpperCase();
                    return (
                      <tr
                        key={s.id || `${s.doctorId}-${s.dayOfWeek}-${index}`}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                              <span className="text-[10px] font-extrabold text-blue-600">
                                {initials}
                              </span>
                            </div>
                            <p className="font-semibold text-slate-800 text-sm">
                              {docName}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-600 font-medium">
                          {clinicName}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded text-xs font-bold ${DAY_COLORS[dayName] ?? "bg-slate-100 text-slate-600"}`}
                          >
                            {dayName}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-600 font-medium">
                          {formatTime(s.startTime)}
                        </td>
                        <td className="px-5 py-4 text-slate-600 font-medium">
                          {formatTime(s.endTime)}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded text-xs font-bold ${s.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}
                          >
                            {s.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setEditTarget(s)}
                              className="p-1.5 rounded text-blue-500 hover:bg-blue-50 transition-colors"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(s.id)}
                              className="p-1.5 rounded text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-200">
            <p className="text-xs text-slate-400 font-medium">
              {loading
                ? "Loading…"
                : `Showing ${schedules.length} of ${totalCount} schedules`}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded text-slate-400 hover:bg-slate-100 transition-colors disabled:opacity-40"
              >
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-8 h-8 rounded text-xs font-bold transition-colors ${currentPage === p ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-100"}`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded text-slate-400 hover:bg-slate-100 transition-colors disabled:opacity-40"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editTarget && (
        <EditModal
          schedule={editTarget}
          doctors={doctors}
          clinics={clinics}
          onSave={handleUpdate}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  );
};

export default DrSchedulePage;
