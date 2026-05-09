import React, { useState, useEffect } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { patientApi } from '../../../api/patient';
import { useNavigate } from 'react-router-dom';

// ==================== PatientFeed ====================
interface Patient {
    id: string | number;
    name: string;
    email: string;
    avatar: string;
    patientId: string;
}

export const PatientFeed: React.FC = () => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPatients = async () => {
            setLoading(true);
            try {
                // Fetch recent patients, sorting by newest if possible
                const res = await patientApi.getPatients({ PageIndex: 0, PageSize: 5, sort: 0 }); // 0 = Newest
                const list = res?.patients || (res as any)?.items || (res as any)?.data || [];
                
                const mappedPatients = list.map((item: any) => ({
                    id: item.id || item.Id || item.nationalId,
                    name: item.name || item.fullNameEnglish || item.FullNameEnglish || 'Unknown Patient',
                    email: item.email || item.Email || 'No email provided',
                    avatar: item.avatar || item.PersonalPhotos || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || item.fullNameEnglish || 'P')}&background=random`,
                    patientId: item.patientId || item.nationalId || item.NationalId || '',
                }));

                setPatients(mappedPatients.slice(0, 5));
            } catch (error) {
                console.error("Failed to fetch recent patients:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPatients();
    }, []);

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
            <h3 className="text-base font-bold text-slate-900 mb-6">Recent Patients</h3>
            <div className="space-y-5 flex-1 min-h-[200px]">
                {loading ? (
                    <div className="flex justify-center items-center h-full pt-10">
                        <Loader2 className="animate-spin text-slate-300" size={32} />
                    </div>
                ) : patients.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center pt-10">No recent patients found.</p>
                ) : (
                    patients.map((patient) => (
                        <div 
                            key={patient.id} 
                            className="flex items-center gap-3 group cursor-pointer"
                            onClick={() => navigate(`/dashboard/users/patient/${patient.id}`)}
                        >
                            <img
                                src={patient.avatar}
                                alt={patient.name}
                                className="w-10 h-10 rounded-full object-cover bg-slate-100 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                                    {patient.name}
                                </p>
                                <p className="text-xs text-slate-500 font-medium truncate">{patient.email}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <button 
                onClick={() => navigate('/dashboard/users')}
                className="mt-6 text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1 transition-colors"
            >
                see all <ChevronDown size={14} />
            </button>
        </div>
    );
};

// Keep AlertStack and AppointmentSummary exported as no-ops so old imports don't break
export const AlertStack: React.FC = () => null;
export const AppointmentSummary: React.FC = () => null;