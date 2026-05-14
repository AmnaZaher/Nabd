import React, { useState, useEffect } from 'react';
import { Users, UserRoundCog, Calendar, FlaskConical, Loader2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { fetchApi } from '../../api/config';

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

            let totalPatients: number | string = 0;
            let totalDoctors: number | string = 0;
            let totalAppts: number | string = 0;
            let totalLabs: number | string = 0;

            // 1. Use DashboardData — single endpoint returns patients, doctors, todayAppointment
            try {
                const dashRes = await fetchApi<any>('/Admin/DashboardData');
                const dash = dashRes?.data;
                if (dash) {
                    totalPatients = dash.totalPatients ?? 0;
                    totalDoctors = dash.totalDoctor ?? 0;
                    totalAppts = dash.todayAppointment ?? 0;
                }
            } catch (error) {
                console.error('Error fetching DashboardData:', error);
                totalPatients = 'Error';
                totalDoctors = 'Error';
                totalAppts = 'Error';
            }

            // 2. Lab catalog count (not part of DashboardData)
            try {
                const { getLabCatalog } = await import('../../api/labs');
                const labRes = await getLabCatalog();
                const labsData = (labRes as any)?.data || labRes;
                totalLabs = Array.isArray(labsData) ? labsData.length : 0;
            } catch (error) {
                console.warn('Failed to fetch lab catalog:', error);
                totalLabs = 'Error';
            }

            setStats(prev => [
                { ...prev[0], value: typeof totalPatients === 'number' ? totalPatients.toLocaleString() : totalPatients },
                { ...prev[1], value: typeof totalDoctors === 'number' ? totalDoctors.toLocaleString() : totalDoctors },
                { ...prev[2], value: typeof totalAppts === 'number' ? totalAppts.toLocaleString() : totalAppts },
                { ...prev[3], value: typeof totalLabs === 'number' ? totalLabs.toLocaleString() : totalLabs },
            ]);

            setLoading(false);
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