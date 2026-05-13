import React, { useState, useEffect } from 'react';
import { listAppointments, type Appointment } from '../../../api/appointments';
import { Loader2 } from 'lucide-react';

const SurgicalWaitingHall: React.FC = () => {
    const [waitingPatients, setWaitingPatients] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWaiting = async () => {
            setLoading(true);
            try {
                const today = new Date().toISOString().split('T')[0];
                // Status 6 is WaitingList
                const res = await listAppointments({ 
                    DateAppointmentFrom: today, 
                    DateAppointmentTo: today, 
                    Status: 6,
                    PageSize: 5
                });
                let appts = res?.data?.items || res?.data || res || [];
                if (!Array.isArray(appts)) appts = [];
                setWaitingPatients(appts);
                
                // For demonstration, if no waiting patients, mock them to match design
                if (appts.length === 0) {
                    setWaitingPatients([
                        {
                            id: 101,
                            patientId: 1,
                            patientName: 'Michael Scott',
                            doctorId: 1,
                            doctorName: 'Dr. Jenkins',
                            clinicName: 'Orthopedics',
                            dateTime: new Date(Date.now() - 4 * 60000).toISOString(), // 4 mins ago
                            status: 6
                        },
                        {
                            id: 102,
                            patientId: 2,
                            patientName: 'Pam Beesly',
                            doctorId: 2,
                            doctorName: 'Dr. Vance',
                            clinicName: 'Gynecology',
                            dateTime: new Date(Date.now() - 12 * 60000).toISOString(), // 12 mins ago
                            status: 6
                        }
                    ]);
                }
            } catch (error) {
                console.error("Failed to fetch waiting patients:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWaiting();
    }, []);

    const getWaitingTime = (isoString: string) => {
        const diffMs = Date.now() - new Date(isoString).getTime();
        const diffMins = Math.floor(Math.max(0, diffMs) / 60000);
        return `${diffMins}m`;
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-[15px] font-extrabold text-slate-900">Surgical Waiting Hall A</h3>
                <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase tracking-wider">
                    Active
                </span>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                {loading ? (
                    <div className="flex justify-center p-4">
                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                    </div>
                ) : (
                    waitingPatients.map((patient, index) => (
                        <div key={patient.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100 transition-colors">
                            <div className="flex items-center gap-4">
                                <span className="text-xl font-extrabold text-slate-300">
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 leading-tight">
                                        {patient.patientName}
                                    </h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                        {patient.clinicName || 'GENERAL'}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="text-right">
                                <p className="text-xs font-bold text-slate-700">
                                    Waiting: {patient.dateTime ? getWaitingTime(patient.dateTime) : '—'}
                                </p>
                                <p className="text-[10px] font-bold text-blue-500">
                                    Room 402
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default SurgicalWaitingHall;
