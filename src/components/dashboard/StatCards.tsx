import React, { useState, useEffect } from 'react';
import { Users, UserRoundCog, Calendar, FlaskConical, Loader2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { patientApi } from '../../api/patient';
import { staffApi } from '../../api/staff';
import { listAppointments } from '../../api/appointments';

interface StatItem {
    label: string;
    value: string | number;
    icon: LucideIcon;
    iconBg: string;
    iconColor: string;
    trend: string;
    trendUp: boolean;
}

const StatCards: React.FC = () => {
    const [stats, setStats] = useState<StatItem[]>([
        {
            label: 'Total Patients',
            value: '...',
            icon: Users,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            trend: 'Live Data',
            trendUp: true,
        },
        {
            label: 'Total Doctors',
            value: '...',
            icon: UserRoundCog,
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
            trend: 'Live Data',
            trendUp: true,
        },
        {
            label: "Today's Appointments",
            value: '...',
            icon: Calendar,
            iconBg: 'bg-pink-100',
            iconColor: 'text-pink-600',
            trend: 'Live Data',
            trendUp: true,
        },
        {
            label: 'Lab Tests',
            value: '...',
            icon: FlaskConical,
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-600',
            trend: 'Live Data',
            trendUp: true,
        },
    ]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                // Fetch patients — backend returns { isSuccess, data: [...array] }, no totalCount
                const patientsRes = await patientApi.getPatients({ PageIndex: 0, PageSize: 1000 });
                const patientsData = (patientsRes as any);
                const totalPatients = Array.isArray(patientsData)
                    ? patientsData.length
                    : patientsData?.totalCount ?? patientsData?.patients?.length ?? 0;

                // Fetch doctors — same array-based response
                const staffRes = await staffApi.getStaffs({ Role: '2', PageIndex: 0, PageSize: 1000 });
                const staffData = (staffRes as any);
                const totalDoctors = Array.isArray(staffData)
                    ? staffData.length
                    : staffData?.totalCount ?? staffData?.staffs?.length ?? 0;

                // Fetch today's appointments — listAppointments returns raw fetchApi result
                // backend: { isSuccess, data: [...array] }
                const today = new Date().toISOString().split('T')[0];
                const apptRes = await listAppointments({ DateAppointmentFrom: today, DateAppointmentTo: today, PageIndex: 0, PageSize: 1000 });
                const apptData = (apptRes as any)?.data;
                const totalAppts = Array.isArray(apptData)
                    ? apptData.length
                    : apptData?.totalCount ?? apptData?.appointments?.length ?? apptData?.items?.length ?? 0;

                // Fetch lab catalog (/Lab/GetResults is 403 for Admin; use catalog instead)
                let totalLabs = 0;
                try {
                    const { getLabCatalog } = await import('../../api/labs');
                    const labRes = await getLabCatalog();
                    const labsData = (labRes as any)?.data;
                    totalLabs = Array.isArray(labsData) ? labsData.length : 0;
                } catch (e) {
                    console.warn("Failed to fetch lab catalog:", e);
                }

                setStats(prev => [
                    { ...prev[0], value: totalPatients.toLocaleString() },
                    { ...prev[1], value: totalDoctors.toLocaleString() },
                    { ...prev[2], value: totalAppts.toLocaleString() },
                    { ...prev[3], value: totalLabs.toLocaleString() },
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
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-2 hover:shadow-md transition-shadow relative overflow-hidden"
                >
                    <div className="flex items-center justify-between relative z-10">
                        <p className="text-sm font-semibold text-slate-500 leading-snug">{stat.label}</p>
                        <div className={`w-10 h-10 ${stat.iconBg} ${stat.iconColor} rounded-xl flex items-center justify-center shrink-0`}>
                            <stat.icon size={20} strokeWidth={2} />
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 relative z-10">
                        {loading ? (
                            <Loader2 size={24} className="animate-spin text-slate-300" />
                        ) : (
                            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{stat.value}</p>
                        )}
                    </div>
                    
                    <p className={`text-xs font-semibold flex items-center gap-1 relative z-10 ${stat.trendUp ? 'text-green-500' : 'text-red-500'}`}>
                        <span>{stat.trendUp ? '↑' : '↓'}</span>
                        {stat.trend}
                    </p>
                </div>
            ))}
        </div>
    );
};

export default StatCards;