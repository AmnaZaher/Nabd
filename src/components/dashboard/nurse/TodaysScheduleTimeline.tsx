import React, { useState, useEffect } from 'react';
import { listAppointments, type Appointment } from '../../../api/appointments';
import { Loader2, ChevronRight, Settings2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '../../../routes/routePaths';

const TodaysScheduleTimeline: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'appointments' | 'walkins'>('appointments');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSchedule = async () => {
            setLoading(true);
            try {
                const today = new Date().toISOString().split('T')[0];
                const res = await listAppointments({ 
                    StartDate: today, 
                    EndDate: today, 
                    PageSize: 100 
                });
                let appts = res?.data?.items || res?.data || res || [];
                if (!Array.isArray(appts)) appts = [];
                setAppointments(appts);
                
                // If empty, mock data for the design
                if (appts.length === 0) {
                    setAppointments([
                        {
                            id: 1,
                            patientId: 1,
                            patientName: 'Robert DeNiro',
                            doctorId: 1,
                            doctorName: 'Dr. Helena Vance',
                            dateTime: new Date(new Date().setHours(10, 30, 0, 0)).toISOString(),
                            status: 1
                        },
                        {
                            id: 2,
                            patientId: 2,
                            patientName: 'Emily Blunt',
                            doctorId: 2,
                            doctorName: 'Dr. Julian S.',
                            dateTime: new Date(new Date().setHours(11, 15, 0, 0)).toISOString(),
                            status: 1
                        }
                    ]);
                }
            } catch (error) {
                console.error("Failed to fetch today's schedule:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSchedule();
    }, []);

    const formatTime = (isoString: string) => {
        try {
            return new Intl.DateTimeFormat('en-US', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
            }).format(new Date(isoString));
        } catch {
            return '--:--';
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-extrabold text-slate-900">Today's Schedule</h3>
                <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                    <Settings2 size={20} />
                </button>
            </div>
            
            {/* Tabs */}
            <div className="flex p-1 bg-slate-100/80 rounded-xl mb-5">
                <button
                    onClick={() => setViewMode('appointments')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        viewMode === 'appointments'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Appointments ({appointments.length})
                </button>
                <button
                    onClick={() => setViewMode('walkins')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        viewMode === 'walkins'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Walk-ins (8)
                </button>
            </div>
            
            {/* Timeline List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {loading ? (
                    <div className="flex justify-center p-4">
                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                    </div>
                ) : appointments.length === 0 ? (
                    <p className="text-center text-sm text-slate-500 p-4">No schedule for today.</p>
                ) : (
                    appointments.map((appt, idx) => {
                        // Alternate border colors for design
                        const isPrimary = idx % 2 === 0;
                        
                        return (
                            <div 
                                key={appt.id} 
                                onClick={() => navigate(`${PATHS.APPOINTMENTS}/edit/${appt.id}`)}
                                className="flex items-center p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer group relative overflow-hidden"
                            >
                                {/* Left accent line */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${isPrimary ? 'bg-blue-500' : 'bg-slate-300'}`} />
                                
                                <div className="ml-3 mr-4 flex-shrink-0">
                                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-blue-50/50">
                                        <span className="text-xs font-extrabold text-blue-900 leading-none mb-0.5">
                                            {formatTime(appt.dateTime).split(' ')[0]}
                                        </span>
                                        <span className="text-[9px] font-bold text-blue-500 uppercase">
                                            {formatTime(appt.dateTime).split(' ')[1]}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-slate-900 truncate">
                                        {appt.doctorName}
                                    </h4>
                                    <p className="text-[11px] font-medium text-slate-500 truncate">
                                        Patient: <span className="font-semibold text-slate-700">{appt.patientName}</span>
                                    </p>
                                </div>
                                
                                <div className="ml-2 text-slate-300 group-hover:text-blue-500 transition-colors">
                                    <ChevronRight size={18} strokeWidth={3} />
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default TodaysScheduleTimeline;
