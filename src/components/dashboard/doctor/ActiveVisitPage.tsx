import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { fetchApi } from '../../../api/config';
import TopBar from '../TopBar';
import { 
    User, Activity, Clock, FileText, Plus, Trash2,
    CheckCircle, Paperclip, Pill, ActivitySquare, AlertCircle
} from 'lucide-react';

interface ActiveVisitPageProps {
    onMenuClick?: () => void;
    onProfileClick?: () => void;
}

const ActiveVisitPage: React.FC<ActiveVisitPageProps> = ({ onMenuClick, onProfileClick }) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const appointmentId = searchParams.get('appointmentId');
    const visitId = searchParams.get('visitId') || appointmentId; // Using appointmentId as fallback for visitId if not explicitly created yet
    
    const [, setLoading] = useState(false);
    
    // Patient & Visit State
    const [visitDetails] = useState<any>({
        patientName: 'Ahmad Al-Farsi',
        age: '34 Yrs',
        gender: 'Male',
        bloodType: 'A+',
        allergies: ['Penicillin'],
        vitals: { bp: '120/80', temp: '37.2' },
        chiefComplaint: 'Persistent cough and mild fever for the last 3 days.',
        visitId: '#88291',
        startedTime: '14:20 PM'
    });

    const [clinicalNotes, setClinicalNotes] = useState('');

    // Diagnoses State
    const [diagnoses, setDiagnoses] = useState<any[]>([
        { id: 1, name: 'Acute Upper Respiratory Infection', code: 'J06', type: 'PRIMARY DIAGNOSIS' }
    ]);
    const [newDiagnosis, setNewDiagnosis] = useState({ name: '', code: '', type: 'Primary', justification: '' });
    const [showAddDiagnosis, setShowAddDiagnosis] = useState(false);

    // Prescriptions State
    const [prescriptions, setPrescriptions] = useState<any[]>([
        { id: 1, name: 'Atorvastatin 20mg', dosage: '1 Tab', frequency: 'Once Daily (QD)', duration: '30 Days', instructions: 'Take at night before sleep.' },
        { id: 2, name: 'Amoxicillin 500mg', dosage: '1 Cap', frequency: '2x daily for 7 days', duration: '7 Days', instructions: 'Dispensed: 14 Capsules' }
    ]);
    const [newPrescription, setNewPrescription] = useState({ name: '', dosage: '', frequency: '', duration: '', instructions: '' });
    const [showAddPrescription, setShowAddPrescription] = useState(false);

    // Orders State
    const [labOrders] = useState<any[]>([
        { id: 1, name: 'CBC Lab', desc: 'Full blood count with differentials' }
    ]);
    const [radOrders] = useState<any[]>([
        { id: 1, name: 'Chest X-Ray', desc: 'Posterior-Anterior view' }
    ]);

    // Setup initial fetch
    useEffect(() => {
        const fetchVisitData = async () => {
            if (!visitId) return;
            setLoading(true);
            try {
                // In a real app, we'd fetch all these from the API.
                // For now, we rely on the initial state or a single generic fetch
                const res = await fetchApi(`/Visit/${visitId}`);
                if (res?.data) {
                    // map res.data to visitDetails
                }
            } catch (error) {
                console.error("Failed to fetch visit details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchVisitData();
    }, [visitId]);

    // Handlers
    const handleFinishVisit = async () => {
        try {
            if (visitId) {
                await fetchApi(`/Visit/${visitId}/MarkComplete`, { method: 'PATCH' });
            }
            navigate('/dashboard/doctor-visits');
        } catch (error) {
            console.error("Failed to complete visit", error);
            // navigate anyway for demo
            navigate('/dashboard/doctor-visits');
        }
    };

    const handleAddDiagnosis = async () => {
        if (!newDiagnosis.name) return;
        try {
            // await fetchApi(`/Visit/${visitId}/diagnoses`, { method: 'POST', body: JSON.stringify(newDiagnosis) });
            setDiagnoses([...diagnoses, { id: Date.now(), name: newDiagnosis.name, code: newDiagnosis.code, type: newDiagnosis.type.toUpperCase() + ' DIAGNOSIS' }]);
            setNewDiagnosis({ name: '', code: '', type: 'Primary', justification: '' });
            setShowAddDiagnosis(false);
        } catch (error) {
            console.error("Failed to add diagnosis", error);
        }
    };

    const handleAddPrescription = async () => {
        if (!newPrescription.name) return;
        try {
            // await fetchApi(`/Visit/${visitId}/prescriptions`, { method: 'POST', body: JSON.stringify(newPrescription) });
            setPrescriptions([...prescriptions, { id: Date.now(), ...newPrescription }]);
            setNewPrescription({ name: '', dosage: '', frequency: '', duration: '', instructions: '' });
            setShowAddPrescription(false);
        } catch (error) {
            console.error("Failed to add prescription", error);
        }
    };

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
                                        <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">{visitDetails.bloodType}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 font-medium text-sm block mb-2">Allergies</span>
                                        <div className="flex flex-wrap gap-2">
                                            {visitDetails.allergies.map((alg: string) => (
                                                <span key={alg} className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100">
                                                    {alg}
                                                </span>
                                            ))}
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
                                        <div className="font-black text-lg text-slate-800">{visitDetails.vitals.bp} <span className="text-xs font-medium text-slate-400">mmHg</span></div>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <div className="text-slate-500 text-xs font-bold mb-1">Temperature</div>
                                        <div className="font-black text-lg text-slate-800">{visitDetails.vitals.temp} <span className="text-xs font-medium text-slate-400">°C</span></div>
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
                                {/* Minimal formatting toolbar mock */}
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
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Primary Diagnosis / Indication</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="Start typing diagnosis name..." 
                                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 ring-blue-50"
                                                    value={newDiagnosis.name}
                                                    onChange={e => setNewDiagnosis({...newDiagnosis, name: e.target.value})}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">ICD-10 Code</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="e.g., J10" 
                                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 ring-blue-50"
                                                    value={newDiagnosis.code}
                                                    onChange={e => setNewDiagnosis({...newDiagnosis, code: e.target.value})}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Diagnosis Type</label>
                                                <select 
                                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 ring-blue-50"
                                                    value={newDiagnosis.type}
                                                    onChange={e => setNewDiagnosis({...newDiagnosis, type: e.target.value})}
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
                                                    onChange={e => setNewDiagnosis({...newDiagnosis, justification: e.target.value})}
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
                                    {diagnoses.map(diag => (
                                        <div key={diag.id} className="flex justify-between items-center p-4 border border-blue-100 bg-blue-50/30 rounded-xl group">
                                            <div className="flex items-start gap-4">
                                                <div className="bg-white text-blue-600 font-bold px-3 py-1.5 rounded-lg border border-blue-100 text-sm">
                                                    {diag.code}
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
                                        <div className="flex gap-4 mb-4">
                                            <input type="text" placeholder="Search medicine..." className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none" value={newPrescription.name} onChange={e => setNewPrescription({...newPrescription, name: e.target.value})} />
                                            <input type="text" placeholder="Dosage" className="w-32 px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none" value={newPrescription.dosage} onChange={e => setNewPrescription({...newPrescription, dosage: e.target.value})} />
                                            <input type="text" placeholder="Frequency" className="w-48 px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none" value={newPrescription.frequency} onChange={e => setNewPrescription({...newPrescription, frequency: e.target.value})} />
                                            <input type="text" placeholder="Duration" className="w-32 px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none" value={newPrescription.duration} onChange={e => setNewPrescription({...newPrescription, duration: e.target.value})} />
                                        </div>
                                        <div className="mb-4">
                                            <input type="text" placeholder="Specific Instructions (Optional)" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none" value={newPrescription.instructions} onChange={e => setNewPrescription({...newPrescription, instructions: e.target.value})} />
                                        </div>
                                        <div className="flex justify-end">
                                            <button onClick={handleAddPrescription} className="px-5 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 font-bold rounded-lg flex items-center gap-2">
                                                Save <CheckCircle className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
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
                                    {/* Lab Tests */}
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
                                        <div className="space-y-2">
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
                                    </div>

                                    {/* Radiology Tests */}
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
                                        <div className="space-y-2">
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
                                    <div className="w-40 h-24 shrink-0 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative group">
                                        <div className="absolute inset-0 bg-slate-200 flex items-center justify-center">
                                            <FileText className="text-slate-400" />
                                        </div>
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-white text-xs font-bold">View</span>
                                        </div>
                                    </div>
                                    <div className="w-40 h-24 shrink-0 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative group">
                                        <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                                            <Activity className="text-slate-600" />
                                        </div>
                                    </div>
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
