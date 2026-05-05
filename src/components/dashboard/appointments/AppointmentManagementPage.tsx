import React, { useEffect, useState, useCallback } from 'react';
import {
    Edit2, Loader2, CalendarCheck,
    ChevronLeft, ChevronRight, Plus, Hourglass, CheckCircle2, XCircle, Ban
} from 'lucide-react';
import {
    listAppointments, deleteAppointment, type Appointment
} from '../../../api/appointments';
import { getClinics } from '../../../api/clinics';
import { staffApi } from '../../../api/staff';
import { scheduleApi } from '../../../api/schedules';
import { useNavigate } from 'react-router-dom';

/* ─────────────── helpers ─────────────── */
const STATUS_MAP: Record<number, { label: string; color: string; bg: string }> = {
    1: { label: 'Scheduled', color: '#1A6FC4', bg: '#EFF6FF' },
    2: { label: 'In Progress', color: '#ca8a04', bg: '#FEFCE8' },
    3: { label: 'Completed', color: '#16a34a', bg: '#F0FDF4' },
    4: { label: 'No Show',   color: '#64748b', bg: '#F1F5F9' },
    5: { label: 'Cancelled', color: '#dc2626', bg: '#FEF2F2' },
    6: { label: 'Waiting List', color: '#ea580c', bg: '#FFF7ED' },
};

const STATUS_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: '1', label: 'Scheduled' },
    { value: '2', label: 'In Progress' },
    { value: '3', label: 'Completed' },
    { value: '4', label: 'No Show' },
    { value: '5', label: 'Cancelled' },
    { value: '6', label: 'Waiting List' },
];

function StatusBadge({ status }: { status: any }) {
    let s = STATUS_MAP[status as number];
    
    // If not found by number, try to match by string value or label
    if (!s) {
        const matchingKey = Object.keys(STATUS_MAP).find(
            k => STATUS_MAP[Number(k)].label.replace(' ', '').toLowerCase() === String(status).replace(' ', '').toLowerCase() || 
                 k === String(status)
        );
        if (matchingKey) s = STATUS_MAP[Number(matchingKey)];
    }

    // Fallback if status is a string but not in map
    if (!s && typeof status === 'string' && status.trim() !== '') {
        return (
            <span style={{ color: '#fff', background: '#64748b' }}
                className="text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                {status}
            </span>
        );
    }

    s = s ?? { label: 'Unknown', color: '#fff', bg: '#64748b' };
    return (
        <span style={{ color: '#fff', background: s.color }}
            className="text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-sm">
            {s.label}
        </span>
    );
}

