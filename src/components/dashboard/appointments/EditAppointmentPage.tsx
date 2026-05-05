// EditAppointmentPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, User, Stethoscope, Building2, Calendar as CalendarIcon, Clock, Lock, FileText, Loader2 } from 'lucide-react';
import { getAppointmentDetails, updateAppointment } from '../../../api/appointments';
import { patientApi } from '../../../api/patient';
import { getClinics } from '../../../api/clinics';
import { staffApi } from '../../../api/staff';

// Static slots for the demo (matching screenshot)
const TIME_SLOTS = ['09:00 AM', '10:30 AM', '11:45 AM', '01:15 PM', '03:00 PM', '04:30 PM'];

const EditAppointmentPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Data sources
    const [doctors, setDoctors] = useState<any[]>([]);
    const [clinics, setClinics] = useState<any[]>([]);
    const [patients, setPatients] = useState<any[]>([]);

    // Form state
    const [patientId, setPatientId] = useState('');
    const [doctorId, setDoctorId] = useState('');
    const [clinicId, setClinicId] = useState('');
    const [date, setDate] = useState('');
    const [timeSlot, setTimeSlot] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        const loadAll = async () => {
            setLoading(true);
            try {
                const [drRes, clinicRes, ptRes, aptRes] = await Promise.all([
                    staffApi.getStaffs({ PageIndex: 0, PageSize: 100 }),
                    getClinics({ PageIndex: 0, PageSize: 100 }),
                    patientApi.getPatients({ PageIndex: 0, PageSize: 100 }),
                    id ? getAppointmentDetails(id) : Promise.resolve(null),
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

                const clinicList = (clinicRes as any)?.data?.data ?? (clinicRes as any)?.data?.items ?? (Array.isArray((clinicRes as any)?.data) ? (clinicRes as any).data : []);
                setClinics(clinicList);

                const ptList = (ptRes as any)?.patients ?? (ptRes as any)?.items ?? (Array.isArray(ptRes) ? ptRes : []);
                setPatients(ptList);

                const apt = aptRes?.data ?? aptRes;
                if (apt) {
                    setPatientId(apt.patientId?.toString() || '');
                    setDoctorId(apt.doctorId?.toString() || '');
                    setClinicId(apt.clinicId?.toString() || '');
                    setNotes(apt.notes || '');

                    if (apt.appointmentDate || apt.dateTime) {
                        const rawDate = apt.appointmentDate || apt.dateTime;
                        const d = new Date(rawDate);
                        setDate(d.toISOString().split('T')[0]); // YYYY-MM-DD
                        
                        // Parse time for the time slot selection
                        const hours = d.getHours();
                        const minutes = d.getMinutes().toString().padStart(2, '0');
                        const ampm = hours >= 12 ? 'PM' : 'AM';
                        const h12 = hours % 12 || 12;
                        const timeStr = `${h12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
                        
                        // Try to find the exact slot or default to the parsed time
                        if (TIME_SLOTS.includes(timeStr)) {
                            setTimeSlot(timeStr);
                        } else {
                            setTimeSlot(timeStr); 
                            if (!TIME_SLOTS.includes(timeStr)) TIME_SLOTS.push(timeStr);
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

    const handleSave = async () => {
        if (!id) return;
        setSaving(true);
        try {
            // Reconstruct dateTime from date and timeSlot
            let isoDateTime = new Date().toISOString();
            if (date && timeSlot) {
                const [time, ampm] = timeSlot.split(' ');
                let [h, m] = time.split(':').map(Number);
                if (ampm === 'PM' && h < 12) h += 12;
                if (ampm === 'AM' && h === 12) h = 0;
                const d = new Date(date);
                d.setHours(h, m, 0, 0);
                // Adjust for local timezone offset if needed to get correct UTC, but usually local is expected by API
                isoDateTime = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString();
            }

            const payload = {
                patientId: Number(patientId),
                doctorId: Number(doctorId),
                clinicId: clinicId ? Number(clinicId) : undefined,
                appointmentDate: isoDateTime,
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

                            {/* Doctor */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5">Assigned Doctor</label>
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
                                <label className="block text-xs font-bold text-slate-500 mb-3">Available Slots</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {TIME_SLOTS.map((slot) => {
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
                                                {slot}
                                            </button>
                                        );
                                    })}
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
                                        className="w-full pl-10 pr-10 py-3 bg-slate-100 border border-transparent rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1A6FC4] appearance-none"
                                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em' }}
                                    >
                                        <option>Follow-up Visit</option>
                                        <option>Initial Consultation</option>
                                        <option>Routine Checkup</option>
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
