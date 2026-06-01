import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { visitApi } from '../../../api/visit';
import TopBar from '../TopBar';
import {
    User, Activity, Clock, FileText, Plus, Trash2,
    CheckCircle, Paperclip, Pill, ActivitySquare, AlertCircle
} from 'lucide-react';

interface ActiveVisitPageProps {
    onMenuClick?: () => void;
    onProfileClick?: () => void;
}

interface VisitDetails {
    patientName: string;
    age: string | number;
    gender: string;
    bloodType: string;
    allergies: string[];
    vitals: {
        bp: string;
        temp: string | number;
        heartRate: string | number;
        oxygenSaturation: string | number;
        weight: string | number;
        height: string | number;
        bmi: string | number;
    };
    chiefComplaint: string;
    visitId: string | number;
    startedTime: string;
    doctorName: string;
    clinicName: string;
    notes: string;
    status: any;
    attachments: string[];
}

const ActiveVisitPage: React.FC<ActiveVisitPageProps> = ({ onMenuClick, onProfileClick }) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // FIX: support both visitId and appointmentId
    const appointmentId = searchParams.get('appointmentId');
    const visitId = searchParams.get('visitId') || appointmentId;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [visitDetails, setVisitDetails] = useState<VisitDetails | null>(null);
    const [clinicalNotes, setClinicalNotes] = useState('');

    const [diagnoses, setDiagnoses] = useState<any[]>([]);
    const [newDiagnosis, setNewDiagnosis] = useState({
        name: '',
        code: '',
        type: 'Primary',
        justification: ''
    });
    const [showAddDiagnosis, setShowAddDiagnosis] = useState(false);

    const [prescriptions, setPrescriptions] = useState<any[]>([]);
    const [newPrescription, setNewPrescription] = useState({
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: ''
    });
    const [showAddPrescription, setShowAddPrescription] = useState(false);

    const [labOrders] = useState<any[]>([]);
    const [radOrders] = useState<any[]>([]);

    const normalizeDiagnosisType = (type: any) => {
        if (type === 1 || type === '1') return 'Primary';
        if (type === 2 || type === '2') return 'Secondary';
        return type || '—';
    };

    const normalizeGender = (gender: any) => {
        if (gender === null || gender === undefined || gender === '') return '—';
        if (gender === 1 || gender === '1') return 'Male';
        if (gender === 2 || gender === '2') return 'Female';
        return String(gender);
    };

    useEffect(() => {
        const fetchVisitData = async () => {
            if (!visitId) {
                setError('visitId / appointmentId is missing from URL.');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError('');

            try {
                const [visitRes, diagRes, presRes] = await Promise.all([
                    visitApi.getVisit(visitId),
                    visitApi.getDiagnoses(visitId),
                    visitApi.getPrescriptions(visitId),
                ]);

                console.log('visitId used:', visitId);
                console.log('visitRes:', visitRes);
                console.log('visitRes.data:', visitRes?.data);
                console.log('diagRes:', diagRes);
                console.log('diagRes.data:', diagRes?.data);
                console.log('presRes:', presRes);
                console.log('presRes.data:', presRes?.data);

                if (visitRes?.data) {
                    const d = visitRes.data;

                    const patient = d.patient ?? d.patientDto ?? d.patientInfo ?? {};
                    const vs = d.vitalSigns ?? d.vitals ?? {};

                    const attachmentsRaw =
                        d.attachemntsUrl ??
                        d.attachmentsUrl ??
                        d.attachments ??
                        [];

                    setVisitDetails({
                        patientName:
                            patient.fullName ??
                            patient.name ??
                            d.patientName ??
                            '—',

                        age:
                            patient.age ??
                            d.age ??
                            '—',

                        gender:
                            normalizeGender(
                                patient.gender ??
                                d.gender
                            ),

                        bloodType:
                            patient.bloodType ??
                            d.bloodType ??
                            '—',

                        allergies:
                            patient.allergies ??
                            d.allergies ??
                            [],

                        vitals: {
                            bp:
                                vs.bloodPressureSystolic != null &&
                                vs.bloodPressureDiastolic != null
                                    ? `${vs.bloodPressureSystolic}/${vs.bloodPressureDiastolic}`
                                    : '—',
                            temp: vs.temperature ?? '—',
                            heartRate: vs.heartRate ?? '—',
                            oxygenSaturation: vs.oxygenSaturation ?? '—',
                            weight: vs.weight ?? '—',
                            height: vs.height ?? '—',
                            bmi: vs.bmi ?? '—',
                        },

                        chiefComplaint: d.chiefComplaint ?? '—',
                        visitId: d.visitNumber ?? d.visitId ?? visitId,
                        startedTime: d.visitDate
                            ? new Date(d.visitDate).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                              })
                            : '—',
                        doctorName: d.doctorName ?? '—',
                        clinicName: d.clinicName ?? '—',
                        notes: d.notes ?? '',
                        status: d.visitStatus ?? '—',

                        attachments: Array.isArray(attachmentsRaw)
                            ? attachmentsRaw.map((url: string) =>
                                  String(url).replace(/\\\\/g, '/').replace(/\\/g, '/')
                              )
                            : [],
                    });

                    setClinicalNotes(d.notes ?? '');
                } else {
                    setError('Visit data not found.');
                }

                if (diagRes?.data) {
                    const diagList = Array.isArray(diagRes.data) ? diagRes.data : [];
                    setDiagnoses(
                        diagList.map((d: any) => ({
                            id: d.diagnosisId ?? Date.now() + Math.random(),
                            name: d.diagnosis ?? d.name ?? '—',
                            code: d.icdCode ?? d.code ?? '',
                            type: normalizeDiagnosisType(d.diagnosisType ?? d.type),
                        }))
                    );
                }

                if (presRes?.data) {
                    const presData = Array.isArray(presRes.data) ? presRes.data : [];

                    const flatItems = presData.flatMap((p: any) =>
                        (p.items ?? []).map((item: any) => ({
                            id: item.prescriptionItemId ?? item.id ?? Date.now() + Math.random(),
                            name: item.medicineName ?? item.medicationName ?? item.name ?? '—',
                            dosage: item.dosage ?? '',
                            frequency: item.frequency ?? '',
                            duration: item.duration ?? '',
                            instructions: item.instructions ?? '',
                        }))
                    );

                    setPrescriptions(flatItems);
                }
            } catch (error) {
                console.error('Failed to fetch visit details', error);
                setError('Failed to load visit details.');
            } finally {
                setLoading(false);
            }
        };

        fetchVisitData();
    }, [visitId]);

    const handleFinishVisit = async () => {
        try {
            if (!visitId) return;
            await visitApi.markVisitComplete(visitId);
            navigate(`/dashboard/patient-visit?appointmentId=${visitId}`);
        } catch (error) {
            console.error('Failed to complete visit', error);
            navigate('/dashboard/doctor-visits');
        }
    };

    const handleAddDiagnosis = async () => {
        if (!visitId || !newDiagnosis.name.trim()) return;

        try {
            await visitApi.addDiagnosis(visitId, {
                diagnosis: newDiagnosis.name,
                icdCode: newDiagnosis.code,
                diagnosisType: newDiagnosis.type === 'Primary' ? 1 : 2,
                notes: newDiagnosis.justification,
            });

            setDiagnoses([
                ...diagnoses,
                {
                    id: Date.now(),
                    name: newDiagnosis.name,
                    code: newDiagnosis.code,
                    type: newDiagnosis.type,
                },
            ]);

            setNewDiagnosis({
                name: '',
                code: '',
                type: 'Primary',
                justification: '',
            });
            setShowAddDiagnosis(false);
        } catch (error) {
            console.error('Failed to add diagnosis', error);
        }
    };

    const handleAddPrescription = async () => {
        if (!visitId || !newPrescription.name.trim()) return;

        try {
            await visitApi.addPrescription(visitId, {
                notes: '',
                items: [
                    {
                        id: 0,
                        medicineId: 5,
                        medicationName: newPrescription.name,
                        dosage: newPrescription.dosage,
                        frequency: newPrescription.frequency,
                        duration: newPrescription.duration,
                        instructions: newPrescription.instructions,
                        notes: '',
                    },
                ],
            });

            setPrescriptions([
                ...prescriptions,
                {
                    id: Date.now(),
                    ...newPrescription,
                },
            ]);

            setNewPrescription({
                name: '',
                dosage: '',
                frequency: '',
                duration: '',
                instructions: '',
            });
            setShowAddPrescription(false);
        } catch (error) {
            console.error('Failed to add prescription', error);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex flex-col min-h-0 bg-[#f8fafc]">
                <TopBar
                    title="DASHBOARD"
                    onMenuClick={onMenuClick || (() => {})}
                    onProfileClick={onProfileClick}
                    showAddUser={false}
                    isNurse={false}
                />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-slate-400 font-medium animate-pulse">
                        Loading visit...
                    </div>
                </main>
            </div>
        );
    }

    if (error || !visitDetails) {
        return (
            <div className="flex-1 flex flex-col min-h-0 bg-[#f8fafc]">
                <TopBar
                    title="DASHBOARD"
                    onMenuClick={onMenuClick || (() => {})}
                    onProfileClick={onProfileClick}
                    showAddUser={false}
                    isNurse={false}
                />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-red-500 font-semibold mb-2">
                            {error || 'Visit not found.'}
                        </div>
                        <button
                            onClick={() => navigate('/dashboard/doctor-visits')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                        >
                            Back
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-[#f8fafc]">
            <TopBar
                title="DASHBOARD"
                onMenuClick={onMenuClick || (() => {})}
                onProfileClick={onProfileClick}
                showAddUser={false}
                isNurse={false}
            />

            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                <div className="max-w-[1600px] mx-auto">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-black text-slate-800">
                                    {visitDetails.patientName}
                                </h1>
                                <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-bold flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                                    Active Visit
                                </span>
                            </div>
                            <div className="text-slate-500 font-medium flex items-center gap-2">
                                <span className="flex items-center gap-1">
                                    <FileText className="w-4 h-4" />
                                    Visit ID: {visitDetails.visitId}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                <span>Encounter started {visitDetails.startedTime}</span>
                            </div>
                        </div>
                        <button
                            onClick={handleFinishVisit}
                            className="px-6 py-3 bg-[#0f62fe] text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md flex items-center gap-2"
                        >
                            Finish Visit <CheckCircle className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

                        {/* LEFT COLUMN */}
                        <div className="xl:col-span-3 flex flex-col gap-6">

                            {/* Patient Summary */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                                    <User className="w-4 h-4" /> Patient Summary
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500 font-medium text-sm">Age</span>
                                        <span className="font-bold text-slate-800">{visitDetails.age}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500 font-medium text-sm">Gender</span>
                                        <span className="font-bold text-slate-800">{visitDetails.gender}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500 font-medium text-sm">Blood Type</span>
                                        <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                                            {visitDetails.bloodType}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 font-medium text-sm block mb-2">Allergies</span>
                                        <div className="flex flex-wrap gap-2">
                                            {visitDetails.allergies.length === 0 ? (
                                                <span className="text-slate-400 text-xs font-medium">
                                                    None recorded
                                                </span>
                                            ) : (
                                                visitDetails.allergies.map((alg: string, idx: number) => (
                                                    <span
                                                        key={`${alg}-${idx}`}
                                                        className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100"
                                                    >
                                                        {alg}
                                                    </span>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Vitals */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                                    <Activity className="w-4 h-4" /> Recent Vitals
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <div className="text-slate-500 text-xs font-bold mb-1">Blood Pressure</div>
                                        <div className="font-black text-lg text-slate-800">
                                            {visitDetails.vitals.bp} <span className="text-xs font-medium text-slate-400">mmHg</span>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <div className="text-slate-500 text-xs font-bold mb-1">Temperature</div>
                                        <div className="font-black text-lg text-slate-800">
                                            {visitDetails.vitals.temp} <span className="text-xs font-medium text-slate-400">°C</span>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <div className="text-slate-500 text-xs font-bold mb-1">Heart Rate</div>
                                        <div className="font-black text-lg text-slate-800">
                                            {visitDetails.vitals.heartRate} <span className="text-xs font-medium text-slate-400">bpm</span>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <div className="text-slate-500 text-xs font-bold mb-1">SpO₂</div>
                                        <div className="font-black text-lg text-slate-800">
                                            {visitDetails.vitals.oxygenSaturation} <span className="text-xs font-medium text-slate-400">%</span>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 col-span-2">
                                        <div className="text-slate-500 text-xs font-bold mb-1">BMI</div>
                                        <div className="font-black text-lg text-slate-800">{visitDetails.vitals.bmi}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Previous Visits */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-blue-500" /> Previous Visits
                                </h3>
                                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                    Last seen 12 Jan 2024 for routine check-up. No chronic conditions noted.
                                </p>
                            </div>

                            {/* Clinical Notes */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex-1 flex flex-col min-h-[300px]">
                                <h3 className="text-base font-black text-slate-800 mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-blue-500" /> Clinical Notes
                                </h3>
                                <div className="flex gap-2 mb-3 border-b border-slate-100 pb-3 text-slate-500">
                                    <button className="p-1 hover:text-slate-800 font-bold px-2 rounded hover:bg-slate-50">B</button>
                                    <button className="p-1 hover:text-slate-800 italic px-2 rounded hover:bg-slate-50">I</button>
                                    <button className="p-1 hover:text-slate-800 px-2 rounded hover:bg-slate-50">≡</button>
                                    <button className="p-1 hover:text-slate-800 px-2 rounded hover:bg-slate-50">#</button>
                                </div>
                                <textarea
                                    value={clinicalNotes}
                                    onChange={(e) => setClinicalNotes(e.target.value)}
                                    placeholder="Start typing detailed clinical observations here..."
                                    className="flex-1 w-full resize-none outline-none text-slate-700 font-medium placeholder:text-slate-300 placeholder:font-normal leading-relaxed"
                                />
                            </div>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="xl:col-span-9 flex flex-col gap-6">

                            {/* Chief Complaint */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                <h3 className="text-base font-black text-slate-800 mb-4 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-blue-500" /> Chief Complaint
                                </h3>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 font-medium">
                                    {visitDetails.chiefComplaint}
                                </div>
                            </div>

                            {/* Diagnosis Management */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                                        <ActivitySquare className="w-5 h-5 text-blue-500" /> Diagnosis Management
                                    </h3>
                                    <button
                                        onClick={() => setShowAddDiagnosis(!showAddDiagnosis)}
                                        className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg"
                                    >
                                        <Plus className="w-4 h-4" /> Add Diagnosis
                                    </button>
                                </div>

                                {showAddDiagnosis && (
                                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 mb-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Diagnosis Name</label>
                                                <input
                                                    type="text"
                                                    placeholder="Start typing diagnosis name..."
                                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 ring-blue-50"
                                                    value={newDiagnosis.name}
                                                    onChange={e => setNewDiagnosis({ ...newDiagnosis, name: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">ICD-10 Code</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g., J10"
                                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 ring-blue-50"
                                                    value={newDiagnosis.code}
                                                    onChange={e => setNewDiagnosis({ ...newDiagnosis, code: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Diagnosis Type</label>
                                                <select
                                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 ring-blue-50"
                                                    value={newDiagnosis.type}
                                                    onChange={e => setNewDiagnosis({ ...newDiagnosis, type: e.target.value })}
                                                >
                                                    <option>Primary</option>
                                                    <option>Secondary</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Clinical Impression & Justification</label>
                                                <input
                                                    type="text"
                                                    placeholder="Brief rationale for this diagnosis..."
                                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 ring-blue-50"
                                                    value={newDiagnosis.justification}
                                                    onChange={e => setNewDiagnosis({ ...newDiagnosis, justification: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end">
                                            <button
                                                onClick={handleAddDiagnosis}
                                                className="px-5 py-2 bg-[#0f62fe] text-white font-bold rounded-lg flex items-center gap-2 shadow-md hover:bg-blue-700"
                                            >
                                                Save <CheckCircle className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    {diagnoses.length === 0 && (
                                        <p className="text-slate-400 text-sm font-medium italic">No diagnoses recorded yet.</p>
                                    )}
                                    {diagnoses.map(diag => (
                                        <div key={diag.id} className="flex justify-between items-center p-4 border border-blue-100 bg-blue-50/30 rounded-xl group">
                                            <div className="flex items-start gap-4">
                                                <div className="bg-white text-blue-600 font-bold px-3 py-1.5 rounded-lg border border-blue-100 text-sm">
                                                    {diag.code || '—'}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800 text-[15px]">{diag.name}</div>
                                                    <div className="text-xs font-bold text-blue-600 mt-1">{diag.type}</div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setDiagnoses(diagnoses.filter(d => d.id !== diag.id))}
                                                className="text-slate-300 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Prescription Items */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                                        <Pill className="w-5 h-5 text-blue-500" /> Prescription Items
                                    </h3>
                                    <button
                                        onClick={() => setShowAddPrescription(!showAddPrescription)}
                                        className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg"
                                    >
                                        <Plus className="w-4 h-4" /> Add Item
                                    </button>
                                </div>

                                {showAddPrescription && (
                                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 mb-6">
                                        <div className="flex flex-wrap gap-4 mb-4">
                                            <input type="text" placeholder="Medicine name..." className="flex-1 min-w-[150px] px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none" value={newPrescription.name} onChange={e => setNewPrescription({ ...newPrescription, name: e.target.value })} />
                                            <input type="text" placeholder="Dosage" className="w-32 px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none" value={newPrescription.dosage} onChange={e => setNewPrescription({ ...newPrescription, dosage: e.target.value })} />
                                            <input type="text" placeholder="Frequency" className="w-48 px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none" value={newPrescription.frequency} onChange={e => setNewPrescription({ ...newPrescription, frequency: e.target.value })} />
                                            <input type="text" placeholder="Duration" className="w-32 px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none" value={newPrescription.duration} onChange={e => setNewPrescription({ ...newPrescription, duration: e.target.value })} />
                                        </div>
                                        <div className="mb-4">
                                            <input type="text" placeholder="Specific Instructions (Optional)" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none" value={newPrescription.instructions} onChange={e => setNewPrescription({ ...newPrescription, instructions: e.target.value })} />
                                        </div>
                                        <div className="flex justify-end">
                                            <button onClick={handleAddPrescription} className="px-5 py-2 bg-[#0f62fe] text-white font-bold rounded-lg flex items-center gap-2 hover:bg-blue-700">
                                                Save <CheckCircle className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {prescriptions.length === 0 && (
                                        <p className="text-slate-400 text-sm font-medium italic">No prescriptions recorded yet.</p>
                                    )}
                                    {prescriptions.map(pres => (
                                        <div key={pres.id} className="border border-slate-100 rounded-xl overflow-hidden group">
                                            <div className="flex justify-between items-center p-4 bg-white">
                                                <div className="flex-1 grid grid-cols-4 gap-4">
                                                    <div>
                                                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Medicine</div>
                                                        <div className="font-bold text-slate-800">{pres.name}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Dosage</div>
                                                        <div className="font-medium text-slate-600">{pres.dosage}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Frequency</div>
                                                        <div className="font-medium text-slate-600">{pres.frequency}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Duration</div>
                                                        <div className="font-medium text-slate-600">{pres.duration}</div>
                                                    </div>
                                                </div>
                                                <button onClick={() => setPrescriptions(prescriptions.filter(p => p.id !== pres.id))} className="text-slate-300 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                            {pres.instructions && (
                                                <div className="bg-slate-50/80 px-4 py-3 border-t border-slate-100">
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Specific Instructions</div>
                                                    <div className="text-sm font-medium text-blue-800">{pres.instructions}</div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Lab & Radiology Orders */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                <h3 className="text-base font-black text-slate-800 mb-6 flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-blue-500" /> Lab & Radiology Orders
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Lab Test</div>
                                            <button className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">
                                                <Plus className="w-3 h-3" /> Add Item
                                            </button>
                                        </div>
                                        <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none mb-3 text-sm font-medium text-slate-700">
                                            <option>CBC Lab</option>
                                            <option>Lipid Panel</option>
                                        </select>
                                        {labOrders.length === 0
                                            ? <p className="text-slate-400 text-sm font-medium italic">No lab orders added.</p>
                                            : <div className="space-y-2">
                                                {labOrders.map(order => (
                                                    <div key={order.id} className="flex items-center gap-3 p-3 bg-white border border-blue-100 rounded-xl">
                                                        <div className="w-5 h-5 bg-blue-500 text-white rounded flex items-center justify-center shrink-0">
                                                            <CheckCircle className="w-3 h-3" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-800 text-sm">{order.name}</div>
                                                            <div className="text-xs text-slate-500 font-medium">{order.desc}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        }
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Radiology Test</div>
                                            <button className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">
                                                <Plus className="w-3 h-3" /> Add Item
                                            </button>
                                        </div>
                                        <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none mb-3 text-sm font-medium text-slate-700">
                                            <option>Chest X-Ray</option>
                                            <option>MRI Scan</option>
                                        </select>
                                        {radOrders.length === 0
                                            ? <p className="text-slate-400 text-sm font-medium italic">No radiology orders added.</p>
                                            : <div className="space-y-2">
                                                {radOrders.map(order => (
                                                    <div key={order.id} className="flex items-center gap-3 p-3 bg-white border border-blue-100 rounded-xl">
                                                        <div className="w-5 h-5 bg-blue-500 text-white rounded flex items-center justify-center shrink-0">
                                                            <CheckCircle className="w-3 h-3" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-800 text-sm">{order.name}</div>
                                                            <div className="text-xs text-slate-500 font-medium">{order.desc}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>

                            {/* Attachments */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-10">
                                <h3 className="text-base font-black text-slate-800 mb-6 flex items-center gap-2">
                                    <Paperclip className="w-5 h-5 text-blue-500" /> Attachments
                                </h3>
                                <div className="flex gap-4 overflow-x-auto pb-2">
                                    <button className="w-32 h-24 shrink-0 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-blue-400 transition-colors">
                                        <Plus className="w-6 h-6 mb-1 text-slate-400" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Upload</span>
                                    </button>
                                    {visitDetails.attachments?.map((url: string, i: number) => {
                                        const isPdf = url.toLowerCase().endsWith('.pdf');
                                        return (
                                            <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                                                className="w-40 h-24 shrink-0 rounded-xl border border-slate-200 overflow-hidden relative group bg-slate-100 flex items-center justify-center"
                                            >
                                                {isPdf ? (
                                                    <div className="flex flex-col items-center gap-1 text-slate-400">
                                                        <FileText className="w-8 h-8" />
                                                        <span className="text-xs font-bold">PDF</span>
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
                                    {visitDetails.attachments?.length === 0 && (
                                        <div className="text-sm text-slate-400 font-medium self-center">No attachments yet.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ActiveVisitPage;