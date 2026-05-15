import React, { useEffect, useState, useCallback } from 'react';
import {
    Search, ChevronRight, Loader2, CalendarDays, Clock,
    User, Stethoscope, Building2, ClipboardList, CheckCircle2, ChevronDown, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { bookAppointment } from '../../../api/appointments';
import { getClinics } from '../../../api/clinics';
import { patientApi } from '../../../api/patient';
import { scheduleApi } from '../../../api/schedules';

/* ─── Types ─── */
interface PatientOption {
    id: string;
    name: string;
    fileNumber?: string;
}

interface DoctorOption {
    id: string;
    name: string;
}

interface ClinicOption {
    id: number;
    name: string;
}

const APPOINTMENT_TYPES = [
    { value: 1, label: 'Consultation' },
    { value: 2, label: 'Follow-up' },
    { value: 3, label: 'Emergency' },
    { value: 4, label: 'Check-up' },
];

/* ─── Helpers ─── */
function formatSlot(timeStr: string): string {
    if (!timeStr) return '';
    try {
        const [h, m] = timeStr.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hour = h % 12 || 12;
        return `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
    } catch {
        return timeStr;
    }
}

/* ─── Component ─── */
const NewAppointmentPage: React.FC = () => {
    const navigate = useNavigate();

    // Form state
    const [patientSearch, setPatientSearch] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<PatientOption | null>(null);
    const [selectedClinic, setSelectedClinic] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedSlot, setSelectedSlot] = useState('');
    const [appointmentType, setAppointmentType] = useState<number>(1);
    const [notes, setNotes] = useState('');

    // Lists
    const [clinics, setClinics] = useState<ClinicOption[]>([]);
    const [availableDoctors, setAvailableDoctors] = useState<DoctorOption[]>([]);
    const [patientResults, setPatientResults] = useState<PatientOption[]>([]);
    const [timeSlots, setTimeSlots] = useState<string[]>([]);

    // Loading / UI state
    const [loadingInit, setLoadingInit] = useState(true);
    const [loadingPatients, setLoadingPatients] = useState(false);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [loadingDoctors, setLoadingDoctors] = useState(false);
    const [noDoctorsForClinic, setNoDoctorsForClinic] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showPatientDropdown, setShowPatientDropdown] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    /* ── Load clinics on mount ── */
    useEffect(() => {
        const init = async () => {
            setLoadingInit(true);
            try {
                const clinicRes = await getClinics({ PageSize: 100 });
                const rawClinic: any = clinicRes;
                const clinicsArr =
                    rawClinic?.data?.data ??
                    rawClinic?.data?.items ??
                    rawClinic?.data?.clinics ??
                    (Array.isArray(rawClinic?.data) ? rawClinic.data : null) ??
                    rawClinic?.items ??
                    rawClinic?.clinics ??
                    (Array.isArray(rawClinic) ? rawClinic : []);
                const clinicList: ClinicOption[] = clinicsArr.map((c: any) => ({
                    id: c.id,
                    name: c.clinicNameEn || c.clinicNameAr || `Clinic #${c.id}`,
                }));
                setClinics(clinicList);
            } catch (e) {
                console.error('Failed to load clinics:', e);
            } finally {
                setLoadingInit(false);
            }
        };
        init();
    }, []);

    /* ── Patient search ── */
    useEffect(() => {
        if (!patientSearch.trim()) {
            setPatientResults([]);
            setShowPatientDropdown(false);
            return;
        }
        const timeout = setTimeout(async () => {
            setLoadingPatients(true);
            try {
                const res = await patientApi.getPatients({ SearchKey: patientSearch, PageSize: 10 });
                const list = (res as any)?.patients ?? (res as any)?.items ?? (res as any)?.data ?? [];
                setPatientResults(list.map((p: any) => ({
                    id: String(p.id || p.patientId || p.Id),
                    name: p.name || p.fullNameEnglish || 'Unknown',
                    fileNumber: p.fileNumber || p.patientId || p.id,
                })));
                setShowPatientDropdown(true);
            } catch (e) {
                console.error('Patient search failed:', e);
            } finally {
                setLoadingPatients(false);
            }
        }, 350);
        return () => clearTimeout(timeout);
    }, [patientSearch]);

    /* ── Load doctors for selected clinic via /Patient/Doctors?Clinic= ── */
    useEffect(() => {
        if (!selectedClinic) {
            setAvailableDoctors([]);
            setNoDoctorsForClinic(false);
            return;
        }
        const fetchClinicDoctors = async () => {
            setLoadingDoctors(true);
            setNoDoctorsForClinic(false);
            try {
                const list = await patientApi.getDoctorsByClinic(Number(selectedClinic));
                let mapped: DoctorOption[] = list.map((d: any) => ({ id: String(d.id), name: d.name }));
                
                try {
                    const schedulesRes = await scheduleApi.getSchedules({ ClinicId: Number(selectedClinic), PageSize: 1000 });
                    const rawSchedules = (schedulesRes as any)?.data?.data ?? (schedulesRes as any)?.data?.items ?? (schedulesRes as any)?.data ?? [];
                    const scheduleList = Array.isArray(rawSchedules) ? rawSchedules : [];
                    
                    const doctorsWithSchedules = new Set<string>();
                    scheduleList.forEach((s: any) => {
                        const dId = s.doctorId ?? s.DoctorId;
                        if (dId) doctorsWithSchedules.add(String(dId));
                    });
                    
                    mapped = mapped.filter(d => doctorsWithSchedules.has(d.id));
                } catch (err) {
                    console.warn('Failed to fetch schedules to filter doctors:', err);
                }

                setAvailableDoctors(mapped);
                setNoDoctorsForClinic(mapped.length === 0);
                // Reset doctor if not in new list
                if (selectedDoctor && !mapped.find(d => d.id === selectedDoctor)) {
                    setSelectedDoctor('');
                }
            } catch {
                setAvailableDoctors([]);
                setNoDoctorsForClinic(true);
            } finally {
                setLoadingDoctors(false);
            }
        };
        fetchClinicDoctors();
    }, [selectedClinic]);

    /* ── Fetch available time slots when doctor + clinic + date are chosen ── */
    const fetchSlots = useCallback(async () => {
        if (!selectedDoctor || !selectedDate) {
            setTimeSlots([]);
            setSelectedSlot('');
            return;
        }
        setLoadingSlots(true);
        try {
            const res = await scheduleApi.getAvailableSlots({
                DoctorId: Number(selectedDoctor),
                ClinicId: selectedClinic ? Number(selectedClinic) : undefined,
                Date: selectedDate,
            });
            const raw = (res as any);
            // Try various shapes the backend might return
            let slots: string[] =
                raw?.data?.slots ??
                raw?.data?.availableSlots ??
                (Array.isArray(raw?.data) ? raw.data : null) ??
                raw?.slots ??
                [];

            // If backend returns objects {startTime, endTime}, map to start time strings
            if (slots.length > 0 && typeof slots[0] === 'object') {
                slots = (slots as any[]).map((s: any) => s.startTime ?? s.time ?? JSON.stringify(s));
            }

            setTimeSlots(slots.length > 0 ? slots : []);
        } catch (e) {
            console.error('Failed to fetch available slots:', e);
            setTimeSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    }, [selectedDoctor, selectedClinic, selectedDate]);

    useEffect(() => {
        fetchSlots();
        setSelectedSlot(''); // reset slot when inputs change
    }, [fetchSlots]);

    /* ── Submit ── */
    const handleSubmit = async () => {
        setError('');
        if (!selectedPatient && !patientSearch) { setError('Please select a patient.'); return; }
        if (!selectedDoctor) { setError('Please select a doctor.'); return; }
        if (!selectedClinic) { setError('Please select a clinic.'); return; }
        if (!selectedDate) { setError('Please select an appointment date.'); return; }

        // Build ISO date-time
        let appointmentDate = selectedDate;
        if (selectedSlot) {
            appointmentDate = `${selectedDate}T${selectedSlot}`;
        } else {
            appointmentDate = `${selectedDate}T00:00:00`;
        }

        const fileNumber = selectedPatient?.fileNumber?.toString() || selectedPatient?.id?.toString() || patientSearch;

        try {
            setSubmitting(true);
            await bookAppointment({
                doctorId: Number(selectedDoctor),
                clinicId: Number(selectedClinic),
                appointmentDate,
                appointmentType,
                notes: notes || undefined,
                fileNumber,
            });
            setSuccess(true);
            setTimeout(() => navigate('/dashboard/appointments'), 1500);
        } catch (err: any) {
            setError(err.message || 'Failed to create appointment. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    /* ── Render ── */
    if (loadingInit) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen bg-[#f8fafc]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-[#1A6FC4]" size={40} />
                    <p className="text-slate-500 font-medium text-sm">Loading form data...</p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen bg-[#f8fafc]">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100">
                        <CheckCircle2 className="text-emerald-500" size={32} />
                    </div>
                    <h2 className="text-xl font-extrabold text-slate-800">Appointment Created!</h2>
                    <p className="text-slate-500 text-sm">Redirecting to appointments list...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 min-h-screen bg-[#f8fafc] font-sans overflow-y-auto">

            {/* ── Breadcrumb header ── */}
            <div className="bg-white border-b border-slate-100 px-6 py-3 flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest sticky top-0 z-20 shadow-sm">
                <span
                    className="text-[#1A6FC4] cursor-pointer hover:underline"
                    onClick={() => navigate('/dashboard/appointments')}
                >
                    Appointments
                </span>
                <ChevronRight size={13} />
                <span className="text-slate-600">New Appointment</span>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

                {/* ── Page title ── */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-[26px] font-extrabold text-slate-800 tracking-tight">New Appointment</h1>
                        <p className="text-slate-500 text-[14px] mt-0.5">Schedule a new clinical visit for a patient</p>
                    </div>
                    <span className="flex items-center gap-2 text-[12px] font-bold text-[#1A6FC4] bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
                        <span className="w-2 h-2 bg-[#1A6FC4] rounded-full inline-block"></span>
                        Status: Scheduled
                    </span>
                </div>

                {/* ── Error Banner ── */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-semibold px-5 py-3 rounded-xl flex items-center gap-3">
                        <X size={16} className="shrink-0" />
                        {error}
                    </div>
                )}

                {/* ── Form Card ── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-7">

                        {/* ── LEFT COLUMN ── */}
                        <div className="space-y-7">

                            {/* Patient */}
                            <div>
                                <label className="flex items-center gap-2 text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    <User size={13} className="text-[#1A6FC4]" />
                                    Patient
                                </label>
                                <div className="relative">
                                    {selectedPatient ? (
                                        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">{selectedPatient.name}</p>
                                                {selectedPatient.fileNumber && (
                                                    <p className="text-[11px] text-slate-500 font-medium">File: F-{selectedPatient.fileNumber}</p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => { setSelectedPatient(null); setPatientSearch(''); }}
                                                className="text-slate-400 hover:text-red-500 transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder="Search patient name or file number..."
                                                    value={patientSearch}
                                                    onChange={e => setPatientSearch(e.target.value)}
                                                    onFocus={() => patientResults.length > 0 && setShowPatientDropdown(true)}
                                                    onBlur={() => setTimeout(() => setShowPatientDropdown(false), 200)}
                                                    className="w-full py-3 pl-11 pr-4 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1A6FC4]/20 focus:border-[#1A6FC4] transition-all placeholder-slate-400"
                                                />
                                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                                    {loadingPatients ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                                                </div>
                                            </div>
                                            {showPatientDropdown && patientResults.length > 0 && (
                                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-30 overflow-hidden">
                                                    {patientResults.map(p => (
                                                        <button
                                                            key={p.id}
                                                            onMouseDown={() => { setSelectedPatient(p); setPatientSearch(p.name); setShowPatientDropdown(false); }}
                                                            className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-0"
                                                        >
                                                            <p className="text-sm font-bold text-slate-800">{p.name}</p>
                                                            {p.fileNumber && <p className="text-[11px] text-slate-500 font-medium">File: F-{p.fileNumber}</p>}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Clinic */}
                            <div>
                                <label className="flex items-center gap-2 text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    <Building2 size={13} className="text-[#1A6FC4]" />
                                    Clinic
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedClinic}
                                        onChange={e => { setSelectedClinic(e.target.value); setSelectedSlot(''); }}
                                        className="w-full py-3 px-4 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1A6FC4]/20 focus:border-[#1A6FC4] appearance-none transition-all"
                                    >
                                        <option value="">Select Clinic Location</option>
                                        {clinics.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Doctor */}
                            <div>
                                <label className="flex items-center gap-2 text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    <Stethoscope size={13} className="text-[#1A6FC4]" />
                                    Doctor
                                    {loadingDoctors && <Loader2 size={12} className="animate-spin text-slate-400" />}
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedDoctor}
                                        onChange={e => setSelectedDoctor(e.target.value)}
                                        className="w-full py-3 px-4 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1A6FC4]/20 focus:border-[#1A6FC4] appearance-none transition-all"
                                    >
                                        <option value="">Select Practitioner</option>
                                        {availableDoctors.map(d => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                                {!selectedClinic && (
                                    <p className="text-[11px] text-slate-400 mt-1 font-medium italic">Select a clinic first to see available doctors.</p>
                                )}
                                {selectedClinic && noDoctorsForClinic && !loadingDoctors && (
                                    <p className="text-[11px] text-amber-600 mt-1 font-medium">No doctors assigned to this clinic.</p>
                                )}
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="flex items-center gap-2 text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    <ClipboardList size={13} className="text-[#1A6FC4]" />
                                    Clinical &amp; Administrative Notes
                                </label>
                                <textarea
                                    rows={5}
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    placeholder="Enter clinical details, reason for visit, or administrative instructions..."
                                    className="w-full py-3 px-4 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1A6FC4]/20 focus:border-[#1A6FC4] transition-all resize-none placeholder-slate-400"
                                />
                            </div>
                        </div>

                        {/* ── RIGHT COLUMN ── */}
                        <div className="space-y-7">

                            {/* Appointment Date */}
                            <div>
                                <label className="flex items-center gap-2 text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    <CalendarDays size={13} className="text-[#1A6FC4]" />
                                    Appointment Date
                                </label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={e => { setSelectedDate(e.target.value); setSelectedSlot(''); }}
                                    className="w-full py-3 px-4 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1A6FC4]/20 focus:border-[#1A6FC4] transition-all"
                                />
                            </div>

                            {/* Available Time Slots */}
                            <div>
                                <label className="flex items-center gap-2 text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                                    <Clock size={13} className="text-[#1A6FC4]" />
                                    Available Time Slots
                                    {loadingSlots && <Loader2 size={12} className="animate-spin text-slate-400" />}
                                </label>

                                {!selectedDoctor || !selectedDate ? (
                                    <p className="text-[12px] text-slate-400 font-medium italic py-3">
                                        Select a doctor and date to see available time slots.
                                    </p>
                                ) : loadingSlots ? (
                                    <div className="flex items-center gap-2 text-slate-400 py-3">
                                        <Loader2 size={14} className="animate-spin" />
                                        <span className="text-[12px] font-medium">Loading slots...</span>
                                    </div>
                                ) : timeSlots.length === 0 ? (
                                    <p className="text-[12px] text-amber-600 font-medium italic py-3 bg-amber-50 rounded-xl px-4 border border-amber-100">
                                        No available slots for this day. Try a different date.
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-3 gap-2">
                                        {timeSlots.map(slot => (
                                            <button
                                                key={slot}
                                                onClick={() => setSelectedSlot(slot)}
                                                className={`py-2.5 px-2 text-[12px] font-bold rounded-xl border transition-all ${
                                                    selectedSlot === slot
                                                        ? 'bg-[#1A6FC4] text-white border-[#1A6FC4] shadow-sm shadow-blue-200'
                                                        : 'bg-white text-slate-600 border-slate-200 hover:border-[#1A6FC4] hover:text-[#1A6FC4] hover:bg-blue-50'
                                                }`}
                                            >
                                                {formatSlot(slot)}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Appointment Type */}
                            <div>
                                <label className="flex items-center gap-2 text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    <ClipboardList size={13} className="text-[#1A6FC4]" />
                                    Appointment Type
                                </label>
                                <div className="relative">
                                    <select
                                        value={appointmentType}
                                        onChange={e => setAppointmentType(Number(e.target.value))}
                                        className="w-full py-3 px-4 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1A6FC4]/20 focus:border-[#1A6FC4] appearance-none transition-all"
                                    >
                                        {APPOINTMENT_TYPES.map(t => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Footer Actions ── */}
                    <div className="flex items-center justify-end gap-4 mt-10 pt-6 border-t border-slate-100">
                        <button
                            onClick={() => navigate('/dashboard/appointments')}
                            className="px-6 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="px-7 py-2.5 bg-[#1A6FC4] hover:bg-[#155ba0] text-white text-sm font-bold rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 size={15} className="animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 size={15} />
                                    Create Appointment
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewAppointmentPage;
