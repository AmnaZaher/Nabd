import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from '../TopBar';
import { Button } from '../../ui';
import { patientApi } from '../../../api/patient';

import {
    ArrowLeft,
    Pencil,
    UserRound,
    Building2,
    Phone,
    Heart,
    AlertTriangle,
    FileText,
    Calendar,
    FlaskConical,
    Radiation,
    Pill,
    ClipboardList,
    Droplets,
    ShieldCheck,
    History,
    Activity,
    PlusSquare,
    Brain,
    SlidersHorizontal,
    ExternalLink,
    ChevronLeft,
    ChevronRight,
    ArrowRight,
    Bot,
    Beaker,
    MonitorDot,
    Scan,
    Bone,
    CircleAlert,
    Lock,
    MapPin,
    UserX,
    User,
    FileEdit
} from 'lucide-react';
import type { PatientProfile } from '../../../types/patient.types';
import VisitDetailsView from './VisitDetailsView';
import { EditUserModal } from './EditUserModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';

// ====================================================================
//                    TAB CONFIG
// ====================================================================
type TabKey = 'personal' | 'medical' | 'visits' | 'lab' | 'radiology' | 'prescriptions';
const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'personal', label: 'Personal Info', icon: <UserRound size={16} /> },
    { key: 'medical', label: 'Medical Info', icon: <Heart size={16} /> },
    { key: 'visits', label: 'Visits', icon: <Calendar size={16} /> },
    { key: 'lab', label: 'Lab Results', icon: <FlaskConical size={16} /> },
    { key: 'radiology', label: 'Radiology', icon: <Radiation size={16} /> },
    { key: 'prescriptions', label: 'Prescriptions', icon: <Pill size={16} /> },
];

// ==================== Mock Data Fallback ====================

