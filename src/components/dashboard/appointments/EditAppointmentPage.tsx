import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight, User, Stethoscope, Building2, Calendar as CalendarIcon, Clock, Lock, FileText, Loader2 } from 'lucide-react';
import { getAppointmentDetails, updateAppointment, listAppointments } from '../../../api/appointments';
import { patientApi } from '../../../api/patient';
import { getClinics } from '../../../api/clinics';
import { scheduleApi } from '../../../api/schedules';

// Helper to format slot (e.g. "09:00:00" -> "09:00 AM")
function formatSlot(timeStr: string): string {
    if (!timeStr) return '';
    // If it's a full ISO string, extract the time part
    const actualTime = timeStr.includes('T') ? timeStr.split('T')[1] : timeStr;
    try {
        const parts = actualTime.split(':');
        if (parts.length < 2) return timeStr;
        const h = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        if (isNaN(h) || isNaN(m)) return timeStr;
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hour = h % 12 || 12;
        return `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
    } catch {
        return timeStr;
    }
}

const APPOINTMENT_TYPES = [
    { value: 1, label: 'Consultation' },
    { value: 2, label: 'Follow-up' },
    { value: 3, label: 'Emergency' },
    { value: 4, label: 'Check-up' },
];

const EditAppointmentPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const passedApt = location.state?.appointment;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Data sources
    const [doctors, setDoctors] = useState<any[]>([]);
    const [clinics, setClinics] = useState<any[]>([]);
    const [patients, setPatients] = useState<any[]>([]);
    const [loadingDoctors, setLoadingDoctors] = useState(false);
    const [noDoctorsForClinic, setNoDoctorsForClinic] = useState(false);

    // Form state
    const [patientId, setPatientId] = useState('');
    const [doctorId, setDoctorId] = useState('');
    const [clinicId, setClinicId] = useState('');
    const [date, setDate] = useState('');
    const [timeSlot, setTimeSlot] = useState('');
    const [notes, setNotes] = useState('');
    const [appointmentType, setAppointmentType] = useState<number>(1);
    const [timeSlots, setTimeSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    useEffect(() => {
        const loadAll = async () => {
            setLoading(true);
            try {
                const [clinicRes, ptRes, aptRes] = await Promise.all([
                    getClinics({ PageIndex: 0, PageSize: 100 }),
                    patientApi.getPatients({ PageIndex: 0, PageSize: 100 }),
                    id ? (passedApt ? Promise.resolve(passedApt) : getAppointmentDetails(id).catch(async (e) => {
                        console.warn("Details fetch failed, falling back to list", e);
                        try {
                            const res = await listAppointments({ PageSize: 1000 });
                            const list = (res as any)?.data?.data || (res as any)?.data?.items || (res as any)?.data || (res as any)?.appointments || [];
                            const arr = Array.isArray(list) ? list : (Array.isArray((res as any)?.items) ? (res as any).items : []);
                            const found = arr.find((a: any) => String(a.id) === String(id));
                            return found || null;
                        } catch (err) {
                            return null;
                        }
                    })) : Promise.resolve(null),
                ]);

                const rawClinic: any = clinicRes;
                const clinicList =
                    rawClinic?.data?.data ??
                    rawClinic?.data?.items ??
                    rawClinic?.data?.clinics ??
                    (Array.isArray(rawClinic?.data) ? rawClinic.data : null) ??
                    rawClinic?.items ??
                    rawClinic?.clinics ??
                    (Array.isArray(rawClinic) ? rawClinic : []);
                setClinics(Array.isArray(clinicList) ? clinicList : []);

                const ptList = (ptRes as any)?.patients ?? (ptRes as any)?.items ?? (Array.isArray(ptRes) ? ptRes : []);
                setPatients(ptList);

                const apt = aptRes?.data?.data ?? aptRes?.data ?? aptRes;
                console.log("Fetched appointment details:", apt);
                if (apt) {
                    const resolvedClinicId = apt.clinicId?.toString() || apt.ClinicId?.toString() || apt.clinic?.id?.toString() || '';
                    setPatientId(apt.patientId?.toString() || apt.PatientId?.toString() || apt.patient?.id?.toString() || '');
                    setDoctorId(apt.doctorId?.toString() || apt.DoctorId?.toString() || apt.doctor?.id?.toString() || '');
                    setClinicId(resolvedClinicId);
                    setNotes(apt.notes || apt.Notes || '');
                    setAppointmentType(apt.appointmentType || apt.AppointmentType || 1);

                    const rawDate = apt.appointmentDate || apt.AppointmentDate || apt.dateTime || apt.DateTime || apt.date || apt.Date || apt.appointmentDateTime || apt.AppointmentDateTime || apt.scheduledDate || apt.ScheduledDate;
                    if (rawDate) {
                        if (rawDate.includes('T')) {
                            const [dPart, tPart] = rawDate.split('T');
                            setDate(dPart);
                            const cleanTime = tPart.split('.')[0]; // e.g. "09:00:00"
                            setTimeSlot(cleanTime);
                        } else {
                            const d = new Date(rawDate);
                            if (!isNaN(d.getTime())) {
                                setDate(d.toISOString().split('T')[0]); // YYYY-MM-DD
                                const hours = d.getHours().toString().padStart(2, '0');
                                const minutes = d.getMinutes().toString().padStart(2, '0');
                                const seconds = d.getSeconds().toString().padStart(2, '0');
                                setTimeSlot(`${hours}:${minutes}:${seconds}`);
                            }
                        }
                    }
                }
            } catch (err) {
                console.error('Failed to load edit page data', err);
            } finally {
                setLoading(false);
            }
        };
        loadAll();
    }, [id]);

    const fetchSlots = useCallback(async () => {
        if (!doctorId || !date) {
            setTimeSlots([]);
            return;
        }
        setLoadingSlots(true);
        try {
            const res = await scheduleApi.getAvailableSlots({
                DoctorId: Number(doctorId),
                ClinicId: clinicId ? Number(clinicId) : undefined,
                Date: date,
            });
            const raw = (res as any);
            let slots: string[] =
                raw?.data?.slots ??
                raw?.data?.availableSlots ??
                (Array.isArray(raw?.data) ? raw.data : null) ??
                raw?.slots ??
                [];

            if (slots.length > 0 && typeof slots[0] === 'object') {
                slots = (slots as any[]).map((s: any) => {
                    const val = s.slotStart ?? s.startTime ?? s.time ?? JSON.stringify(s);
                    // Extract HH:mm:ss if it's a full ISO string
                    return val.includes('T') ? val.split('T')[1].split('.')[0] : val;
                });
            } else if (slots.length > 0 && typeof slots[0] === 'string') {
                slots = slots.map(s => s.includes('T') ? s.split('T')[1].split('.')[0] : s);
            }

            setTimeSlots(slots.length > 0 ? slots : []);
        } catch (e) {
            console.error('Failed to fetch available slots:', e);
            setTimeSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    }, [doctorId, clinicId, date]);

    useEffect(() => {
        fetchSlots();
    }, [fetchSlots]);

    /* ── Load doctors for selected clinic via /Patient/Doctors?Clinic= ── */
    useEffect(() => {
        if (!clinicId) {
            setDoctors([]);
            setNoDoctorsForClinic(false);
            return;
        }
        const fetchClinicDoctors = async () => {
            setLoadingDoctors(true);
            setNoDoctorsForClinic(false);
            try {
                const list = await patientApi.getDoctorsByClinic(Number(clinicId));
                let mapped = list.map((d: any) => ({ id: String(d.id), name: d.name }));
                
                try {
                    const schedulesRes = await scheduleApi.getSchedules({ ClinicId: Number(clinicId), PageSize: 1000 });
                    const rawSchedules = (schedulesRes as any)?.data?.data ?? (schedulesRes as any)?.data?.items ?? (schedulesRes as any)?.data ?? [];
                    const scheduleList = Array.isArray(rawSchedules) ? rawSchedules : [];
                    
                    const doctorsWithSchedules = new Set<string>();
                    scheduleList.forEach((s: any) => {
                        const dId = s.doctorId ?? s.DoctorId;
                        if (dId) doctorsWithSchedules.add(String(dId));
                    });
                    
                    mapped = mapped.filter((d: any) => doctorsWithSchedules.has(d.id));
                } catch (err) {
                    console.warn('Failed to fetch schedules to filter doctors:', err);
                }

                setDoctors(mapped);
                setNoDoctorsForClinic(mapped.length === 0);
                // Clear doctor selection if not in new list
                setDoctorId(prev => {
                    if (prev && !mapped.find((d: any) => d.id === prev)) return '';
                    return prev;
                });
            } catch {
                setDoctors([]);
                setNoDoctorsForClinic(true);
            } finally {
                setLoadingDoctors(false);
            }
        };
        fetchClinicDoctors();
    }, [clinicId]);

    const handleSave = async () => {
        if (!id) return;
        setSaving(true);
        try {
            let appointmentDate = date;
            if (timeSlot) {
                // Ensure timeSlot is in HH:mm:ss format
                const timePart = timeSlot.split(':').length === 2 ? `${timeSlot}:00` : timeSlot;
                appointmentDate = `${date}T${timePart}`;
            } else {
                appointmentDate = `${date}T00:00:00`;
            }

            const payload = {
                patientId: Number(patientId),
                doctorId: Number(doctorId),
                clinicId: clinicId ? Number(clinicId) : undefined,
                appointmentDate: appointmentDate,
                appointmentType: appointmentType,
                notes: notes,
            };

            await updateAppointment(id, payload);
            navigate('/dashboard/appointments');
        } catch (error) {
            console.error('Failed to update appointment', error);
            alert('Failed to update appointment');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-[#1A6FC4]" />
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto bg-slate-50/50 font-sans h-full">
            <div className="max-w-[1200px] mx-auto p-6 space-y-6 pb-24">
                
                {/* Header */}
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-2">
                    <span className="text-slate-900 cursor-pointer hover:text-[#1A6FC4]" onClick={() => navigate('/dashboard/appointments')}>Appointments Management</span>
                    <ChevronRight size={14} className="text-slate-400" />
                    <span className="text-[#1A6FC4]">EDIT APPOINTMENT</span>
                </div>
                
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Edit Appointmentt</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Refine scheduling details for patient consultation.</p>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Left Column: Clinical Staff & Patient */}
                    <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100/60">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1A6FC4] flex items-center justify-center">
                                <User size={20} className="fill-current" />
                            </div>
                            <h2 className="text-base font-bold text-slate-800">Clinical Staff & Patient</h2>
                        </div>

                        <div className="space-y-5">
                            {/* Patient */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5">Patient Search</label>
                                <div className="relative">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                        <User size={16} />
                                    </div>
                                    <select 
                                        value={patientId} onChange={e => setPatientId(e.target.value)}
                                        className="w-full pl-10 pr-16 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1A6FC4] appearance-none"
                                    >
                                        <option value="">Select patient...</option>
                                        {patients.map(p => <option key={p.id} value={p.id}>{p.fullNameEnglish || p.name || `Patient #${p.id}`}</option>)}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <span className="bg-[#E0F2FE] text-[#0284C7] text-[10px] font-bold px-2 py-1 rounded">VERIFIED</span>
                                    </div>
                                </div>
                            </div>

                            {/* Clinic */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5">Location / Clinic</label>
                                <div className="relative">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                        <Building2 size={16} />
                                    </div>
                                    <select 
                                        value={clinicId} onChange={e => setClinicId(e.target.value)}
                                        className="w-full pl-10 pr-10 py-3 bg-slate-100 border border-transparent rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1A6FC4] appearance-none"
                                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em' }}
                                    >
                                        <option value="">Select location...</option>
                                        {clinics.map(c => <option key={c.id} value={c.id}>{c.clinicNameEn || c.clinicNameAr || `Clinic #${c.id}`}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Doctor */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5">
                                    Assigned Doctor
                                    {loadingDoctors && <Loader2 size={12} className="inline ml-2 animate-spin text-slate-400" />}
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                        <Stethoscope size={16} />
                                    </div>
                                    <select 
                                        value={doctorId} onChange={e => setDoctorId(e.target.value)}
                                        className="w-full pl-10 pr-10 py-3 bg-slate-100 border border-transparent rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1A6FC4] appearance-none"
                                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em' }}
                                    >
                                        <option value="">Select doctor...</option>
                                        {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </div>
                                {!clinicId && (
                                    <p className="text-[11px] text-slate-400 mt-1 font-medium italic">Select a clinic first to see available doctors.</p>
                                )}
                                {clinicId && noDoctorsForClinic && !loadingDoctors && (
                                    <p className="text-[11px] text-amber-600 mt-1 font-medium">No doctors assigned to this clinic.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Scheduling Details */}
                    <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100/60">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
                                <CalendarIcon size={20} className="fill-current text-slate-400 opacity-20" />
                            </div>
                            <h2 className="text-base font-bold text-slate-800">Scheduling Details</h2>
                        </div>

                        <div className="space-y-6">
                            {/* Date */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2">Appointment Date</label>
                                <div className="relative border-b-2 border-slate-200 focus-within:border-[#1A6FC4] transition-colors pb-2 flex items-center gap-2">
                                    <CalendarIcon size={18} className="text-slate-400" />
                                    <input 
                                        type="date" 
                                        value={date} onChange={e => setDate(e.target.value)}
                                        className="w-full bg-transparent text-sm font-medium text-slate-700 focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Time Slots */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-3">
                                    Available Slots
                                    {loadingSlots && <Loader2 size={12} className="inline ml-2 animate-spin text-slate-400" />}
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {loadingSlots ? (
                                        <div className="col-span-3 flex items-center gap-2 text-slate-400 py-2">
                                            <span className="text-[12px] font-medium">Loading slots...</span>
                                        </div>
                                    ) : timeSlots.length === 0 && !timeSlot ? (
                                        <p className="col-span-3 text-[12px] text-amber-600 font-medium italic py-2 bg-amber-50 rounded-xl px-3 border border-amber-100">
                                            No available slots for this day.
                                        </p>
                                    ) : (
                                        Array.from(new Set(timeSlot ? [timeSlot, ...timeSlots] : timeSlots)).map((slot) => {
                                            const isSelected = timeSlot === slot;
                                            return (
                                                <button
                                                    key={slot}
                                                    onClick={() => setTimeSlot(slot)}
                                                    className={`
                                                        py-2.5 rounded-lg text-xs font-bold transition-all
                                                        ${isSelected 
                                                            ? 'bg-[#1A6FC4] text-white shadow-md border-2 border-blue-200 ring-2 ring-[#1A6FC4] ring-offset-1' 
                                                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-2 border-transparent'}
                                                    `}
                                                >
                                                    {formatSlot(slot)}
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Consultation Type */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5">Consultation Type</label>
                                <div className="relative">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                        <FileText size={16} />
                                    </div>
                                    <select 
                                        value={appointmentType}
                                        onChange={e => setAppointmentType(Number(e.target.value))}
                                        className="w-full pl-10 pr-10 py-3 bg-slate-100 border border-transparent rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1A6FC4] appearance-none"
                                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em' }}
                                    >
                                        {APPOINTMENT_TYPES.map(t => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Full Width: Clinical Notes */}
                    <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100/60 mt-2">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
                                <FileText size={20} className="fill-current text-slate-400 opacity-20" />
                            </div>
                            <h2 className="text-base font-bold text-slate-800">Internal Clinical Notes</h2>
                        </div>
                        
                        <div className="relative">
                            <textarea 
                                value={notes} onChange={e => setNotes(e.target.value)}
                                className="w-full h-32 bg-[#E2E8F0]/50 rounded-xl p-4 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-[#1A6FC4]/20 focus:bg-white transition-colors"
                                placeholder="Add clinical notes..."
                            />
                            <div className="absolute bottom-3 right-4 flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                <Lock size={12} />
                                ENCRYPTED DATA
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="fixed bottom-0 left-0 md:left-[100px] right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 p-4 z-10 flex items-center justify-between px-6 lg:px-12">
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium hidden sm:flex">
                        <Clock size={14} />
                        Last modified by Admin on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                    </div>
                    
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                        <button 
                            onClick={() => navigate('/dashboard/appointments')}
                            className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            Cancel Changes
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-[#0D4A8A] hover:bg-[#0b3c73] text-white px-8 py-2.5 rounded-lg text-sm font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {saving && <Loader2 size={16} className="animate-spin" />}
                            Update Appointment
                        </button>
                    </div>
                </div>
                
            </div>
        </div>
    );
};

export default EditAppointmentPage;
