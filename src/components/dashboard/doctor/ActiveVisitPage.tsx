import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { visitApi } from '../../../api/visit';
import { getAvailableLabTests } from '../../../api/labs';
import { getAvailableRadiologyTests, createRadiologyRequest } from '../../../api/radiology';
import TopBar from '../TopBar';
import {
    User, Activity, Clock, FileText, Plus, Trash2,
    CheckCircle, Paperclip, Pill, ActivitySquare, AlertCircle
} from 'lucide-react';

const RadInfoBox = ({
    title,
    value,
    colorClass,
    onClick
}: {
    title: string,
    value: string,
    colorClass: 'green' | 'amber' | 'red',
    onClick: () => void
}) => {
    const bgColors = {
        green: 'bg-emerald-50/50',
        amber: 'bg-amber-50/50',
        red: 'bg-red-50/50'
    };
    const textColors = {
        green: 'text-emerald-600',
        amber: 'text-amber-600',
        red: 'text-red-600'
    };
    const barColors = {
        green: 'bg-emerald-500',
        amber: 'bg-amber-500',
        red: 'bg-red-600'
    };

    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex-1 min-w-[110px] rounded-2xl ${bgColors[colorClass]} border border-white p-3 flex flex-col items-center justify-center transition-transform hover:scale-[1.02] active:scale-95 shadow-sm`}
        >
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{title}</span>
            <span className={`text-sm font-bold ${textColors[colorClass]} mb-2`}>{value}</span>
            <div className={`h-1 w-full rounded-full ${barColors[colorClass]}`}></div>
        </button>
    );
};

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
    fileNumber: string;
}

interface MedicineOption {
    id: string;
    name: string;
}

const ActiveVisitPage: React.FC<ActiveVisitPageProps> = ({ onMenuClick, onProfileClick }) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

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
    const [availableMedicines, setAvailableMedicines] = useState<MedicineOption[]>([]);
    const [newPrescription, setNewPrescription] = useState({
        medicineId: '',
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: ''
    });
    const [showAddPrescription, setShowAddPrescription] = useState(false);

    const [labOrders, setLabOrders] = useState<any[]>([]);
    const [radOrders, setRadOrders] = useState<any[]>([]);

    const [availableLabTests, setAvailableLabTests] = useState<any[]>([]);
    const [availableRadTests, setAvailableRadTests] = useState<any[]>([]);
    const [selectedLabTest, setSelectedLabTest] = useState('');
    const [selectedRadTest, setSelectedRadTest] = useState('');

    const [radDetails, setRadDetails] = useState({
        isPregnant: 'Negative',
        allergiesToContrast: false,
        allergyDetails: '',
        diabetes: false,
        onMetformin: false,
        cardiacProblems: false,
        cardiacDetails: '',
        notes: ''
    });

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

    const normalizeMedicines = (response: any): MedicineOption[] => {
        const rawData = response?.data ?? response ?? [];
        if (!Array.isArray(rawData)) return [];

        return rawData.map((item: any) => ({
            id: String(item.medicineId),
            name: String(item.medicinName ?? '')
        })).filter((item: MedicineOption) => item.id && item.name);
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
                const [visitRes, diagRes, presRes, labTestsRes, radTestsRes, medicineRes] = await Promise.all([
                    visitApi.getVisit(visitId),
                    visitApi.getDiagnoses(visitId),
                    visitApi.getPrescriptions(visitId),
                    getAvailableLabTests(),
                    getAvailableRadiologyTests(),
                    visitApi.getAllMedicine(),
                ]);

                const labsData = (labTestsRes as any)?.data || labTestsRes;
                setAvailableLabTests(Array.isArray(labsData) ? labsData : []);

                const radsData = (radTestsRes as any)?.data || radTestsRes;
                setAvailableRadTests(Array.isArray(radsData) ? radsData : []);

                const medicines = normalizeMedicines(medicineRes);
                console.log('medicineRes:', medicineRes);
                console.log('normalized medicines:', medicines);
                setAvailableMedicines(medicines);

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
                        patientName: patient.fullName ?? patient.name ?? d.patientName ?? '—',
                        age: patient.age ?? d.age ?? '—',
                        gender: normalizeGender(patient.gender ?? d.gender),
                        bloodType: patient.bloodType ?? d.bloodType ?? '—',
                        allergies: patient.allergies ?? d.allergies ?? [],
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
                        fileNumber: patient.fileNumber ?? d.fileNumber ?? d.patientFileNumber ?? '—',
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
        if (!visitId || !newPrescription.medicineId) {
            alert('Please select a medicine.');
            return;
        }

        try {
            const selectedMedicine = availableMedicines.find(
                med => med.id === newPrescription.medicineId
            );

            if (!selectedMedicine) {
                alert('Selected medicine is invalid.');
                return;
            }

            await visitApi.addPrescription(visitId, {
                notes: '',
                items: [
                    {
                        id: 0,
                        medicineId: Number(selectedMedicine.id),
                        medicationName: selectedMedicine.name,
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
                    name: selectedMedicine.name,
                    dosage: newPrescription.dosage,
                    frequency: newPrescription.frequency,
                    duration: newPrescription.duration,
                    instructions: newPrescription.instructions,
                },
            ]);

            setNewPrescription({
                medicineId: '',
                name: '',
                dosage: '',
                frequency: '',
                duration: '',
                instructions: '',
            });

            setShowAddPrescription(false);
        } catch (error) {
            console.error('Failed to add prescription', error);
            alert('Failed to add prescription');
        }
    };

    const handleAddLabOrder = () => {
        if (!selectedLabTest) return;
        const testObj = availableLabTests.find(t => t.id?.toString() === selectedLabTest || t.testCode === selectedLabTest);
        const name = testObj ? (testObj.testNameEnglish || testObj.testName || testObj.testCode) : selectedLabTest;

        if (!labOrders.find(o => o.name === name)) {
            setLabOrders([...labOrders, { id: Date.now(), name, desc: 'Requested' }]);
        }
    };

    const handleAddRadOrder = async () => {
        if (!selectedRadTest) return;

        try {
            const testId = parseInt(selectedRadTest, 10) || 0;
            await createRadiologyRequest({
                fileNumber: visitDetails?.fileNumber || "Unknown",
                visitId: parseInt(visitId || '0', 10),
                testId: testId,
                isPregnant: radDetails.isPregnant === 'Positive',
                allergiesToContrast: radDetails.allergiesToContrast,
                allergyDetails: radDetails.allergiesToContrast ? radDetails.allergyDetails : '',
                diabetes: radDetails.diabetes,
                onMetformin: radDetails.onMetformin,
                cardiacProblems: radDetails.cardiacProblems,
                cardiacDetails: radDetails.cardiacProblems ? radDetails.cardiacDetails : '',
                notes: radDetails.notes || ''
            });

            const testObj = availableRadTests.find(t => t.id?.toString() === selectedRadTest || t.serviceCode === selectedRadTest);
            const name = testObj ? (testObj.radiologyTestName || testObj.serviceNameEnglish || testObj.serviceName || testObj.serviceCode) : selectedRadTest;

            if (!radOrders.find(o => o.name === name)) {
                setRadOrders([...radOrders, { id: Date.now(), name, desc: 'Requested' }]);
            }
        } catch (error) {
            console.error("Failed to create radiology request", error);
            alert("Failed to create radiology request");
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex flex-col min-h-0 bg-[#f8fafc]">
                <TopBar title="DASHBOARD" onMenuClick={onMenuClick || (() => { })} onProfileClick={onProfileClick} showAddUser={false} isNurse={false} />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-slate-400 font-medium animate-pulse">Loading visit...</div>
                </main>
            </div>
        );
    }

    if (error || !visitDetails) {
        return (
            <div className="flex-1 flex flex-col min-h-0 bg-[#f8fafc]">
                <TopBar title="DASHBOARD" onMenuClick={onMenuClick || (() => { })} onProfileClick={onProfileClick} showAddUser={false} isNurse={false} />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-red-500 font-semibold mb-2">{error || 'Visit not found.'}</div>
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
                onMenuClick={onMenuClick || (() => { })}
                onProfileClick={onProfileClick}
                showAddUser={false}
                isNurse={false}
            />

            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                <div className="max-w-[1600px] mx-auto">

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-black text-slate-800">{visitDetails.patientName}</h1>
                                <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-bold flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                                    Active Visit
                                </span>
                            </div>
                            <div className="text-slate-500 font-medium flex items-center gap-2">
                                <span className="flex items-center gap-1"><FileText className="w-4 h-4" /> Visit ID: {visitDetails.visitId}</span>
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
                        <div className="xl:col-span-3 flex flex-col gap-6">
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
                                        <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">{visitDetails.bloodType}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 font-medium text-sm block mb-2">Allergies</span>
                                        <div className="flex flex-wrap gap-2">
                                            {visitDetails.allergies.length === 0
                                                ? <span className="text-slate-400 text-xs font-medium">None recorded</span>
                                                : visitDetails.allergies.map((alg: string, idx: number) => (
                                                    <span key={`${alg}-${idx}`} className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100">{alg}</span>
                                                ))
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                                    <Activity className="w-4 h-4" /> Recent Vitals
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <div className="text-slate-500 text-xs font-bold mb-1">Blood Pressure</div>
                                        <div className="font-black text-lg text-slate-800">{visitDetails.vitals.bp} <span className="text-xs font-medium text-slate-400">mmHg</span></div>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <div className="text-slate-500 text-xs font-bold mb-1">Temperature</div>
                                        <div className="font-black text-lg text-slate-800">{visitDetails.vitals.temp} <span className="text-xs font-medium text-slate-400">°C</span></div>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <div className="text-slate-500 text-xs font-bold mb-1">Heart Rate</div>
                                        <div className="font-black text-lg text-slate-800">{visitDetails.vitals.heartRate} <span className="text-xs font-medium text-slate-400">bpm</span></div>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <div className="text-slate-500 text-xs font-bold mb-1">SpO₂</div>
                                        <div className="font-black text-lg text-slate-800">{visitDetails.vitals.oxygenSaturation} <span className="text-xs font-medium text-slate-400">%</span></div>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 col-span-2">
                                        <div className="text-slate-500 text-xs font-bold mb-1">BMI</div>
                                        <div className="font-black text-lg text-slate-800">{visitDetails.vitals.bmi}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex-1 flex flex-col min-h-[300px]">
                                <h3 className="text-base font-black text-slate-800 mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-blue-500" /> Clinical Notes
                                </h3>
                                <textarea
                                    value={clinicalNotes}
                                    onChange={(e) => setClinicalNotes(e.target.value)}
                                    placeholder="Start typing detailed clinical observations here..."
                                    className="flex-1 w-full resize-none outline-none text-slate-700 font-medium placeholder:text-slate-300 placeholder:font-normal leading-relaxed"
                                />
                            </div>
                        </div>

                        <div className="xl:col-span-9 flex flex-col gap-6">
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                <h3 className="text-base font-black text-slate-800 mb-4 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-blue-500" /> Chief Complaint
                                </h3>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 font-medium">
                                    {visitDetails.chiefComplaint}
                                </div>
                            </div>

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
                                            <select
                                                className="flex-1 min-w-[200px] px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none"
                                                value={newPrescription.medicineId}
                                                onChange={(e) => {
                                                    const selected = availableMedicines.find(m => m.id === e.target.value);
                                                    setNewPrescription({
                                                        ...newPrescription,
                                                        medicineId: e.target.value,
                                                        name: selected?.name || ''
                                                    });
                                                }}
                                            >
                                                <option value="">Select medicine...</option>
                                                {availableMedicines.map((med) => (
                                                    <option key={med.id} value={med.id}>
                                                        {med.name}
                                                    </option>
                                                ))}
                                            </select>

                                            <input
                                                type="text"
                                                placeholder="Dosage"
                                                className="w-32 px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none"
                                                value={newPrescription.dosage}
                                                onChange={e => setNewPrescription({ ...newPrescription, dosage: e.target.value })}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Frequency"
                                                className="w-48 px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none"
                                                value={newPrescription.frequency}
                                                onChange={e => setNewPrescription({ ...newPrescription, frequency: e.target.value })}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Duration"
                                                className="w-32 px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none"
                                                value={newPrescription.duration}
                                                onChange={e => setNewPrescription({ ...newPrescription, duration: e.target.value })}
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <input
                                                type="text"
                                                placeholder="Specific Instructions (Optional)"
                                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none"
                                                value={newPrescription.instructions}
                                                onChange={e => setNewPrescription({ ...newPrescription, instructions: e.target.value })}
                                            />
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