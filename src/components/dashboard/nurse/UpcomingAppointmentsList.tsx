import React, { useState, useEffect } from 'react';
import { listAppointments, type Appointment } from '../../../api/appointments';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '../../../routes/routePaths';

const UpcomingAppointmentsList: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAppointments = async () => {
            setLoading(true);
            try {
                const today = new Date().toISOString().split('T')[0];
                const res = await listAppointments({ 
                    DateAppointment: today,
                    PageSize: 5,
                    PageIndex: 0
                });
                const raw = res as any;
                let appts: any[] =
                    raw?.data?.data ||
                    raw?.data?.appointments ||
                    raw?.data?.items ||
                    (Array.isArray(raw?.data) ? raw.data : null) ||
                    raw?.appointments ||
                    raw?.items ||
                    [];
                if (!Array.isArray(appts)) appts = [];
                // Debug: log what the backend actually returns
                if (appts.length > 0) {
                    console.log('[nurse/appointments] keys:', Object.keys(appts[0]));
                }
                setAppointments(appts.slice(0, 5));
            } catch (error) {
                console.error("Failed to fetch appointments:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, []);

    const getStatusBadge = (status: number) => {
        switch (status) {
            case 1: return <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">Scheduled</span>;
            case 2: return <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-bold">In Progress</span>;
            case 3: return <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold">Completed</span>;
            case 4: return <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold">No Show</span>;
            case 5: return <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">Cancelled</span>;
            case 6: return <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-bold">Waiting</span>;
            default: return <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">Unknown</span>;
        }
    };

    const formatTime = (appt: any) => {
        const iso =
            appt.appointmentDate ||
            appt.AppointmentDate ||
            appt.dateTime ||
            appt.DateTime ||
            appt.date ||
            appt.Date ||
            appt.appointmentDateTime ||
            appt.scheduledDate ||
            // fallback: scan all string fields for ISO date pattern
            Object.values(appt).find(
                (v): v is string =>
                    typeof v === 'string' &&
                    v.length >= 10 &&
                    /^\d{4}-\d{2}-\d{2}/.test(v)
            );
        if (!iso) return '--:--';
        try {
            const d = new Date(iso);
            if (isNaN(d.getTime())) return '--:--';
            return new Intl.DateTimeFormat('en-US', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
            }).format(d);
        } catch {
            return '--:--';
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-slate-900">Upcoming Appointments</h3>
                <button 
                    onClick={() => navigate(PATHS.APPOINTMENTS)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors"
                >
                    All Appointments
                </button>
            </div>
            
            <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="px-5 py-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Patient</th>
                            <th className="px-5 py-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Department</th>
                            <th className="px-5 py-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Provider</th>
                            <th className="px-5 py-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Time</th>
                            <th className="px-5 py-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center">
                                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin mx-auto" />
                                </td>
                            </tr>
                        ) : appointments.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-500 text-sm">
                                    No upcoming appointments.
                                </td>
                            </tr>
                        ) : (
                            appointments.map((appt) => (
                                <tr key={appt.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => navigate(`${PATHS.APPOINTMENTS}/edit/${appt.id}`)}>
                                    <td className="px-5 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                                                {appt.patientName}
                                            </span>
                                            <span className="text-xs text-slate-400">Ref: #{appt.appointmentCode || `ID-${appt.patientId}`}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-sm font-medium text-slate-600">
                                        {appt.clinicName || 'General'}
                                    </td>
                                    <td className="px-5 py-4 text-sm font-medium text-slate-600">
                                        Dr. {appt.doctorName.split(' ').pop()}
                                    </td>
                                    <td className="px-5 py-4 text-sm font-extrabold text-slate-900">
                                        {formatTime(appt)}
                                    </td>
                                    <td className="px-5 py-4">
                                        {getStatusBadge(appt.status)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UpcomingAppointmentsList;