// ====================================================================
//                    SHARED HELPERS
// ====================================================================
const InfoField = ({ label, value, labelColor = 'text-[#94a3b8]' }: { label: string; value: string; labelColor?: string }) => (<div><p className={`text-[13px] font-bold ${labelColor} mb-1.5`}>{label}</p><p className="text-[15px] font-bold text-slate-900">{value || 'N/A'}</p></div>);
const SectionHeader = ({ icon, title }: { icon: React.ReactNode; title: string }) => (<div className="flex items-center gap-4 pb-6 border-b border-slate-100 mb-6"><div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">{icon}</div><h3 className="text-xl font-bold text-slate-800">{title}</h3></div>);
const BriefRow = ({ label, value, valueColor = 'text-slate-900' }: { label: string; value: string; valueColor?: string }) => (<div className="flex items-center justify-between"><span className="text-sm font-medium text-slate-500">{label}</span><span className={`text-sm font-bold ${valueColor}`}>{value || 'N/A'}</span></div>);
const MedicalDataItem = ({ icon, iconBg, iconColor, label, value }: { icon: React.ReactNode; iconBg: string; iconColor: string; label: string; value: string }) => (<div className="flex items-center gap-4"><div className={`w-10 h-10 ${iconBg} ${iconColor} rounded-xl flex items-center justify-center shrink-0`}>{icon}</div><div><p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-0.5">{label}</p><p className="text-sm font-bold text-slate-900">{value || 'N/A'}</p></div></div>);


// ====================================================================
//                    TAB: PERSONAL INFO
// ====================================================================
const PersonalInfoTab = ({ patient }: { patient: PatientProfile }) => (
    <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
                <SectionHeader icon={<ClipboardList size={20} />} title="Personal Identification" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    <InfoField label="Full Name" value={patient.name} />
                    <InfoField label="Full Name Arabic" value={patient.nameArabic} />
                    <InfoField label="National ID" value={patient.nationalId} />
                    <InfoField label="Date Of Birth" value={patient.dateOfBirth} />
                    <InfoField label="Gender" value={patient.gender} />
                    <InfoField label="Phone Number" value={patient.phone} />
                    <div className="md:col-span-2">
                        <InfoField label="Email Address" value={patient.email} />
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
                <SectionHeader icon={<Building2 size={20} />} title="Contact & Address" />
                <div className="space-y-8">
                    <InfoField label="Address" value={patient.address} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        <InfoField label="City" value={patient.city} />
                        <InfoField label="Country" value={patient.country} />
                    </div>
                </div>
            </div>
        </div>
        <div className="w-full lg:w-[340px] shrink-0 space-y-6">
            <div className="bg-[#fce9e9] rounded-3xl p-7 border border-[#f5d5d5] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-20">
                    <UserRound size={80} className="text-[#a53b46]" />
                </div>
                <div className="flex items-center gap-4 mb-8 relative z-10">
                    <div className="w-10 h-10 bg-[#a53b46] text-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                        <UserRound size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-[#5c1c24]">Next of Kin</h3>
                </div>
                <div className="space-y-6 relative z-10">
                    <div>
                        <p className="text-[11px] font-black tracking-widest text-[#a53b46] uppercase mb-1">CONTACT NAME</p>
                        <p className="text-base font-bold text-[#5c1c24]">{patient.nextOfKin?.name || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-[11px] font-black tracking-widest text-[#a53b46] uppercase mb-1">RELATIONSHIP</p>
                        <p className="text-base font-bold text-[#5c1c24]">{patient.nextOfKin?.relationship || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-[11px] font-black tracking-widest text-[#a53b46] uppercase mb-1">PHONE NUMBER</p>
                        <div className="flex items-center gap-3">
                            <p className="text-base font-bold text-[#5c1c24]">{patient.nextOfKin?.phone || 'N/A'}</p>
                            {patient.nextOfKin?.phone && (
                                <button className="w-8 h-8 bg-white/60 text-[#a53b46] rounded-full flex items-center justify-center hover:bg-white transition-colors">
                                    <Phone size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-slate-50 rounded-3xl p-7 border border-slate-100">
                <h3 className="text-[11px] font-black tracking-widest text-slate-500 uppercase mb-6">PATIENT BRIEF</h3>
                <div className="space-y-5">
                    <BriefRow label="Blood Type" value={patient.bloodType} valueColor="text-blue-600" />
                    <BriefRow label="Insurance" value={patient.insuranceType} />
                    <BriefRow label="Last Visit" value={patient.lastVisit} />
                </div>
            </div>
        </div>
    </div>
);

// ====================================================================
//                    TAB: MEDICAL INFO
// ====================================================================
const MedicalInfoTab = ({ patient }: { patient: PatientProfile }) => (
    <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-[320px] shrink-0 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
                <h3 className="text-[11px] font-black tracking-widest text-slate-500 uppercase mb-8">BASIC MEDICAL DATA</h3>
                <div className="space-y-6">
                    <MedicalDataItem icon={<Droplets size={18} />} iconBg="bg-red-50" iconColor="text-red-500" label="BLOOD TYPE" value={patient.bloodType} />
                    <MedicalDataItem icon={<ShieldCheck size={18} />} iconBg="bg-blue-50" iconColor="text-blue-600" label="INSURANCE TYPE" value={patient.insuranceType} />
                    <MedicalDataItem icon={<Calendar size={18} />} iconBg="bg-slate-100" iconColor="text-slate-500" label="LAST VISIT" value={patient.lastVisit} />
                </div>
            </div>
            <div className="bg-[#1d4ed8] rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
                <h4 className="text-[17px] font-bold mb-2 relative z-10">Precision Monitoring</h4>
                <p className="text-[13px] text-blue-100 font-medium leading-relaxed relative z-10 pr-4">Next routine check-up suggested for November 2024 based on chronic history.</p>
                <div className="absolute -bottom-4 -right-2 opacity-20"><Activity size={100} strokeWidth={1.5} /></div>
            </div>
        </div>
        <div className="flex-1"><div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
            <h3 className="text-[11px] font-black tracking-widest text-slate-500 uppercase mb-8">CLINICAL SUMMARY</h3>
            <div className="flex flex-col md:flex-row gap-10 mb-10">
                <div className="flex-1">
                    <div className="flex items-center gap-2.5 mb-5">
                        <PlusSquare size={16} className="text-blue-600" />
                        <h4 className="text-[11px] font-black tracking-widest text-slate-500 uppercase">CURRENT MEDICATIONS</h4>
                    </div>
                    <div className="space-y-4">
                        {patient.medications?.length > 0 ? patient.medications.map((m, i) => (
                            <div key={i} className="bg-slate-50 rounded-r-xl border-l-[4px] border-l-blue-600 px-5 py-4">
                                <p className="text-[15px] font-bold text-slate-900 mb-1">{m.name}</p>
                                <p className="text-xs text-slate-500 font-medium">{m.frequency} • {m.route}</p>
                            </div>
                        )) : (
                            <div className="bg-slate-50 rounded-r-xl border-l-[4px] border-l-slate-300 px-5 py-4">
                                <p className="text-sm text-slate-400">No current medications</p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="md:w-[250px] shrink-0">
                    <div className="flex items-center gap-2.5 mb-5">
                        <AlertTriangle size={16} className="text-red-500" />
                        <h4 className="text-[11px] font-black tracking-widest text-slate-500 uppercase">ALLERGIES</h4>
                    </div>
                    {patient.allergies?.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                            {patient.allergies.map((a, i) => (
                                <span key={i} className="inline-flex items-center gap-2 bg-[#fdf2f2] text-[#9b2c2c] px-4 py-2 rounded-lg text-sm font-bold">
                                    <span className="w-1.5 h-1.5 bg-[#c53030] rounded-full"></span>
                                    {a}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400">No known allergies</p>
                    )}
                </div>
            </div>
            <div>
                <div className="flex items-center gap-2.5 mb-5">
                    <History size={16} className="text-slate-500" />
                    <h4 className="text-[11px] font-black tracking-widest text-slate-500 uppercase">CHRONIC DISEASES</h4>
                </div>
                {patient.chronicDiseases?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {patient.chronicDiseases.map((d, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-50 text-slate-500 rounded-xl flex items-center justify-center shrink-0">
                                    <Activity size={20} />
                                </div>
                                <div>
                                    <p className="text-[15px] font-bold text-slate-900 mb-1">{d.name}</p>
                                    <p className="text-xs text-slate-500 font-medium">Diagnosed {d.diagnosedDate} • {d.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-slate-50 rounded-2xl px-5 py-4 border border-slate-100">
                        <p className="text-sm text-slate-400">No chronic diseases</p>
                    </div>
                )}
            </div>
        </div></div>
    </div>
);

// ====================================================================
//                    VISIT STATUS HELPERS
// ====================================================================
const VISITS_PER_PAGE = 10;
const visitStatusStyles: Record<string, string> = {
    'Completed': 'bg-emerald-50 text-emerald-600 border-emerald-200',
    'In Progress': 'bg-blue-50 text-blue-600 border-blue-200',
    'InProgress': 'bg-blue-50 text-blue-600 border-blue-200',
    'Waiting': 'bg-amber-50 text-amber-600 border-amber-200',
    'Cancelled': 'bg-red-50 text-red-600 border-red-200',
};

// Maps backend integer status to display string
const visitStatusMap: Record<number, string> = { 1: 'In Progress', 2: 'Completed', 3: 'Cancelled' };
const visitTypeMap: Record<number, string> = { 1: 'Initial Admit', 2: 'Follow-up', 3: 'Consultation' };

// Normalize a raw visit from the backend into the display shape
const normalizeVisit = (raw: any): any => {
    const statusNum = raw.visitStatus ?? raw.VisitStatus ?? raw.status ?? raw.Status;
    const statusStr = typeof statusNum === 'number'
        ? (visitStatusMap[statusNum] || 'Unknown')
        : (raw.visitStatus || raw.status || raw.Status || 'Unknown');

    const typeNum = raw.visitType ?? raw.VisitType ?? raw.type ?? raw.Type;
    const typeStr = typeof typeNum === 'number'
        ? (visitTypeMap[typeNum] || 'Visit')
        : (raw.visitTypeName || raw.VisitTypeName || raw.visitType || raw.type || 'Visit');

    const doctorName = raw.doctorName || raw.DoctorName || raw.doctor?.name || raw.Doctor?.name || 'Unknown';
    const doctorInitials = doctorName !== 'Unknown'
        ? doctorName.split(' ').slice(-2).map((p: string) => p[0]?.toUpperCase() || '').join('')
        : '??';

    // Generate a consistent color class from the doctor name
    const colorPalette = ['bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700'];
    const colorIdx = doctorName.charCodeAt(0) % colorPalette.length;

    const rawDate = raw.visitDate || raw.VisitDate || raw.date || raw.Date || raw.createdAt || '';
    let dateStr = 'N/A';
    let timeStr = '';
    if (rawDate) {
        try {
            const d = new Date(rawDate);
            dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } catch { dateStr = rawDate; }
    }

    return {
        id: raw.id ?? raw.Id ?? raw.visitId ?? raw.VisitId,
        visitNumber: raw.visitNumber || raw.VisitNumber || raw.fileNumber || `VS-${raw.id || '?'}`,
        date: dateStr,
        time: timeStr,
        doctor: { name: doctorName, initials: doctorInitials, color: colorPalette[colorIdx] },
        department: raw.clinicName || raw.ClinicName || raw.department || raw.Department || raw.specialization || 'N/A',
        visitType: typeStr,
        status: statusStr,
        _raw: raw,
    };
};

// ====================================================================
//                    TAB: VISITS
// ====================================================================
const VisitsTab = ({ patient }: { patient: PatientProfile }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedVisit, setSelectedVisit] = useState<any>(null);
    const [loadingVisit, setLoadingVisit] = useState(false);
    const [visits, setVisits] = useState<any[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fileNumber = (patient as any).patientId || (patient as any).PatientId || patient.id;

    const fetchVisits = async (page: number) => {
        setLoading(true);
        setError(null);
        try {
            const result = await patientApi.getPatientVisits({
                fileNumber: String(fileNumber),
                PageIndex: page - 1,
                PageSize: VISITS_PER_PAGE,
            });
            // Support various response shapes
            const items = result?.items || result?.visits || result?.data || result || [];
            const total = result?.totalCount ?? result?.total ?? result?.count ?? (Array.isArray(result) ? result.length : items.length);
            setVisits(Array.isArray(items) ? items.map(normalizeVisit) : []);
            setTotalCount(typeof total === 'number' ? total : items.length);
        } catch (err: any) {
            console.error('Failed to fetch patient visits:', err);
            setError(err?.message || 'Failed to load visit history.');
            setVisits([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
        fetchVisits(1);
    }, [fileNumber]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchVisits(page);
    };

    const handleViewDetails = async (v: any) => {
        if (!v.id) { setSelectedVisit(v); return; }
        setLoadingVisit(true);
        try {
            const detail = await patientApi.getVisitDetails(v.id);
            // Merge the raw fetched detail with normalized display fields
            setSelectedVisit({ ...v, ...(detail ? normalizeVisit(detail) : {}), _detail: detail });
        } catch {
            setSelectedVisit(v); // fallback to list data
        } finally {
            setLoadingVisit(false);
        }
    };

    if (selectedVisit != null) {
        return <VisitDetailsView visit={selectedVisit} onBack={() => setSelectedVisit(null)} />;
    }

    const totalPages = Math.ceil(totalCount / VISITS_PER_PAGE);

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 md:px-8 py-5 flex items-center justify-between border-b border-slate-100">
                    <h3 className="text-lg font-extrabold text-slate-900">Visit History</h3>
                    <button
                        onClick={() => fetchVisits(currentPage)}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Refresh"
                    >
                        <SlidersHorizontal size={18} />
                    </button>
                </div>

                {/* Loading skeleton */}
                {loading && (
                    <div className="p-8 space-y-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="flex items-center gap-4 animate-pulse">
                                <div className="h-4 bg-slate-100 rounded flex-1" />
                                <div className="h-4 bg-slate-100 rounded w-24" />
                                <div className="h-4 bg-slate-100 rounded w-32" />
                                <div className="h-4 bg-slate-100 rounded w-20" />
                                <div className="h-6 bg-slate-100 rounded-full w-20" />
                                <div className="h-4 bg-slate-100 rounded w-20" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Error state */}
                {!loading && error && (
                    <div className="px-8 py-12 text-center">
                        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar size={24} className="text-red-400" />
                        </div>
                        <p className="text-sm font-bold text-slate-700 mb-1">Could not load visits</p>
                        <p className="text-xs text-slate-400 mb-4">{error}</p>
                        <button
                            onClick={() => fetchVisits(currentPage)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Table */}
                {!loading && !error && (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="px-6 md:px-8 py-4 text-left text-[11px] font-black tracking-widest text-slate-400 uppercase">Visit Number</th>
                                        <th className="px-4 py-4 text-left text-[11px] font-black tracking-widest text-slate-400 uppercase">Visit Date</th>
                                        <th className="px-4 py-4 text-left text-[11px] font-black tracking-widest text-slate-400 uppercase">Doctor</th>
                                        <th className="px-4 py-4 text-left text-[11px] font-black tracking-widest text-slate-400 uppercase">Clinic</th>
                                        <th className="px-4 py-4 text-left text-[11px] font-black tracking-widest text-slate-400 uppercase">Visit Type</th>
                                        <th className="px-4 py-4 text-left text-[11px] font-black tracking-widest text-slate-400 uppercase">Status</th>
                                        <th className="px-6 md:px-8 py-4 text-left text-[11px] font-black tracking-widest text-slate-400 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visits.map((v) => (
                                        <tr key={v.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 md:px-8 py-5">
                                                <span className="text-sm font-bold text-blue-600">{v.visitNumber}</span>
                                            </td>
                                            <td className="px-4 py-5">
                                                <p className="text-sm font-bold text-slate-900">{v.date}</p>
                                                {v.time && <p className="text-xs text-slate-400">{v.time}</p>}
                                            </td>
                                            <td className="px-4 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${v.doctor?.color || 'bg-slate-100 text-slate-500'}`}>
                                                        {v.doctor?.initials || '??'}
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-900 whitespace-nowrap">{v.doctor?.name || 'Unknown'}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-5">
                                                <span className="text-sm font-medium text-slate-600">{v.department}</span>
                                            </td>
                                            <td className="px-4 py-5">
                                                <span className="text-sm font-medium text-slate-600">{v.visitType}</span>
                                            </td>
                                            <td className="px-4 py-5">
                                                <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold border ${visitStatusStyles[v.status] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                                    {v.status}
                                                </span>
                                            </td>
                                            <td className="px-6 md:px-8 py-5">
                                                <button
                                                    onClick={() => handleViewDetails(v)}
                                                    disabled={loadingVisit}
                                                    className="flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 disabled:opacity-50"
                                                >
                                                    View Details
                                                    <ExternalLink size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {visits.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-8 py-16 text-center">
                                                <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <Calendar size={24} className="text-slate-300" />
                                                </div>
                                                <p className="text-sm font-bold text-slate-500 mb-1">No visits found</p>
                                                <p className="text-xs text-slate-400">This patient has no recorded visits yet.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-6 md:px-8 py-4 flex items-center justify-between border-t border-slate-100">
                            <p className="text-sm text-slate-500">
                                Showing {visits.length} of {totalCount} visits
                            </p>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
                                    const p = Math.max(1, Math.min(currentPage - 1, totalPages - 2)) + i;
                                    return p <= totalPages ? (
                                        <button
                                            key={p}
                                            onClick={() => handlePageChange(p)}
                                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                                                currentPage === p ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    ) : null;
                                })}
                                <button
                                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage >= totalPages}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const labStatusStyles: Record<string, string> = {
    'Finalized': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Review Required': 'bg-red-50 text-red-600 border-red-200',
    'Pending': 'bg-slate-100 text-slate-600 border-slate-200',
};
const labIconMap: Record<string, React.ReactNode> = {
    blood: <Droplets size={18} />,
    lipid: <Activity size={18} />,
    glucose: <FlaskConical size={18} />,
    liver: <Beaker size={18} />,
};

// Map backend integer/string status to display string
const labStatusDisplayMap: Record<number | string, string> = {
    1: 'Pending', 2: 'Finalized', 3: 'Review Required',
    'Pending': 'Pending', 'Finalized': 'Finalized', 'ReviewRequired': 'Review Required', 'Review Required': 'Review Required',
};

const normalizeLabResult = (raw: any, index: number): any => {
    const statusRaw = raw.status ?? raw.Status ?? raw.finalStatus ?? raw.resultStatus;
    const statusStr = typeof statusRaw === 'number'
        ? (labStatusDisplayMap[statusRaw] || 'Pending')
        : (labStatusDisplayMap[String(statusRaw)] || String(statusRaw) || 'Pending');

    const rawDate = raw.requestDate || raw.RequestDate || raw.createdAt || raw.CreatedAt || raw.date || raw.Date || '';
    let dateStr = 'N/A';
    if (rawDate) {
        try { dateStr = new Date(rawDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); } catch { dateStr = rawDate; }
    }

    const testName = raw.testName || raw.TestName || raw.testNameEnglish || raw.TestNameEnglish || raw.name || raw.Name || 'Lab Test';
    const testSubtitle = raw.category || raw.Category || raw.subCategory || raw.SubCategory || raw.testAbbreviation || raw.TestAbbreviation || '';
    const requestNum = raw.requestId ?? raw.RequestId ?? raw.id ?? raw.Id ?? (index + 1);

    // Pick icon key from test name keywords
    let iconKey = 'glucose';
    const lc = testName.toLowerCase();
    if (lc.includes('blood') || lc.includes('cbc') || lc.includes('hematol')) iconKey = 'blood';
    else if (lc.includes('lipid') || lc.includes('cholesterol') || lc.includes('triglyc')) iconKey = 'lipid';
    else if (lc.includes('liver') || lc.includes('hepat') || lc.includes('bilirubin')) iconKey = 'liver';

    return {
        id: raw.id ?? raw.Id ?? raw.visitId ?? index,
        testName,
        testSubtitle,
        date: dateStr,
        requestNumber: String(requestNum),
        status: statusStr,
        iconKey,
        _raw: raw,
    };
};

const LAB_RESULTS_PER_PAGE = 8;

const LabResultsTab = ({ patient }: { patient: PatientProfile }) => {
    const [labResults, setLabResults] = useState<any[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);



    const fetchLabResults = (page: number) => {
        setLoading(true);
        setError(null);
        try {
            const items = patient.labResults || [];
            const startIndex = (page - 1) * LAB_RESULTS_PER_PAGE;
            const endIndex = startIndex + LAB_RESULTS_PER_PAGE;
            setLabResults(items.slice(startIndex, endIndex).map(normalizeLabResult));
            setTotalCount(items.length);
        } catch (err: any) {
            console.error('Failed to load lab results:', err);
            setError('Failed to load lab results.');
            setLabResults([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLabResults(1); }, [patient]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchLabResults(page);
    };

    const totalPages = Math.ceil(totalCount / LAB_RESULTS_PER_PAGE);

    return (
        <div className="space-y-6">
            {/* Lab Results Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 md:px-8 py-5 flex items-center justify-between border-b border-slate-100">
                    <h3 className="text-lg font-extrabold text-slate-900">Laboratory Results</h3>
                    <button
                        onClick={() => fetchLabResults(currentPage)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                        <SlidersHorizontal size={16} />
                        Filter
                    </button>
                </div>

                {/* Loading skeleton */}
                {loading && (
                    <div className="p-8 space-y-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="flex items-center gap-4 animate-pulse">
                                <div className="w-10 h-10 bg-slate-100 rounded-xl shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3.5 bg-slate-100 rounded w-48" />
                                    <div className="h-3 bg-slate-100 rounded w-32" />
                                </div>
                                <div className="h-4 bg-slate-100 rounded w-24" />
                                <div className="h-4 bg-slate-100 rounded w-16" />
                                <div className="h-6 bg-slate-100 rounded-full w-20" />
                                <div className="h-4 bg-slate-100 rounded w-12" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Error state */}
                {!loading && error && (
                    <div className="px-8 py-12 text-center">
                        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FlaskConical size={24} className="text-red-400" />
                        </div>
                        <p className="text-sm font-bold text-slate-700 mb-1">Could not load lab results</p>
                        <p className="text-xs text-slate-400 mb-4">{error}</p>
                        <button
                            onClick={() => fetchLabResults(currentPage)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Table */}
                {!loading && !error && (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="px-6 md:px-8 py-4 text-left text-[11px] font-black tracking-widest text-slate-400 uppercase">Test Name</th>
                                        <th className="px-4 py-4 text-left text-[11px] font-black tracking-widest text-slate-400 uppercase">Date</th>
                                        <th className="px-4 py-4 text-left text-[11px] font-black tracking-widest text-slate-400 uppercase">Request Number</th>
                                        <th className="px-4 py-4 text-left text-[11px] font-black tracking-widest text-slate-400 uppercase">Status</th>
                                        <th className="px-6 md:px-8 py-4 text-left text-[11px] font-black tracking-widest text-slate-400 uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {labResults.map((l) => (
                                        <tr key={l.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 md:px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                                                        {labIconMap[l.iconKey] || <FlaskConical size={18} />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">{l.testName}</p>
                                                        {l.testSubtitle && <p className="text-xs text-slate-400">{l.testSubtitle}</p>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-5">
                                                <span className="text-sm font-medium text-slate-600">{l.date}</span>
                                            </td>
                                            <td className="px-4 py-5">
                                                <span className="text-sm font-medium text-slate-600">{l.requestNumber}</span>
                                            </td>
                                            <td className="px-4 py-5">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black tracking-wider uppercase border ${labStatusStyles[l.status] || 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                                    {l.status === 'Review Required' && <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />}
                                                    {l.status}
                                                </span>
                                            </td>
                                            <td className="px-6 md:px-8 py-5">
                                                <button className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                                                    View <ArrowRight size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {labResults.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-8 py-16 text-center">
                                                <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <FlaskConical size={24} className="text-slate-300" />
                                                </div>
                                                <p className="text-sm font-bold text-slate-500 mb-1">No lab results found</p>
                                                <p className="text-xs text-slate-400">This patient has no recorded lab results yet.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-6 md:px-8 py-4 flex items-center justify-between border-t border-slate-100">
                            <p className="text-sm text-slate-500">Showing {labResults.length} of {totalCount} results</p>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                {Array.from({ length: Math.min(totalPages || 1, 3) }, (_, i) => {
                                    const p = Math.max(1, Math.min(currentPage - 1, (totalPages || 1) - 2)) + i;
                                    return p <= (totalPages || 1) ? (
                                        <button
                                            key={p}
                                            onClick={() => handlePageChange(p)}
                                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${currentPage === p ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                                        >
                                            {p}
                                        </button>
                                    ) : null;
                                })}
                                <button
                                    onClick={() => handlePageChange(Math.min(totalPages || 1, currentPage + 1))}
                                    disabled={currentPage >= (totalPages || 1)}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Automated Analysis — full width */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white relative overflow-hidden flex items-center">
                <div className="flex-1 relative z-10">
                    <h4 className="text-lg font-extrabold mb-2">Automated Analysis</h4>
                    <p className="text-sm text-blue-200 font-medium leading-relaxed">
                        AI-driven insight suggests a slight upward trend in lipid levels over the last 6 months. Recommend dietary review.
                    </p>
                </div>
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 ml-4 relative z-10">
                    <Bot size={28} />
                </div>
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/5 rounded-full" />
            </div>
        </div>
    );
};


const RADIOLOGY_PER_PAGE = 5;
const radiologyIconMap: Record<string, React.ReactNode> = { xray: <Bone size={18} />, mri: <Brain size={18} />, ct: <Scan size={18} />, ultrasound: <MonitorDot size={18} />, emergency: <CircleAlert size={18} /> };
const radiologyIconBg: Record<string, string> = { xray: 'bg-blue-50 text-blue-600', mri: 'bg-purple-50 text-purple-600', ct: 'bg-emerald-50 text-emerald-600', ultrasound: 'bg-amber-50 text-amber-600', emergency: 'bg-red-50 text-red-600' };

const normalizeRadiology = (raw: any, index: number): any => {
    const rawDate = raw.date || raw.Date || raw.requestDate || raw.RequestDate || raw.createdAt || raw.CreatedAt || '';
    let dateStr = 'N/A';
    if (rawDate) {
        try { dateStr = new Date(rawDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); } catch { dateStr = rawDate; }
    }

    const scanType = raw.scanType || raw.ScanType || raw.type || raw.Type || raw.name || raw.Name || 'Radiology Scan';
    const doctor = raw.doctor || raw.Doctor || raw.doctorName || raw.DoctorName || raw.physician || raw.Physician || 'Dr. Unknown';
    
    // Determine icon and urgency
    let icon = 'xray';
    const lc = scanType.toLowerCase();
    if (lc.includes('mri')) icon = 'mri';
    else if (lc.includes('ct') || lc.includes('computed tomography')) icon = 'ct';
    else if (lc.includes('ultrasound') || lc.includes('sono')) icon = 'ultrasound';
    else if (lc.includes('emergency')) icon = 'emergency';

    const isUrgent = raw.isUrgent || raw.IsUrgent || raw.priority === 'High' || raw.Priority === 'High' || icon === 'emergency' || false;

    return {
        id: raw.id ?? raw.Id ?? index,
        scanType,
        date: dateStr,
        doctor,
        icon,
        isUrgent,
        _raw: raw,
    };
};

const RadiologyTab = ({ patient }: { patient: PatientProfile }) => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [radiology, setRadiology] = useState<any[]>([]);
    const [totalCount, setTotalCount] = useState(0);


    // Default summary mapping
    const summary = patient.radiologySummary || { totalScans: totalCount, activeReports: 0, pendingReview: 0, nextScan: { type: 'N/A', date: '-' } };

    const fetchRadiology = (page: number) => {
        setLoading(true);
        setError(null);
        try {
            const items = patient.radiology || [];
            const startIndex = (page - 1) * RADIOLOGY_PER_PAGE;
            const endIndex = startIndex + RADIOLOGY_PER_PAGE;
            setRadiology(items.slice(startIndex, endIndex).map(normalizeRadiology));
            setTotalCount(items.length);
        } catch (err: any) {
            console.error('Failed to load radiology records:', err);
            setError('Failed to load radiology records.');
            setRadiology([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRadiology(1);
    }, [patient]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchRadiology(page);
    };

    const totalPages = Math.ceil(totalCount / RADIOLOGY_PER_PAGE);

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-[320px] shrink-0 space-y-6">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <p className="text-[11px] font-black tracking-widest text-blue-600 uppercase mb-4">NEXT SCHEDULED SCAN</p>
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <p className="text-base font-bold text-slate-900">{summary.nextScan?.type || 'None'}</p>
                            <p className="text-xs text-slate-400 font-medium">{summary.nextScan?.date || '-'}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h3 className="text-[11px] font-black tracking-widest text-slate-500 uppercase mb-5">RADIOLOGY SUMMARY</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between"><span className="text-sm font-medium text-slate-500">Total Scans</span><span className="text-sm font-bold text-slate-900">{totalCount > 0 ? totalCount : summary.totalScans}</span></div>
                        <div className="flex items-center justify-between"><span className="text-sm font-medium text-slate-500">Active Reports</span><span className="text-sm font-bold text-slate-900">{summary.activeReports}</span></div>
                        <div className="flex items-center justify-between"><span className="text-sm font-medium text-slate-500">Pending Review</span><span className={`text-sm font-bold ${summary.pendingReview > 0 ? 'text-red-500' : 'text-slate-900'}`}>{summary.pendingReview}</span></div>
                    </div>
                </div>
                <div className="bg-[#111827] rounded-2xl p-6 text-white relative overflow-hidden cursor-pointer hover:bg-slate-800 transition-all border border-slate-700">
                    <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat" style={{ filter: 'blur(1px)' }}></div>
                    <div className="relative z-10 flex flex-col items-center text-center pt-4 pb-2">
                        <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center mb-4">
                            <MonitorDot size={24} />
                        </div>
                        <p className="text-base font-extrabold tracking-wide text-slate-100">Browse PACS Archive</p>
                    </div>
                </div>
            </div>
            <div className="flex-1">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 md:px-8 py-5 flex items-center justify-between border-b border-slate-100">
                        <h3 className="text-lg font-extrabold text-slate-900">Radiology Reports</h3>
                        <button 
                            onClick={() => fetchRadiology(currentPage)}
                            className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                            <SlidersHorizontal size={16} />
                            FILTER
                        </button>
                    </div>

                    {/* Loading skeleton */}
                    {loading && (
                        <div className="p-8 space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center gap-4 animate-pulse">
                                    <div className="w-10 h-10 bg-slate-100 rounded-xl shrink-0" />
                                    <div className="h-4 bg-slate-100 rounded w-48 flex-1" />
                                    <div className="h-4 bg-slate-100 rounded w-24" />
                                    <div className="h-4 bg-slate-100 rounded w-32" />
                                    <div className="h-8 bg-slate-100 rounded-xl w-24" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Error state */}
                    {!loading && error && (
                        <div className="px-8 py-12 text-center">
                            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Radiation size={24} className="text-red-400" />
                            </div>
                            <p className="text-sm font-bold text-slate-700 mb-1">Could not load radiology reports</p>
                            <p className="text-xs text-slate-400 mb-4">{error}</p>
                            <button
                                onClick={() => fetchRadiology(currentPage)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {!loading && !error && (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-100">
                                            <th className="px-6 md:px-8 py-4 text-left text-[11px] font-black tracking-widest text-slate-400 uppercase">Scan Type</th>
                                            <th className="px-4 py-4 text-left text-[11px] font-black tracking-widest text-slate-400 uppercase">Date</th>
                                            <th className="px-4 py-4 text-left text-[11px] font-black tracking-widest text-slate-400 uppercase">Doctor</th>
                                            <th className="px-6 md:px-8 py-4 text-left text-[11px] font-black tracking-widest text-slate-400 uppercase">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {radiology.map((scan) => (
                                            <tr key={scan.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 md:px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${radiologyIconBg[scan.icon] || 'bg-slate-100 text-slate-600'}`}>
                                                            {radiologyIconMap[scan.icon] || <Radiation size={18} />}
                                                        </div>
                                                        <span className="text-sm font-bold text-slate-900">{scan.scanType}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-5">
                                                    <span className="text-sm font-medium text-slate-600">{scan.date}</span>
                                                </td>
                                                <td className="px-4 py-5">
                                                    <span className="text-sm font-medium text-slate-600">{scan.doctor}</span>
                                                </td>
                                                <td className="px-6 md:px-8 py-5">
                                                    {scan.isUrgent ? (
                                                        <button className="px-4 py-2 bg-[#b94a48] hover:bg-red-800 text-white text-[11px] tracking-wide font-bold rounded-xl transition-colors">
                                                            Urgent Review
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => navigate(`/dashboard/users/patient/${patient.id}/radiology/${scan.id}`)} className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-[11px] tracking-wide font-bold rounded-xl border border-blue-100 transition-colors">
                                                            View Report
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))} 
                                        {radiology.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-8 py-12 text-center">
                                                    <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <Radiation size={24} className="text-slate-300" />
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-500 mb-1">No radiology records found</p>
                                                    <p className="text-xs text-slate-400 font-medium">This patient has no recorded radiology scans yet.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="px-6 md:px-8 py-4 flex items-center justify-between border-t border-slate-100">
                                <p className="text-sm text-slate-500 font-medium">Showing {radiology.length} of {totalCount} records</p>
                                <div className="flex items-center gap-1.5">
                                    <button 
                                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))} 
                                        disabled={currentPage === 1} 
                                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-30"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    {Array.from({ length: Math.min(totalPages || 1, 3) }, (_, i) => {
                                        const p = Math.max(1, Math.min(currentPage - 1, (totalPages || 1) - 2)) + i;
                                        return p <= (totalPages || 1) ? (
                                            <button 
                                                key={p} 
                                                onClick={() => handlePageChange(p)} 
                                                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${currentPage === p ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                                            >
                                                {p}
                                            </button>
                                        ) : null;
                                    })}
                                    <button 
                                        onClick={() => handlePageChange(Math.min(totalPages || 1, currentPage + 1))} 
                                        disabled={currentPage >= (totalPages || 1)} 
                                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-30"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const PRESCRIPTIONS_PER_PAGE = 4;

const normalizePrescription = (raw: any, index: number): any => {
    const rawDate = raw.date || raw.Date || raw.issueDate || raw.IssueDate || raw.createdAt || raw.CreatedAt || '';
    let dateStr = 'N/A';
    if (rawDate) {
        try { dateStr = new Date(rawDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); } catch { dateStr = rawDate; }
    }

    const docName = raw.doctor || raw.Doctor || raw.doctorName || raw.DoctorName || raw.prescriber || raw.Prescriber || 'Unknown Doctor';
    const docSpecialty = raw.specialty || raw.Specialty || raw.department || raw.Department || 'Medical Staff';
    const initials = docName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'DR';
    
    // Pick a color based on initials length or char code for variety
    const colors = ['bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-700'];
    const color = colors[initials.charCodeAt(0) % colors.length] || colors[0];

    // Determine medications count
    let medicationCount = 1;
    if (raw.medicationCount !== undefined) medicationCount = raw.medicationCount;
    else if (raw.MedicationCount !== undefined) medicationCount = raw.MedicationCount;
    else if (Array.isArray(raw.medications)) medicationCount = raw.medications.length;
    else if (Array.isArray(raw.Medications)) medicationCount = raw.Medications.length;

    const hasAlert = raw.hasAlert || raw.HasAlert || raw.isHighRisk || raw.IsHighRisk || medicationCount > 3 || false;

    return {
        id: raw.id ?? raw.Id ?? index,
        date: dateStr,
        doctor: { name: docName, specialty: docSpecialty, initials, color },
        medicationCount,
        hasAlert,
        _raw: raw
    };
};

const PrescriptionsTab = ({ patient }: { patient: PatientProfile }) => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [prescriptions, setPrescriptions] = useState<any[]>([]);
    const [totalCount, setTotalCount] = useState(0);



    const fetchPrescriptions = (page: number) => {
        setLoading(true);
        setError(null);
        try {
            const items = patient.prescriptions || [];
            const startIndex = (page - 1) * PRESCRIPTIONS_PER_PAGE;
            const endIndex = startIndex + PRESCRIPTIONS_PER_PAGE;
            setPrescriptions(items.slice(startIndex, endIndex).map(normalizePrescription));
            setTotalCount(items.length);
        } catch (err: any) {
            console.error('Failed to load prescriptions:', err);
            setError('Failed to load prescriptions.');
            setPrescriptions([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrescriptions(1);
    }, [patient]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchPrescriptions(page);
    };

    const totalPages = Math.ceil(totalCount / PRESCRIPTIONS_PER_PAGE);

    return (
        <div className="space-y-6 relative">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
                <div className="px-6 md:px-8 py-5 border-b border-slate-100">
                    <h3 className="text-lg font-extrabold text-slate-900">Prescription History</h3>
                </div>

                {loading && (
                    <div className="p-8 space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center gap-4 animate-pulse">
                                <div className="w-10 h-10 bg-slate-100 rounded-full shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-slate-100 rounded w-32" />
                                    <div className="h-3 bg-slate-100 rounded w-24" />
                                </div>
                                <div className="h-4 bg-slate-100 rounded w-24" />
                                <div className="h-6 bg-slate-100 rounded-full w-24" />
                                <div className="h-4 bg-slate-100 rounded w-16" />
                            </div>
                        ))}
                    </div>
                )}

                {!loading && error && (
                    <div className="px-8 py-12 text-center">
                        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText size={24} className="text-red-400" />
                        </div>
                        <p className="text-sm font-bold text-slate-700 mb-1">Could not load prescriptions</p>
                        <p className="text-xs text-slate-400 mb-4">{error}</p>
                        <button
                            onClick={() => fetchPrescriptions(currentPage)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {!loading && !error && (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="px-6 md:px-8 py-4 text-left text-[11px] font-black tracking-widest text-slate-400 uppercase">Doctor</th>
                                        <th className="px-4 py-4 text-left text-[11px] font-black tracking-widest text-slate-400 uppercase">Date</th>
                                        <th className="px-4 py-4 text-left text-[11px] font-black tracking-widest text-slate-400 uppercase">Medications</th>
                                        <th className="px-6 md:px-8 py-4 text-left text-[11px] font-black tracking-widest text-slate-400 uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {prescriptions.map((rx) => (
                                        <tr key={rx.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 md:px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${rx.doctor.color}`}>
                                                        {rx.doctor.initials}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">{rx.doctor.name}</p>
                                                        <p className="text-xs text-slate-400 font-medium">{rx.doctor.specialty}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-5">
                                                <span className="text-sm font-medium text-slate-600">{rx.date}</span>
                                            </td>
                                            <td className="px-4 py-5">
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex px-3 py-1.5 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-full">
                                                        {rx.medicationCount} Medication{rx.medicationCount !== 1 ? 's' : ''}
                                                    </span>
                                                    {rx.hasAlert && (
                                                        <span className="w-1.5 h-1.5 bg-[#b94a48] rounded-full shrink-0"></span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 md:px-8 py-5">
                                                <button 
                                                    onClick={() => navigate(`/dashboard/users/patient/${patient.id}/prescription/${rx.id}`)} 
                                                    className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
                                                >
                                                    View Details <ExternalLink size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {prescriptions.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-12 text-center">
                                                <p className="text-sm text-slate-400 font-medium">No historical prescriptions available</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-6 md:px-8 py-4 flex items-center justify-between border-t border-slate-100">
                            <p className="text-sm text-slate-500 font-medium">Showing {prescriptions.length} of {totalCount} historical prescriptions</p>
                            <div className="flex items-center gap-1.5">
                                <button 
                                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))} 
                                    disabled={currentPage === 1} 
                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-30"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                {Array.from({ length: Math.min(totalPages || 1, 3) }, (_, i) => {
                                    const p = Math.max(1, Math.min(currentPage - 1, (totalPages || 1) - 2)) + i;
                                    return p <= (totalPages || 1) ? (
                                        <button 
                                            key={p} 
                                            onClick={() => handlePageChange(p)} 
                                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${currentPage === p ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                                        >
                                            {p}
                                        </button>
                                    ) : null;
                                })}
                                <button 
                                    onClick={() => handlePageChange(Math.min(totalPages || 1, currentPage + 1))} 
                                    disabled={currentPage >= (totalPages || 1)} 
                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-30"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
            
            {/* FAB for new prescription */}
            <button className="fixed bottom-10 right-10 w-14 h-14 bg-[#0b5cba] hover:bg-[#094a96] text-white rounded-2xl shadow-lg flex items-center justify-center transition-transform hover:scale-105 z-50">
                <FileEdit size={24} />
            </button>
        </div>
    );
};

// ====================================================================
//                    MAIN COMPONENT
// ====================================================================
const PatientProfileDetail = ({ onMenuClick }: { onMenuClick: () => void }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [patient, setPatient] = useState<PatientProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabKey>('personal');

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const loadPatientData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await patientApi.getPatientById(id);
            if (data) {
                setPatient(data);
            } else {
                console.error('Patient record not found');
            }
        } catch (error) {
            console.error('Failed to fetch patient detail:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPatientData();
    }, [id]);

    const onDeleteSuccess = () => {
        navigate('/dashboard/users');
    };

    const breadcrumb: React.ReactNode = (
        <span className="text-slate-400">
            <span
                className="cursor-pointer hover:text-slate-600 transition-colors"
                onClick={() => navigate('/dashboard/users', { state: { activeTab: 'patient' } })}
            >
                User Management
            </span>
            <span className="mx-2">&rsaquo;</span>
            <span className="text-slate-900">Profile Detail</span>
        </span>
    );

    if (loading) {
        return (
            <div className="flex flex-col h-full bg-slate-50 relative font-sans w-full">
                <TopBar title={breadcrumb} onMenuClick={onMenuClick} onAddUserClick={() => {}} />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="flex flex-col h-full bg-slate-50 relative font-sans w-full">
                <TopBar title={breadcrumb} onMenuClick={onMenuClick} onAddUserClick={() => {}} />
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <UserRound className="w-10 h-10 text-slate-300" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Patient Not Found</h2>
                    <p className="text-slate-500 mb-6 text-center max-w-xs">We couldn't find the patient record you're looking for. It may have been deleted or the ID is incorrect.</p>
                    <Button variant="primary" onClick={() => navigate('/dashboard/users', { state: { activeTab: 'patient' } })}>Back to User Management</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col flex-1 h-full w-full bg-slate-50 relative font-sans overflow-hidden">
            <TopBar title={breadcrumb} onMenuClick={onMenuClick} onAddUserClick={() => {}} />

            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-[1200px] mx-auto space-y-6 pb-10">
                    {/* ===== Header Card ===== */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8">
                        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
                            {/* Patient Info Header */}
                            <div className="flex items-center gap-6">
                                <div className="relative">
                                    <img
                                        src={patient.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name)}&background=f1f5f9&color=64748b`}
                                        alt={patient.name}
                                        className="w-[100px] h-[100px] rounded-full object-cover border-[6px] border-slate-50 shadow-sm bg-slate-100"
                                    />
                                    {patient.status === 'Active' && (
                                        <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-[3px] border-white rounded-full"></div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-3 mb-2">
                                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                                            {patient.name}
                                        </h1>
                                        {patient.status === 'Active' && (
                                            <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                                                Active
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500 font-medium mt-3">
                                        <span className="flex items-center gap-1.5">
                                            <Lock size={15} className="text-slate-400" /> {patient.patientId}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <User size={15} className="text-slate-400" /> {patient.age} Years Old
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <MapPin size={15} className="text-slate-400" /> {patient.city}, {patient.country}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3 shrink-0 pb-2">
                                <button
                                    onClick={() => setDeleteModalOpen(true)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-bold transition-colors border border-red-100"
                                >
                                    <UserX size={16} />
                                    Deactivate Account
                                </button>
                                <button
                                    onClick={() => navigate('/dashboard/users', { state: { activeTab: 'patient' } })}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-colors"
                                >
                                    <ArrowLeft size={16} />
                                    Back
                                </button>
                                <button
                                    onClick={() => navigate(`/dashboard/users/patient/edit/${patient.id}`)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-[#0b5cba] hover:bg-[#094a96] text-white rounded-xl text-sm font-bold transition-colors shadow-sm"
                                >
                                    <Pencil size={16} />
                                    Edit Patient
                                </button>
                            </div>
                        </div>

                        {/* ===== Tabs ===== */}
                        <div className="mt-8 border-t border-slate-100 pt-2">
                            <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide px-2">
                                {TABS.map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`flex items-center gap-2 pb-3 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${
                                            activeTab === tab.key
                                                ? 'text-blue-600 border-blue-600'
                                                : 'text-slate-400 border-transparent hover:text-slate-700'
                                        }`}
                                    >
                                        {tab.icon}
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ===== Tab Content ===== */}
                    {activeTab === 'personal' && <PersonalInfoTab patient={patient} />}
                    {activeTab === 'medical' && <MedicalInfoTab patient={patient} />}
                    {activeTab === 'visits' && <VisitsTab patient={patient} />}
                    {activeTab === 'lab' && <LabResultsTab patient={patient} />}
                    {activeTab === 'radiology' && <RadiologyTab patient={patient} />}
                    {activeTab === 'prescriptions' && <PrescriptionsTab patient={patient} />}
                </div>
            </div>

            <EditUserModal 
                isOpen={editModalOpen} 
                onClose={() => setEditModalOpen(false)} 
                userType="patient" 
                userId={patient.id} 
                onSuccess={loadPatientData} 
            />

            <DeleteConfirmModal 
                isOpen={deleteModalOpen} 
                onClose={() => setDeleteModalOpen(false)} 
                userType="patient" 
                userId={patient.id} 
                userName={patient.name} 
                onSuccess={onDeleteSuccess} 
            />
        </div>
    );
};

export default PatientProfileDetail;