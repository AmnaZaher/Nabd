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
    Languages,
    History,
    Activity,
    Syringe,
    Brain,
    Dumbbell,
    SlidersHorizontal,
    Download,
    ExternalLink,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
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
    User
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
const QuickActionCard = ({ icon, label }: { icon: React.ReactNode; label: string }) => (<button className="flex flex-col items-center justify-center gap-3 bg-white border-2 border-slate-100 rounded-2xl p-5 hover:border-blue-200 hover:bg-blue-50/30 transition-all group"><div className="text-slate-400 group-hover:text-blue-500 transition-colors">{icon}</div><span className="text-[10px] font-black tracking-widest text-slate-500 uppercase group-hover:text-blue-600 transition-colors">{label}</span></button>);

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
        <div className="w-full lg:w-[280px] shrink-0 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 className="text-[11px] font-black tracking-widest text-slate-500 uppercase mb-6">BASIC MEDICAL DATA</h3>
                <div className="space-y-5">
                    <MedicalDataItem icon={<Droplets size={18} />} iconBg="bg-red-50" iconColor="text-red-500" label="BLOOD TYPE" value={patient.bloodType} />
                    <MedicalDataItem icon={<ShieldCheck size={18} />} iconBg="bg-blue-50" iconColor="text-blue-500" label="INSURANCE TYPE" value={patient.insuranceType} />
                    <MedicalDataItem icon={<Languages size={18} />} iconBg="bg-blue-50" iconColor="text-blue-500" label="PRIMARY LANGUAGE" value={patient.primaryLanguage} />
                    <MedicalDataItem icon={<History size={18} />} iconBg="bg-blue-50" iconColor="text-blue-500" label="LAST VISIT" value={patient.lastVisit} />
                </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div><div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/5 rounded-full"></div>
                <h4 className="text-base font-extrabold mb-2 relative z-10">Precision Monitoring</h4><p className="text-sm text-emerald-100 font-medium leading-relaxed relative z-10">Next routine check-up suggested for November 2024 based on chronic history.</p>
            </div>
        </div>
        <div className="flex-1"><div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
            <div className="flex items-center justify-between mb-8"><h3 className="text-lg font-extrabold text-slate-900 tracking-tight">CLINICAL SUMMARY</h3><button className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1.5"><History size={14} />View History</button></div>
            <div className="flex flex-col md:flex-row gap-8 mb-8">
                <div className="flex-1"><div className="flex items-center gap-2 mb-4"><Pill size={16} className="text-blue-600" /><h4 className="text-xs font-black tracking-widest text-slate-500 uppercase">CURRENT MEDICATIONS</h4></div><div className="space-y-3">{patient.medications?.length > 0 ? patient.medications.map((m, i) => (<div key={i} className="bg-slate-800 rounded-xl px-5 py-4 text-white"><p className="text-sm font-bold mb-1">{m.name}</p><p className="text-xs text-slate-400 font-medium">{m.frequency} • {m.route}</p></div>)) : (<div className="bg-slate-50 rounded-xl px-5 py-4 border border-slate-100"><p className="text-sm text-slate-400">No current medications</p></div>)}</div></div>
                <div className="md:w-[200px] shrink-0"><div className="flex items-center gap-2 mb-4"><AlertTriangle size={16} className="text-red-500" /><h4 className="text-xs font-black tracking-widest text-slate-500 uppercase">ALLERGIES</h4></div>{patient.allergies?.length > 0 ? (<div className="flex flex-wrap gap-2">{patient.allergies.map((a, i) => (<span key={i} className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 px-3.5 py-2 rounded-full text-sm font-bold border border-red-100"><span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>{a}</span>))}</div>) : (<p className="text-sm text-slate-400">No known allergies</p>)}</div>
            </div>
            <div className="mb-8"><h4 className="text-xs font-black tracking-widest text-slate-500 uppercase mb-4">CHRONIC DISEASES</h4>{patient.chronicDiseases?.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 gap-4">{patient.chronicDiseases.map((d, i) => (<div key={i} className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4 hover:border-blue-200 transition-colors"><div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center shrink-0 mt-0.5"><Activity size={18} /></div><div><p className="text-sm font-bold text-slate-900 mb-1">{d.name}</p><p className="text-xs text-slate-400 font-medium">Diagnosed {d.diagnosedDate} • <span className={`font-bold ${d.status === 'Controlled' ? 'text-emerald-500' : d.status === 'Managed' ? 'text-blue-500' : 'text-red-500'}`}>{d.status}</span></p></div></div>))}</div>) : (<div className="bg-slate-50 rounded-xl px-5 py-4 border border-slate-100"><p className="text-sm text-slate-400">No chronic diseases</p></div>)}</div>
            <div className="grid grid-cols-3 gap-4"><QuickActionCard icon={<Syringe size={22} />} label="IMMUNIZATION" /><QuickActionCard icon={<Brain size={22} />} label="MENTAL HEALTH" /><QuickActionCard icon={<Dumbbell size={22} />} label="LIFESTYLE" /></div>
        </div></div>
    </div>
);

const VISITS_PER_PAGE = 4;
const visitStatusStyles: Record<string, string> = { 'Completed': 'bg-emerald-50 text-emerald-600 border-emerald-200', 'In Progress': 'bg-blue-50 text-blue-600 border-blue-200', 'Waiting': 'bg-amber-50 text-amber-600 border-amber-200', 'Cancelled': 'bg-red-50 text-red-600 border-red-200' };

const VisitsTab = ({ patient }: { patient: PatientProfile }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedVisit, setSelectedVisit] = useState<any>(null);
    const visits = patient.visits || [];
    const totalPages = Math.ceil(visits.length / VISITS_PER_PAGE);
    const paged = visits.slice((currentPage - 1) * VISITS_PER_PAGE, currentPage * VISITS_PER_PAGE);

    if (selectedVisit != null) {
        return <VisitDetailsView visit={selectedVisit} onBack={() => setSelectedVisit(null)} />;
    }

    return (<div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 md:px-8 py-5 flex items-center justify-between border-b border-slate-100"><h3 className="text-lg font-extrabold text-slate-900">Visit History</h3><div className="flex items-center gap-2"><button className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"><SlidersHorizontal size={18} /></button><button className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"><Download size={18} /></button></div></div>
            <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-slate-100"><th className="px-6 md:px-8 py-4 text-left text-[11px] font-black tracking-widest text-slate-400 uppercase">Visit Number</th><th className="px-4 py-4 text-left text-[11px] font-black tracking-widest text-slate-400 uppercase">Visit Date</th><th className="px-4 py-4 text-left text-[11px] font-black tracking-widest text-slate-400 uppercase">Doctor</th><th className="px-4 py-4 text-left text-[11px] font-black tracking-widest text-slate-400 uppercase">Department</th><th className="px-4 py-4 text-left text-[11px] font-black tracking-widest text-slate-400 uppercase">Visit Type</th><th className="px-4 py-4 text-left text-[11px] font-black tracking-widest text-slate-400 uppercase">Status</th><th className="px-6 md:px-8 py-4 text-left text-[11px] font-black tracking-widest text-slate-400 uppercase">Actions</th></tr></thead>
            <tbody>{paged.map((v) => (<tr key={v.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"><td className="px-6 md:px-8 py-5"><span className="text-sm font-bold text-blue-600">{v.visitNumber}</span></td><td className="px-4 py-5"><p className="text-sm font-bold text-slate-900">{v.date}</p><p className="text-xs text-slate-400">{v.time}</p></td><td className="px-4 py-5"><div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${v.doctor?.color || 'bg-slate-100'}`}>{v.doctor?.initials || '??'}</div><span className="text-sm font-bold text-slate-900 whitespace-nowrap">{v.doctor?.name || 'Unknown'}</span></div></td><td className="px-4 py-5"><span className="text-sm font-medium text-slate-600">{v.department}</span></td><td className="px-4 py-5"><span className="text-sm font-medium text-slate-600">{v.visitType}</span></td><td className="px-4 py-5"><span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold border ${visitStatusStyles[v.status] || ''}`}>{v.status}</span></td><td className="px-6 md:px-8 py-5"><button onClick={() => setSelectedVisit(v)} className="flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700">View Details<ExternalLink size={14} /></button></td></tr>))}</tbody></table></div>
            <div className="px-6 md:px-8 py-4 flex items-center justify-between border-t border-slate-100"><p className="text-sm text-slate-500">Showing {paged.length} of {patient.visitStats?.totalVisits || visits.length} visits</p><div className="flex items-center gap-1.5"><button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30"><ChevronLeft size={16} /></button>{Array.from({ length: Math.max(totalPages, 1) }, (_, i) => i + 1).slice(0, 3).map(p => (<button key={p} onClick={() => setCurrentPage(p)} className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold ${currentPage === p ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{p}</button>))}<button onClick={() => setCurrentPage(p => Math.min(totalPages || 1, p + 1))} disabled={currentPage >= totalPages} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30"><ChevronRight size={16} /></button></div></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center justify-between"><div><p className="text-[11px] font-black tracking-widest text-slate-400 uppercase mb-2">TOTAL VISITS</p><p className="text-3xl font-extrabold text-slate-900">{String(patient.visitStats?.totalVisits || visits.length).padStart(2, '0')}</p></div><div className="flex items-center gap-1.5 text-emerald-500"><TrendingUp size={16} /><span className="text-sm font-bold">{patient.visitStats?.totalVisitsChange || '+0%'}</span></div></div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center justify-between"><div><p className="text-[11px] font-black tracking-widest text-slate-400 uppercase mb-2">DEPARTMENTS</p><p className="text-3xl font-extrabold text-slate-900">{String(patient.visitStats?.departments || 0).padStart(2, '0')}</p></div><p className="text-xs font-bold text-slate-400 text-right max-w-[100px]">{patient.visitStats?.departmentsLabel || ''}</p></div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center justify-between"><div><p className="text-[11px] font-black tracking-widest text-slate-400 uppercase mb-2">AVG. VISIT TIME</p><p className="text-3xl font-extrabold text-slate-900">{patient.visitStats?.avgVisitTime || '0m'}</p></div><p className="text-xs font-bold text-slate-400 text-right max-w-[120px]">{patient.visitStats?.avgVisitTimeLabel || ''}</p></div>
        </div>
    </div>);
};

const labStatusStyles: Record<string, string> = { 'Finalized': 'bg-emerald-50 text-emerald-700 border-emerald-200', 'Review Required': 'bg-red-50 text-red-600 border-red-200', 'Pending': 'bg-slate-100 text-slate-600 border-slate-200' };
const labIconMap: Record<string, React.ReactNode> = { blood: <Droplets size={18} />, lipid: <Activity size={18} />, glucose: <FlaskConical size={18} />, liver: <Beaker size={18} /> };

const LabResultsTab = ({ patient }: { patient: PatientProfile }) => {
    const navigate = useNavigate();
    const labResults = patient.labResults || [];
    const v = patient.vitals || { heartRate: 0, heartRateStatus: 'Stable', heartRateHistory: [] };
    const maxHR = v.heartRateHistory.length > 0 ? Math.max(...v.heartRateHistory) : 100;
    return (<div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 md:px-8 py-5 flex items-center justify-between border-b border-slate-100"><h3 className="text-lg font-extrabold text-slate-900">Laboratory Results</h3><div className="flex items-center gap-3"><button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50"><SlidersHorizontal size={16} />Filter</button><button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700"><Download size={16} />Export All</button></div></div>
            <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-slate-100"><th className="px-6 md:px-8 py-4 text-left text-[11px] font-black tracking-widest text-slate-400 uppercase">Test Name</th><th className="px-4 py-4 text-left text-[11px] font-black tracking-widest text-slate-400 uppercase">Date</th><th className="px-4 py-4 text-left text-[11px] font-black tracking-widest text-slate-400 uppercase">Doctor</th><th className="px-4 py-4 text-left text-[11px] font-black tracking-widest text-slate-400 uppercase">Status</th><th className="px-6 md:px-8 py-4 text-left text-[11px] font-black tracking-widest text-slate-400 uppercase">Action</th></tr></thead>
            <tbody>{labResults.map(l => (<tr key={l.id} className="border-b border-slate-50 hover:bg-slate-50/50"><td className="px-6 md:px-8 py-5"><div className="flex items-center gap-4"><div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">{labIconMap[l.icon] || <FlaskConical size={18} />}</div><div><p className="text-sm font-bold text-slate-900">{l.testName}</p><p className="text-xs text-slate-400">{l.testSubtitle}</p></div></div></td><td className="px-4 py-5"><span className="text-sm font-medium text-slate-600">{l.date}</span></td><td className="px-4 py-5"><div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${l.doctor?.color || 'bg-slate-100'}`}>{l.doctor?.initials || '??'}</div><span className="text-sm font-bold text-slate-900 whitespace-nowrap">{l.doctor?.name || 'Unknown'}</span></div></td><td className="px-4 py-5"><span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black tracking-wider uppercase border ${labStatusStyles[l.status] || ''}`}>{l.status === 'Review Required' && <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>}{l.status}</span></td><td className="px-6 md:px-8 py-5"><button onClick={() => navigate(`/dashboard/users/patient/${patient.id}/lab/${l.id}`)} className="flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700">View<ArrowRight size={14} /></button></td></tr>))}{labResults.length === 0 && <tr><td colSpan={5} className="px-8 py-12 text-center"><p className="text-sm text-slate-400">No lab results</p></td></tr>}</tbody></table></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"><div className="flex items-center justify-between mb-4"><h4 className="text-[11px] font-black tracking-widest text-slate-400 uppercase">PATIENT VITALS</h4><div className="flex items-center gap-1.5"><TrendingUp size={14} className="text-emerald-500" /><span className="text-xs font-bold text-emerald-500">{v.heartRateStatus}</span></div></div><div className="mb-5"><span className="text-4xl font-extrabold text-slate-900">{v.heartRate}</span><span className="text-lg font-bold text-slate-400 ml-2">BPM</span></div><div className="flex items-end gap-2 h-12">{v.heartRateHistory.map((hr: number, i: number) => (<div key={i} className={`flex-1 rounded-full ${hr === v.heartRate ? 'bg-blue-600' : 'bg-blue-200'}`} style={{ height: `${Math.max((hr / maxHR) * 48, 16)}px` }}></div>))}</div></div>
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white relative overflow-hidden flex items-center"><div className="flex-1 relative z-10"><h4 className="text-lg font-extrabold mb-2">Automated Analysis</h4><p className="text-sm text-blue-200 font-medium leading-relaxed">AI-driven insight suggests a slight upward trend in lipid levels over the last 6 months. Recommend dietary review.</p></div><div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 ml-4 relative z-10"><Bot size={28} /></div><div className="absolute -top-6 -right-6 w-32 h-32 bg-white/5 rounded-full"></div></div>
        </div>
    </div>);
};

const RADIOLOGY_PER_PAGE = 5;
const radiologyIconMap: Record<string, React.ReactNode> = { xray: <Bone size={18} />, mri: <Brain size={18} />, ct: <Scan size={18} />, ultrasound: <MonitorDot size={18} />, emergency: <CircleAlert size={18} /> };
const radiologyIconBg: Record<string, string> = { xray: 'bg-blue-50 text-blue-600', mri: 'bg-purple-50 text-purple-600', ct: 'bg-emerald-50 text-emerald-600', ultrasound: 'bg-amber-50 text-amber-600', emergency: 'bg-red-50 text-red-600' };

const RadiologyTab = ({ patient }: { patient: PatientProfile }) => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const radiology = patient.radiology || [];
    const summary = patient.radiologySummary || { totalScans: 0, activeReports: 0, pendingReview: 0, nextScan: { type: 'N/A', date: '-' } };
    const totalPages = Math.ceil(radiology.length / RADIOLOGY_PER_PAGE);
    const paged = radiology.slice((currentPage - 1) * RADIOLOGY_PER_PAGE, currentPage * RADIOLOGY_PER_PAGE);

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-[320px] shrink-0 space-y-6">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <p className="text-[11px] font-black tracking-widest text-blue-600 uppercase mb-4">NEXT SCHEDULED SCAN</p>
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0"><Bone size={20} /></div>
                        <div><p className="text-base font-bold text-slate-900">{summary.nextScan?.type || 'None'}</p><p className="text-xs text-slate-400 font-medium">{summary.nextScan?.date || '-'}</p></div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h3 className="text-[11px] font-black tracking-widest text-slate-500 uppercase mb-5">RADIOLOGY SUMMARY</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between"><span className="text-sm font-medium text-slate-500">Total Scans</span><span className="text-sm font-bold text-slate-900">{summary.totalScans}</span></div>
                        <div className="flex items-center justify-between"><span className="text-sm font-medium text-slate-500">Active Reports</span><span className="text-sm font-bold text-slate-900">{summary.activeReports}</span></div>
                        <div className="flex items-center justify-between"><span className="text-sm font-medium text-slate-500">Pending Review</span><span className={`text-sm font-bold ${summary.pendingReview > 0 ? 'text-red-500' : 'text-slate-900'}`}>{summary.pendingReview}</span></div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-6 text-white relative overflow-hidden cursor-pointer hover:from-slate-600 hover:to-slate-700 transition-all"><div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,rgba(100,150,255,0.3),transparent_70%)]"></div><div className="relative z-10 flex flex-col items-center text-center pt-4 pb-2"><div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4"><MonitorDot size={24} /></div><p className="text-base font-extrabold">Browse PACS Archive</p></div></div>
            </div>
            <div className="flex-1">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 md:px-8 py-5 flex items-center justify-between border-b border-slate-100"><h3 className="text-lg font-extrabold text-slate-900">Radiology Reports</h3><button className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"><SlidersHorizontal size={16} />FILTER</button></div>
                    <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-slate-100"><th className="px-6 md:px-8 py-4 text-left text-[11px] font-black tracking-widest text-slate-400 uppercase">Scan Type</th><th className="px-4 py-4 text-left text-[11px] font-black tracking-widest text-slate-400 uppercase">Date</th><th className="px-4 py-4 text-left text-[11px] font-black tracking-widest text-slate-400 uppercase">Doctor</th><th className="px-6 md:px-8 py-4 text-left text-[11px] font-black tracking-widest text-slate-400 uppercase">Action</th></tr></thead>
                    <tbody>{paged.map((scan) => (<tr key={scan.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"><td className="px-6 md:px-8 py-5"><div className="flex items-center gap-4"><div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${radiologyIconBg[scan.icon] || 'bg-slate-100 text-slate-600'}`}>{radiologyIconMap[scan.icon] || <Radiation size={18} />}</div><span className="text-sm font-bold text-slate-900">{scan.scanType}</span></div></td><td className="px-4 py-5"><span className="text-sm font-medium text-slate-600">{scan.date}</span></td><td className="px-4 py-5"><span className="text-sm font-medium text-slate-600">{scan.doctor}</span></td><td className="px-6 md:px-8 py-5">{scan.isUrgent ? (<button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-colors">Urgent Review</button>) : (<button onClick={() => navigate(`/dashboard/users/patient/${patient.id}/radiology/${scan.id}`)} className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold rounded-xl border border-blue-200 transition-colors">View Report</button>)}</td></tr>))} {radiology.length === 0 && (<tr><td colSpan={4} className="px-8 py-12 text-center"><p className="text-sm text-slate-400 font-medium">No radiology records available</p></td></tr>)}</tbody></table></div>
                    <div className="px-6 md:px-8 py-4 flex items-center justify-between border-t border-slate-100"><p className="text-sm text-slate-500 font-medium">Showing {paged.length} of {summary.totalScans || radiology.length} records</p><div className="flex items-center gap-1.5"><button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-30"><ChevronLeft size={16} /></button>{Array.from({ length: Math.max(totalPages, 1) }, (_, i) => i + 1).slice(0, 3).map((page) => (<button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${currentPage === page ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>{page}</button>))}<button onClick={() => setCurrentPage((p) => Math.min(totalPages || 1, p + 1))} disabled={currentPage >= totalPages} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-30"><ChevronRight size={16} /></button></div></div>
                </div>
            </div>
        </div>
    );
};

const PRESCRIPTIONS_PER_PAGE = 4;
const PrescriptionsTab = ({ patient }: { patient: PatientProfile }) => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const prescriptions = patient.prescriptions || [];
    const summary = patient.prescriptionSummary || { totalPrescriptions: 0, activeTreatmentNote: 'No active plan', recentNote: 'No recent notes' };
    const totalPages = Math.ceil(prescriptions.length / PRESCRIPTIONS_PER_PAGE);
    const paged = prescriptions.slice((currentPage - 1) * PRESCRIPTIONS_PER_PAGE, currentPage * PRESCRIPTIONS_PER_PAGE);

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 md:px-8 py-5 flex items-center justify-between border-b border-slate-100"><h3 className="text-lg font-extrabold text-slate-900">Prescription History</h3><button className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"><span className="text-lg leading-none">+</span>New Prescription</button></div>
                <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-slate-100"><th className="px-6 md:px-8 py-4 text-left text-[11px] font-black tracking-widest text-slate-400 uppercase">Doctor</th><th className="px-4 py-4 text-left text-[11px] font-black tracking-widest text-slate-400 uppercase">Date</th><th className="px-4 py-4 text-left text-[11px] font-black tracking-widest text-slate-400 uppercase">Medications</th><th className="px-6 md:px-8 py-4 text-left text-[11px] font-black tracking-widest text-slate-400 uppercase">Action</th></tr></thead>
                <tbody>{paged.map((rx) => (<tr key={rx.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"><td className="px-6 md:px-8 py-5"><div className="flex items-center gap-4"><div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${rx.doctor?.color || 'bg-slate-100'}`}>{rx.doctor?.initials || '??'}</div><div><p className="text-sm font-bold text-slate-900">{rx.doctor?.name || 'Unknown'}</p><p className="text-xs text-slate-400 font-medium">{rx.doctor?.specialty || 'Medical Staff'}</p></div></div></td><td className="px-4 py-5"><span className="text-sm font-medium text-slate-600">{rx.date}</span></td><td className="px-4 py-5"><div className="flex items-center gap-2"><span className="inline-flex px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg border border-blue-100">{rx.medicationCount} Medication{rx.medicationCount !== 1 ? 's' : ''}</span>{rx.hasAlert && (<span className="w-2 h-2 bg-red-500 rounded-full shrink-0"></span>)}</div></td><td className="px-6 md:px-8 py-5"><button onClick={() => navigate(`/dashboard/users/patient/${patient.id}/prescription/${rx.id}`)} className="flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">View Details <ExternalLink size={14} /></button></td></tr>))}{prescriptions.length === 0 && (<tr><td colSpan={4} className="px-8 py-12 text-center"><p className="text-sm text-slate-400 font-medium">No prescriptions available</p></td></tr>)}</tbody></table></div>
                <div className="px-6 md:px-8 py-4 flex items-center justify-between border-t border-slate-100"><p className="text-sm text-slate-500 font-medium">Showing {paged.length} of {summary.totalPrescriptions || prescriptions.length} historical prescriptions</p><div className="flex items-center gap-1.5"><button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-30"><ChevronLeft size={16} /></button>{Array.from({ length: Math.max(totalPages, 1) }, (_, i) => i + 1).slice(0, 3).map((page) => (<button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${currentPage === page ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>{page}</button>))}<button onClick={() => setCurrentPage((p) => Math.min(totalPages || 1, p + 1))} disabled={currentPage >= totalPages} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-30"><ChevronRight size={16} /></button></div></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"><div className="flex items-center gap-2 mb-4"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div><h4 className="text-sm font-extrabold text-emerald-600">Active Treatment</h4></div><p className="text-sm text-slate-500 font-medium leading-relaxed">{summary.activeTreatmentNote}</p></div>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"><div className="flex items-center gap-2 mb-4"><AlertTriangle size={14} className="text-red-500" /><h4 className="text-sm font-extrabold text-slate-900">Drug Allergies</h4></div>{patient.allergies?.length > 0 ? (<div className="flex flex-wrap gap-2">{patient.allergies.map((allergy, i) => (<span key={i} className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100 uppercase tracking-wide">{allergy}</span>))}</div>) : (<p className="text-sm text-slate-400 font-medium">No known drug allergies</p>)}</div>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"><div className="flex items-center gap-2 mb-4"><FileText size={14} className="text-slate-500" /><h4 className="text-sm font-extrabold text-slate-900">Recent Notes</h4></div><p className="text-sm text-slate-500 font-medium leading-relaxed italic">{summary.recentNote}</p></div>
            </div>
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
            // Fetch patient by ID or National ID (searching via SearchKey)
            const data = await patientApi.getPatientById(id);
            if (data) {
                // Supplement with visit history if available
                try {
                    const visits = await patientApi.getVisitHistory();
                    if (visits) data.visits = visits;
                } catch (e) {
                     console.log("Visit history fetch failed, using default data");
                }
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