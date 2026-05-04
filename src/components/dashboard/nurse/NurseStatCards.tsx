import React, { useState, useEffect } from 'react';
import { Users, CalendarCheck, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { patientApi } from '../../../api/patient';
import { listAppointments } from '../../../api/appointments';

interface StatItem {
    label: string;
    value: string | number;
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    subtext: string;
    subtextColor?: string;
}

const NurseStatCards: React.FC = () => {
    const [stats, setStats] = useState<StatItem[]>([
        {
            label: 'Total Patients',
            value: '...',
            icon: Users,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            subtext: '+12% Today',
            subtextColor: 'text-blue-500'
        },
        {
            label: 'Scheduled',
            value: '...',
            icon: CalendarCheck,
            iconBg: 'bg-orange-100',
            iconColor: 'text-orange-600',
            subtext: '86% Booked',
        },
        {
            label: 'In Progress',
            value: '...',
            icon: Clock,
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-600',
            subtext: 'Avg: 14m',
        },
        {
            label: 'Completed',
            value: '...',
            icon: CheckCircle2,
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
            subtext: '+12% Today',
            subtextColor: 'text-blue-500'
        },
    ]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                // Fetch patients count
                const patientsRes = await patientApi.getPatients({ PageIndex: 0, PageSize: 1 });
                const totalPatients = patientsRes?.totalCount || 0;

                // Fetch today's appointments for counts
                const today = new Date().toISOString().split('T')[0];
                const apptRes = await listAppointments({ StartDate: today, EndDate: today, PageIndex: 0, PageSize: 1000 });
                const appts = apptRes?.data?.items || [];
                
                const scheduled = appts.filter((a: any) => a.status === 1).length;
                const inProgress = appts.filter((a: any) => a.status === 2).length;
                const completed = appts.filter((a: any) => a.status === 3).length;

                setStats(prev => [
                    { ...prev[0], value: totalPatients.toLocaleString() },
                    { ...prev[1], value: scheduled.toLocaleString() },
                    { ...prev[2], value: inProgress.toLocaleString() },
                    { ...prev[3], value: completed.toLocaleString() },
                ]);
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {stats.map((stat, i) => (
                <div
                    key={i}
                    className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3 relative overflow-hidden"
                >
                    {/* Left Border Accent based on icon color */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${stat.iconColor.replace('text-', 'bg-')} opacity-80`} />
                    
                    <div className="flex items-center justify-between">
                        <div className={`w-10 h-10 ${stat.iconBg} ${stat.iconColor} rounded-lg flex items-center justify-center shrink-0`}>
                            <stat.icon size={22} strokeWidth={2} />
                        </div>
                        <span className={`text-xs font-bold ${stat.subtextColor || 'text-slate-500'}`}>
                            {stat.subtext}
                        </span>
                    </div>
                    
                    <div>
                        <p className="text-sm font-semibold text-slate-400 mb-1">{stat.label}</p>
                        <div className="flex items-center gap-2">
                            {loading ? (
                                <Loader2 size={24} className="animate-spin text-slate-300" />
                            ) : (
                                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{stat.value}</h3>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default NurseStatCards;