function initials(name: string) {
    if (!name) return 'U';
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function aptIdStr(id: any) {
    return `APT-${String(id).padStart(4, '0')}`;
}

function fmtDateTime(iso: any) {
    if (!iso) return { date: 'N/A', time: '' };
    try {
        const d = new Date(iso);
        if (isNaN(d.getTime())) return { date: String(iso), time: '' };
        return {
            date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        };
    } catch { return { date: String(iso), time: '' }; }
}

/** Resolve the date/time from an appointment object — backend uses appointmentDate, legacy used dateTime */
function getAptDate(apt: any): string | undefined {
    return apt.appointmentDate || apt.dateTime || apt.AppointmentDate || apt.DateTime || undefined;
}

/* ─────────────── Main Page ─────────────── */

const AppointmentManagementPage: React.FC = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const pageSize = 10;

    // Modal state for cancellation
    const [cancelModalData, setCancelModalData] = useState<Appointment | null>(null);

    // Filters
    const [search] = useState('');
    const [filterDoctor, setFilterDoctor] = useState('');
    const [filterClinic, setFilterClinic] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterFrom, setFilterFrom] = useState('');
    const [filterTo, setFilterTo] = useState('');

    // Dropdowns for modal
    const [doctors, setDoctors] = useState<any[]>([]);
    const [availableDoctors, setAvailableDoctors] = useState<any[]>([]);
    const [clinics, setClinics] = useState<any[]>([]);

    // Stats
    const [stats, setStats] = useState({
        totalToday: 0,
        waiting: 0,
        completed: 0,
        cancelled: 0
    });

    /* ── Fetch appointments ── */
    const fetchAppointments = useCallback(async () => {
        setLoading(true);
        try {
            const res = await listAppointments({
                PageIndex: page - 1,
                PageSize: pageSize,
                SearchKey: search || undefined,
                search: search || undefined,
                DoctorId: filterDoctor || undefined,
                ClinicId: filterClinic || undefined,
                Status: filterStatus !== '' ? filterStatus : undefined,
                StartDate: filterFrom || undefined,
                EndDate: filterTo || undefined,
            });
            const raw: any = res;
            // Normalise various API shapes
            const list: Appointment[] =
                raw?.data?.appointments ??
                raw?.data?.data ??
                raw?.data?.items ??
                (Array.isArray(raw?.data) ? raw.data : []) ??
                raw?.appointments ??
                raw?.items ??
                (Array.isArray(raw) ? raw : []) ??
                [];
            const total: number =
                raw?.data?.totalCount ??
                raw?.data?.total ??
                raw?.totalCount ??
                list.length;
            setAppointments(list);
            setTotalCount(total);
        } catch (err) {
            console.error('Failed to fetch appointments:', err);
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    }, [page, search, filterDoctor, filterClinic, filterStatus, filterFrom, filterTo]);

    /* ── Fetch sidebar data (doctors, clinics, patients) & Stats ── */
    useEffect(() => {
        const load = async () => {
            try {
                const [drRes, clinicRes, statsApptsRes] = await Promise.all([
                    staffApi.getStaffs({ PageIndex: 0, PageSize: 100 }),
                    getClinics({ PageIndex: 0, PageSize: 100 }),
                    // Fetch today's appointments for stats
                    listAppointments({ 
                        StartDate: new Date().toISOString().split('T')[0], 
                        EndDate: new Date().toISOString().split('T')[0], 
                        PageIndex: 0, 
                        PageSize: 1000 
                    })
                ]);

                const staffList = (drRes as any)?.staffs ?? (drRes as any)?.items ?? (drRes as any)?.data ?? (drRes as any)?.data?.data ?? (Array.isArray(drRes) ? drRes : []);
                const drList = staffList.filter((s: any) => {
                    const rolesMap: Record<string, string> = { '1': 'Admin', '2': 'Doctor', '3': 'Nurse', '4': 'Pharmacist', '5': 'Radiologist', '6': 'Lab Technician' };
                    let r = s.role ?? s.Role ?? s.roleName ?? s.RoleName ?? s.roleId ?? s.RoleId ?? s.staffRole ?? s.StaffRole;
                    let rStr = typeof r === 'object' ? (r?.name ?? r?.Name ?? rolesMap[r?.id ?? r?.Id]) : String(r);
                    rStr = rolesMap[rStr] ?? rStr;
                    
                    if (!rStr || rStr === 'undefined') {
                        for (const k in s) {
                            if (k.toLowerCase().includes('role')) {
                                const val = s[k];
                                rStr = typeof val === 'object' ? (val?.name ?? val?.Name ?? rolesMap[val?.id ?? val?.Id]) : String(val);
                                rStr = rolesMap[rStr] ?? rStr;
                                break;
                            }
                        }
                    }
                    return rStr === 'Doctor' || rStr === '2';
                }).map((d: any) => ({
                    ...d,
                    id: d.id || d.Id || d.nationalId || d.NationalId,
                    name: d.fullNameEnglish || d.FullNameEnglish || d.name || d.Name || `Dr. #${d.id || d.Id}`
                }));
                setDoctors(drList);
                setAvailableDoctors(drList);

                const clinicList = (clinicRes as any)?.data?.data ?? (clinicRes as any)?.data?.items ??
                    (Array.isArray((clinicRes as any)?.data) ? (clinicRes as any).data : []);
                setClinics(clinicList);

                // Calculate stats
                const rawStats: any = statsApptsRes;
                const todayAppts: Appointment[] = 
                    rawStats?.data?.appointments ?? rawStats?.data?.data ?? rawStats?.data?.items ?? (Array.isArray(rawStats?.data) ? rawStats.data : []) ?? rawStats?.items ?? [];
                
                const waiting = todayAppts.filter(a => a.status === 2 || a.status === 6).length; // In Progress or Waiting List
                const completed = todayAppts.filter(a => a.status === 3).length;
                const cancelled = todayAppts.filter(a => a.status === 5).length;

                setStats({
                    totalToday: todayAppts.length,
                    waiting,
                    completed,
                    cancelled
                });

            } catch (e) {
                console.error('Failed to load dropdown data:', e);
            }
        };
        load();
    }, []);

    // Filter doctors when a clinic is selected
    useEffect(() => {
        if (!filterClinic) {
            setAvailableDoctors(doctors);
            return;
        }

        const fetchClinicDoctors = async () => {
            try {
                const res = await scheduleApi.getSchedules({ ClinicId: Number(filterClinic), PageSize: 1000 });
                const rawList = (res as any)?.data?.data || (res as any)?.data?.items || (res as any)?.items || (Array.isArray((res as any)?.data) ? (res as any).data : []) || [];
                
                const doctorIds = new Set(rawList.map((s: any) => String(s.doctorId)));
                
                const filtered = doctors.filter(d => doctorIds.has(String(d.id)));
                setAvailableDoctors(filtered);

                // If currently selected doctor is not in the new list, reset it
                if (filterDoctor && !doctorIds.has(String(filterDoctor))) {
                    setFilterDoctor('');
                    setPage(1);
                }
            } catch (err) {
                console.error("Failed to fetch schedules for clinic:", err);
                setAvailableDoctors(doctors); // Fallback to all doctors
            }
        };

        fetchClinicDoctors();
    }, [filterClinic, doctors]);

    useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    const handleDeleteClick = (apt: Appointment) => {
        setCancelModalData(apt);
    };

    const executeDelete = async () => {
        if (!cancelModalData) return;
        try {
            await deleteAppointment(cancelModalData.id);
            setCancelModalData(null);
            fetchAppointments();
        } catch (err: any) {
            alert(err.message || 'Failed to delete appointment.');
        }
    };

    /* ─── render ─── */
    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#f8fafc] font-sans">
            <div className="max-w-[1400px] mx-auto space-y-6">

                {/* ── Header ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
                    <div>
                        <h1 className="text-[28px] font-extrabold text-slate-800 tracking-tight">Appointments</h1>
                        <p className="text-slate-500 text-[15px] mt-1">Manage and track all patient appointments</p>
                    </div>
                    <button 
                        onClick={() => navigate('/dashboard/appointments/new')}
                        className="bg-[#1A6FC4] hover:bg-[#155ba0] text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-colors shadow-sm"
                    >
                        <Plus size={18} strokeWidth={2.5} />
                        New Appointment
                    </button>
                </div>

                {/* ── Stats Cards ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                    {/* Total Appointments */}
                    <div className="bg-white rounded-[16px] border-l-4 border-l-blue-100 p-5 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center shrink-0">
                                <CalendarCheck size={20} strokeWidth={2.5} />
                            </div>
                            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 7L13.5 15.5L8.5 10.5L2 17"/><path d="M16 7H22V13"/></svg>
                                +12%
                            </span>
                        </div>
                        <p className="text-[13px] font-bold text-slate-500 mb-1">Total Appointments Today</p>
                        <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                            {loading ? '...' : String(stats.totalToday).padStart(2, '0')}
                        </h3>
                    </div>

                    {/* Waiting Patients */}
                    <div className="bg-white rounded-[16px] border-l-4 border-l-orange-100 p-5 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 bg-orange-50 text-orange-400 rounded-lg flex items-center justify-center shrink-0">
                                <Hourglass size={20} strokeWidth={2.5} />
                            </div>
                            <span className="text-xs font-bold text-red-500">
                                ! Urgent
                            </span>
                        </div>
                        <p className="text-[13px] font-bold text-slate-500 mb-1">Waiting Patients</p>
                        <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                            {loading ? '...' : String(stats.waiting).padStart(2, '0')}
                        </h3>
                    </div>

                    {/* Completed Today */}
                    <div className="bg-white rounded-[16px] border-l-4 border-l-emerald-100 p-5 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-lg flex items-center justify-center shrink-0">
                                <CheckCircle2 size={20} strokeWidth={2.5} />
                            </div>
                            <span className="text-xs font-bold text-slate-500">
                                Today
                            </span>
                        </div>
                        <p className="text-[13px] font-bold text-slate-500 mb-1">Completed Today</p>
                        <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                            {loading ? '...' : String(stats.completed).padStart(2, '0')}
                        </h3>
                    </div>

                    {/* Cancelled */}
                    <div className="bg-white rounded-[16px] border-l-4 border-l-red-100 p-5 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 bg-red-50 text-red-400 rounded-lg flex items-center justify-center shrink-0">
                                <XCircle size={20} strokeWidth={2.5} />
                            </div>
                            <span className="text-xs font-bold text-slate-500">
                                Today
                            </span>
                        </div>
                        <p className="text-[13px] font-bold text-slate-500 mb-1">Cancelled</p>
                        <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                            {loading ? '...' : String(stats.cancelled).padStart(2, '0')}
                        </h3>
                    </div>
                </div>

                {/* ── Filters ── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
                        {/* Doctor */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">DOCTOR</label>
                            <select value={filterDoctor} onChange={e => { setFilterDoctor(e.target.value); setPage(1); }}
                                className="w-full py-2.5 px-3 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#1A6FC4] bg-slate-50/50 appearance-none"
                                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em', paddingRight: '2.5rem' }}>
                                <option value="">All Doctors</option>
                                {availableDoctors.map((d: any) => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Clinic */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">CLINIC</label>
                            <select value={filterClinic} onChange={e => { setFilterClinic(e.target.value); setPage(1); }}
                                className="w-full py-2.5 px-3 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#1A6FC4] bg-slate-50/50 appearance-none"
                                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em', paddingRight: '2.5rem' }}>
                                <option value="">All Clinics</option>
                                {clinics.map((c: any) => (
                                    <option key={c.id} value={c.id}>{c.clinicNameEn || c.clinicNameAr || `Clinic #${c.id}`}</option>
                                ))}
                            </select>
                        </div>

                        {/* Date Range - From */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">FROM DATE</label>
                            <input type="date" value={filterFrom}
                                onChange={e => { setFilterFrom(e.target.value); setPage(1); }}
                                className="w-full py-2.5 px-3 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#1A6FC4] bg-slate-50/50" />
                        </div>
                        
                        {/* Date Range - To */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">TO DATE</label>
                            <input type="date" value={filterTo}
                                onChange={e => { setFilterTo(e.target.value); setPage(1); }}
                                className="w-full py-2.5 px-3 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#1A6FC4] bg-slate-50/50" />
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">STATUS</label>
                            <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
                                className="w-full py-2.5 px-3 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#1A6FC4] bg-slate-50/50 appearance-none"
                                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em', paddingRight: '2.5rem' }}>
                                {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <button className="flex-1 bg-[#1A6FC4] hover:bg-[#155ba0] text-white py-2.5 rounded-lg text-sm font-semibold transition-colors">
                                Apply Filters
                            </button>
                            <button 
                                onClick={() => {
                                    setFilterDoctor(''); setFilterClinic(''); setFilterStatus(''); setFilterFrom(''); setFilterTo(''); setPage(1);
                                }}
                                className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Table ── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mt-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#f8fafc] border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4">PATIENT NAME</th>
                                    <th className="px-6 py-4">DOCTOR</th>
                                    <th className="px-6 py-4">CLINIC</th>
                                    <th className="px-6 py-4">DATE & TIME</th>
                                    <th className="px-6 py-4">STATUS</th>
                                    <th className="px-6 py-4 text-center">ACTIONS</th>
                                    <th className="px-6 py-4 text-center">CREATE VISIT</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={8} className="py-20 text-center text-slate-400">
                                            <Loader2 className="animate-spin mx-auto mb-3 text-[#1A6FC4]" size={32} />
                                            <span className="text-sm font-medium">Loading appointments...</span>
                                        </td>
                                    </tr>
                                ) : appointments.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-20 text-center text-slate-400">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <CalendarCheck className="opacity-40" size={32} />
                                            </div>
                                            <p className="text-[15px] font-semibold text-slate-600">No appointments found</p>
                                            <p className="text-sm mt-1">Try adjusting your filters or create a new appointment.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    appointments.map((apt) => {
                                        const aptDateRaw = getAptDate(apt);
                                        const { date, time } = fmtDateTime(aptDateRaw);
                                        const foundDoctor = doctors.find(d => String(d.id) === String(apt.doctorId));
                                        const displayDoctorName = foundDoctor ? foundDoctor.name : (apt.doctorName || '—');

                                        return (
                                            <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors group">
                                                {/* ID */}
                                                <td className="px-6 py-4">
                                                    <span className="text-slate-300 font-semibold text-[13px]">
                                                        #{aptIdStr(apt.id)}
                                                    </span>
                                                </td>
                                                {/* Patient */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-blue-100 text-[#1A6FC4] flex items-center justify-center text-xs font-bold shrink-0 shadow-sm border border-white">
                                                            {apt.patientAvatar
                                                                ? <img src={apt.patientAvatar} className="w-9 h-9 rounded-full object-cover" alt="" />
                                                                : initials(apt.patientName || 'P')}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-slate-800 text-sm">{apt.patientName || '—'}</span>
                                                            <span className="text-[11px] text-slate-400 font-medium">File: F-{apt.patientId || '0000'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                {/* Doctor */}
                                                <td className="px-6 py-4 text-sm font-semibold text-slate-800">{displayDoctorName}</td>
                                                {/* Clinic */}
                                                <td className="px-6 py-4 text-sm font-semibold text-slate-600">
                                                    {apt.clinicName
                                                        ? <>{apt.clinicName}{apt.clinicWing ? `, ${apt.clinicWing}` : ''}</>
                                                        : '—'}
                                                </td>
                                                {/* Date/Time */}
                                                <td className="px-6 py-4">
                                                    <div className="text-[13px] font-semibold text-slate-700">{date}</div>
                                                    <div className="text-[12px] font-medium text-slate-400 mt-0.5">{time}</div>
                                                </td>
                                                {/* Status */}
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={apt.status} />
                                                </td>
                                                {/* Actions */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-3">
                                                        <button onClick={() => navigate(`/dashboard/appointments/edit/${apt.id}`)}
                                                            className="text-slate-400 hover:text-[#1A6FC4] transition-colors" title="Edit">
                                                            <Edit2 size={16} strokeWidth={2} />
                                                        </button>
                                                        <button onClick={() => handleDeleteClick(apt)}
                                                            className="text-slate-400 hover:text-red-500 transition-colors" title="Cancel/Block">
                                                            <Ban size={16} strokeWidth={2} />
                                                        </button>
                                                    </div>
                                                </td>
                                                {/* Create Visit */}
                                                <td className="px-6 py-4 text-center">
                                                    {(apt.status === 5 || String(apt.status).toLowerCase() === 'cancelled') ? (
                                                        <span className="text-slate-400 font-medium">—</span>
                                                    ) : (
                                                        <button className="bg-[#1A6FC4] hover:bg-[#155ba0] text-white text-[12px] font-bold px-4 py-1.5 rounded-md transition-colors shadow-sm w-full max-w-[80px]">
                                                            Create
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* ── Pagination ── */}
                    {!loading && appointments.length > 0 && (
                        <div className="px-6 py-4 bg-[#f8fafc] border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[13px] font-semibold text-slate-500">
                                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} results
                            </span>
                            <div className="flex items-center gap-1.5">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200 text-slate-400 disabled:opacity-40 transition-colors">
                                    <ChevronLeft size={16} strokeWidth={2.5} />
                                </button>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    const pg = i + 1;
                                    return (
                                        <button key={pg} onClick={() => setPage(pg)}
                                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-bold transition-all
                                                ${page === pg ? 'bg-[#1A6FC4] text-white shadow-sm' : 'hover:bg-slate-200 text-slate-500'}`}>
                                            {pg}
                                        </button>
                                    );
                                })}
                                {totalPages > 5 && <span className="text-slate-400 px-1 font-bold">…</span>}
                                {totalPages > 5 && (
                                    <button onClick={() => setPage(totalPages)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-bold transition-all
                                            ${page === totalPages ? 'bg-[#1A6FC4] text-white shadow-sm' : 'hover:bg-slate-200 text-slate-500'}`}>
                                        {totalPages}
                                    </button>
                                )}
                                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200 text-slate-400 disabled:opacity-40 transition-colors">
                                    <ChevronRight size={16} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Cancel Modal */}
            {cancelModalData && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md p-6 sm:p-8 transform transition-all animate-in fade-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-5 border border-red-100">
                            <XCircle className="text-red-500" size={24} strokeWidth={2.5} />
                        </div>
                        
                        <h2 className="text-xl font-extrabold text-slate-800 mb-2">Cancel Appointment?</h2>
                        <p className="text-[14px] text-slate-500 font-medium mb-6 leading-relaxed">
                            Are you sure you want to cancel this appointment? This action will remove the patient from the schedule and notify the assigned doctor.
                        </p>
                        
                        <div className="bg-[#f8fafc] rounded-2xl p-5 mb-8 border border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Appointment Details</span>
                                <span className="text-[11px] font-bold text-[#1A6FC4] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">#{aptIdStr(cancelModalData.id)}</span>
                            </div>
                            <div className="text-[15px] font-bold text-slate-800 mb-2">{cancelModalData.patientName || 'Unknown Patient'}</div>
                            <div className="flex items-center gap-2 text-[13px] font-medium text-slate-500">
                                <CalendarCheck size={14} className="text-slate-400" />
                                <span>
                                    {fmtDateTime(getAptDate(cancelModalData)).date} at {fmtDateTime(getAptDate(cancelModalData)).time}
                                </span>
                            </div>
                        </div>
                        
                        <div className="flex flex-col-reverse sm:flex-row items-center gap-3">
                            <button 
                                onClick={() => setCancelModalData(null)}
                                className="w-full sm:w-1/2 py-3 text-sm font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-colors"
                            >
                                No, Keep Appointment
                            </button>
                            <button 
                                onClick={executeDelete}
                                className="w-full sm:w-1/2 py-3 bg-[#1A6FC4] hover:bg-[#155ba0] text-white text-sm font-bold rounded-xl shadow-sm hover:shadow-md transition-all flex justify-center items-center gap-2"
                            >
                                Yes, Cancel Appointment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppointmentManagementPage;

