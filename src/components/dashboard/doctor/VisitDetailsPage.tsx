import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { visitApi } from '../../../api/visit';
import TopBar from '../TopBar';
import {
    ChevronRight, Calendar, User, Activity, Thermometer,
    Heart, Wind, FileText, Pill, ClipboardList, Paperclip,
    ArrowLeft, Stethoscope, Building2, UserCheck, BookOpen
} from 'lucide-react';

interface VisitDetailsPageProps {
    onMenuClick?: () => void;
    onProfileClick?: () => void;
}

const VisitDetailsPage: React.FC<VisitDetailsPageProps> = ({ onMenuClick, onProfileClick }) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const visitId = searchParams.get('appointmentId') || searchParams.get('visitId');
    const [loading, setLoading] = useState(true);
    const [visit, setVisit] = useState<any>(null);
    const [diagnoses, setDiagnoses] = useState<any[]>([]);
    const [prescriptions, setPrescriptions] = useState<any[]>([]);
    useEffect(() => {
        const fetchVisit = async () => {
            if (!visitId) return;
            setLoading(true);
            try {
                const [visitRes, diagRes, presRes] = await Promise.all([
                    visitApi.getVisit(visitId),
                    visitApi.getDiagnoses(visitId),
                    visitApi.getPrescriptions(visitId),
                ]);
                if (visitRes?.data) setVisit(visitRes.data);
                // Diagnoses: data is directly an array
                const diagList = Array.isArray(diagRes?.data) ? diagRes.data : [];
                setDiagnoses(diagList);

                // Prescriptions: data is array of prescriptions, each with items[] — flatten all items
                const presData = Array.isArray(presRes?.data) ? presRes.data : [];
                const flatItems = presData.flatMap((p: any) => p.items ?? []);
                setPrescriptions(flatItems);
            } catch (err) {
                console.error('Failed to fetch visit details', err);
            } finally {
                setLoading(false);
            }
        };
        fetchVisit();
    }, [visitId]);

    if (loading) {
        return (
            <div className="flex-1 flex flex-col min-h-0 bg-[#f8fafc]">
                <TopBar title="VISITS" onMenuClick={onMenuClick || (() => { })} onProfileClick={onProfileClick} showAddUser={false} isNurse={false} />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-slate-400 font-medium animate-pulse">Loading visit details...</div>
                </main>
            </div>
        );
    }

    if (!visit) {
        return (
            <div className="flex-1 flex flex-col min-h-0 bg-[#f8fafc]">
                <TopBar title="VISITS" onMenuClick={onMenuClick || (() => { })} onProfileClick={onProfileClick} showAddUser={false} isNurse={false} />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-slate-400 font-medium">Visit not found.</div>
                </main>
            </div>
        );
    }

    const vs = visit.vitalSigns;
    const attachments: string[] = (visit.attachemntsUrl ?? []).map((url: string) =>
        url.replace(/\\\\/g, '/').replace(/\\/g, '/')
    );

    const visitDate = new Date(visit.visitDate);
    const formattedDate = visitDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const formattedTime = visitDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const isClosed = visit.visitStatus?.toLowerCase() === 'closed';

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-[#f8fafc]">
            <TopBar
                title="VISITS"
                onMenuClick={onMenuClick || (() => { })}
                onProfileClick={onProfileClick}
                showAddUser={false}
                isNurse={false}
            />

            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-[1300px] mx-auto">

                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 mb-6 text-sm font-semibold text-slate-400">
                        <button onClick={() => navigate(-1)} className="hover:text-blue-600 transition-colors flex items-center gap-1">
                            <ArrowLeft className="w-4 h-4" /> Visits
                        </button>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-blue-600">View Details</span>
                    </div>

                    {/* Status + Visit Type Header */}
                    <div className="mb-2 flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${isClosed ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                            {isClosed ? 'Completed' : 'Open'}
                        </span>
                        <span className="text-slate-400 text-sm font-medium">Order #{visit.visitNumber}</span>
                    </div>

                    <h1 className="text-3xl font-black text-slate-800 mb-2">{visit.visitType}</h1>

                    <div className="flex items-center gap-4 text-slate-500 font-medium text-sm mb-8">
                        <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {formattedDate} • {formattedTime}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <User className="w-4 h-4" />
                            {visit.doctorName}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                        {/* LEFT / MAIN COLUMN */}
                        <div className="xl:col-span-2 flex flex-col gap-6">

                            {/* Vitals Row */}
                            {vs && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {/* Blood Pressure */}
                                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Blood Pressure</span>
                                            <Activity className="w-4 h-4 text-blue-400" />
                                        </div>
                                        <div className="text-2xl font-black text-slate-800">
                                            {vs.bloodPressureSystolic && vs.bloodPressureDiastolic
                                                ? `${vs.bloodPressureSystolic}/${vs.bloodPressureDiastolic}`
                                                : '—'}
                                            <span className="text-xs font-medium text-slate-400 ml-1">mmHg</span>
                                        </div>
                                        <div className="flex gap-1 mt-3">
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} className={`h-1.5 flex-1 rounded-full ${i === 3 ? 'bg-blue-600' : 'bg-slate-100'}`} />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Heart Rate */}
                                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Heart Rate</span>
                                            <Heart className="w-4 h-4 text-red-400" />
                                        </div>
                                        <div className="text-2xl font-black text-slate-800">
                                            {vs.heartRate ?? '—'}
                                            <span className="text-xs font-medium text-slate-400 ml-1">bpm</span>
                                        </div>
                                        <div className="flex gap-1 mt-3">
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} className={`h-1.5 flex-1 rounded-full ${i === 2 ? 'bg-red-500' : 'bg-slate-100'}`} />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Temperature */}
                                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Temperature</span>
                                            <Thermometer className="w-4 h-4 text-orange-400" />
                                        </div>
                                        <div className="text-2xl font-black text-slate-800">
                                            {vs.temperature ?? '—'}
                                            <span className="text-xs font-medium text-slate-400 ml-1">°C</span>
                                        </div>
                                        <div className="text-xs text-slate-400 font-medium mt-3">Normal range</div>
                                    </div>

                                    {/* SpO2 */}
                                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SpO₂</span>
                                            <Wind className="w-4 h-4 text-cyan-400" />
                                        </div>
                                        <div className="text-2xl font-black text-slate-800">
                                            {vs.oxygenSaturation ?? '—'}
                                            <span className="text-xs font-medium text-slate-400 ml-1">%</span>
                                        </div>
                                        <div className="text-xs text-slate-400 font-medium mt-3">On room air</div>
                                    </div>
                                </div>
                            )}

                            {/* Chief Complaint */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                <h3 className="text-base font-black text-slate-800 mb-3 flex items-center gap-2">
                                    <Stethoscope className="w-5 h-5 text-blue-500" /> Chief Complaint
                                </h3>
                                <p className="text-slate-600 font-medium bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    {visit.chiefComplaint || '—'}
                                </p>
                            </div>

                            {/* Diagnosis — placeholder until API provides it */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                <h3 className="text-base font-black text-slate-800 mb-4 flex items-center gap-2">
                                    <ClipboardList className="w-5 h-5 text-blue-500" /> Diagnosis
                                </h3>
                                {diagnoses.length === 0 ? (
                                    <div className="text-slate-400 text-sm font-medium italic">No diagnosis records for this visit.</div>
                                ) : (
                                    <div className="space-y-3">
                                        {diagnoses.map((diag: any, i: number) => (
                                            <div key={diag.id || i} className="p-4 border border-blue-100 bg-blue-50/30 rounded-xl">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="font-bold text-slate-800">{diag.diagnosis}</div>

                                                    <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                                                        {diag.diagnosisType}
                                                    </span>
                                                </div>
                                                <div className="flex gap-6 text-sm text-slate-500 font-medium">
                                                    <span>ICD-10: <span className="font-bold text-slate-700">{diag.icdCode || '—'}</span></span>
                                                    {diag.notes && <span>Notes: {diag.notes}</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Prescription — placeholder */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                <h3 className="text-base font-black text-slate-800 mb-4 flex items-center gap-2">
                                    <Pill className="w-5 h-5 text-blue-500" /> Prescription
                                </h3>
                                {prescriptions.length === 0 ? (
                                    <div className="text-slate-400 text-sm font-medium italic">No prescriptions for this visit.</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-slate-100">
                                                    <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Medication</th>
                                                    <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Dosage</th>
                                                    <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Frequency</th>
                                                    <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</th>
                                                    <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Instructions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {prescriptions.map((pres: any, i: number) => (
                                                    <tr key={pres.id || i} className="border-b border-slate-50">
                                                        <td className="py-3 font-bold text-blue-600">{pres.medicineName}</td>
                                                        <td className="py-3 text-slate-600 font-medium">{pres.dosage || '—'}</td>
                                                        <td className="py-3 text-slate-600 font-medium">{pres.frequency || '—'}</td>
                                                        <td className="py-3 text-slate-600 font-medium">{pres.duration || '—'}</td>
                                                        <td className="py-3 text-slate-500 font-medium">{pres.instructions || '—'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Doctor Notes */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                <h3 className="text-base font-black text-slate-800 mb-4 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-blue-500" /> Doctor Notes
                                </h3>
                                <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 text-slate-700 font-medium leading-relaxed min-h-[80px]">
                                    {visit.notes || <span className="text-slate-400 italic">No notes recorded.</span>}
                                </div>
                            </div>

                        </div>

                        {/* RIGHT SIDEBAR */}
                        <div className="flex flex-col gap-6">

                            {/* Orders & Records */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                <h3 className="text-base font-black text-slate-800 mb-4">Orders & Records</h3>
                                <div className="text-slate-400 text-sm font-medium italic">
                                    No orders available from API.
                                </div>
                            </div>

                            {/* Administration */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                <h3 className="text-base font-black text-slate-800 mb-5">Administration</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Attending Physician</div>
                                        <div className="font-bold text-slate-800 flex items-center gap-2">
                                            <UserCheck className="w-4 h-4 text-blue-400" />
                                            {visit.doctorName || '—'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Department</div>
                                        <div className="font-bold text-slate-800 flex items-center gap-2">
                                            <Building2 className="w-4 h-4 text-blue-400" />
                                            {visit.clinicName || '—'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Patient File</div>
                                        <div className="font-bold text-slate-800 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-blue-400" />
                                            #{visit.patientFileNumber || '—'}
                                        </div>
                                    </div>
                                    {visit.followUpDate && (
                                        <div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Follow-up Date</div>
                                            <div className="font-bold text-slate-800 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-blue-400" />
                                                {new Date(visit.followUpDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Attachments */}
                            {attachments.length > 0 && (
                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                    <h3 className="text-base font-black text-slate-800 mb-4 flex items-center gap-2">
                                        <Paperclip className="w-5 h-5 text-blue-500" /> Attachments
                                    </h3>
                                    <div className="flex flex-col gap-3">
                                        {attachments.map((url, i) => {
                                            const isPdf = url.toLowerCase().endsWith('.pdf');
                                            return (
                                                <a
                                                    key={i}
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="relative w-full h-32 rounded-xl border border-slate-200 overflow-hidden group bg-slate-100 flex items-center justify-center"
                                                >
                                                    {isPdf ? (
                                                        <div className="flex flex-col items-center gap-1 text-slate-400">
                                                            <FileText className="w-8 h-8" />
                                                            <span className="text-xs font-bold">PDF Document</span>
                                                        </div>
                                                    ) : (
                                                        <img src={url} alt={`attachment-${i}`} className="w-full h-full object-cover" />
                                                    )}
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <span className="text-white text-xs font-bold">Open</span>
                                                    </div>
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default VisitDetailsPage;