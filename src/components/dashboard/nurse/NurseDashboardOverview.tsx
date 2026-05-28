import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { staffApi } from '../../../api/staff';
import type { StaffProfile } from '../../../types/staff.types';
import TopBar from '../TopBar';
import NurseStatCards from './NurseStatCards';
import DepartmentCards from './DepartmentCards';
import UpcomingAppointmentsList from './UpcomingAppointmentsList';
import SurgicalWaitingHall from './SurgicalWaitingHall';
import TodaysScheduleTimeline from './TodaysScheduleTimeline';
import StaffAvailability from './StaffAvailability';

interface NurseDashboardOverviewProps {
    onMenuClick?: () => void;
    onProfileClick?: () => void;
    onAddUserClick?: (type: 'patient' | 'staff') => void;
}

const NurseDashboardOverview: React.FC<NurseDashboardOverviewProps> = ({ onMenuClick, onProfileClick, onAddUserClick }) => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<StaffProfile | null>(null);

    // Fetch real display name from backend (JWT name claim may be username/ID, not full name)
    useEffect(() => {
        const fetchProfile = async () => {
            if (user?.id) {
                try {
                    const data = await staffApi.getMyProfile(user.id, user.name, user.role);
                    if (data) setProfile(data);
                } catch (error) {
                    console.error('Failed to fetch nurse profile:', error);
                }
            }
        };
        fetchProfile();
    }, [user?.id]);

    // Show only first name in greeting
    const displayName = (profile?.name || user?.name || 'there').split(' ')[0];

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };
    const currentDate = new Date().toLocaleDateString('en-US', options);

    return (
        <div className="flex-1 flex flex-col min-h-0">
            <TopBar
                title="Nurse Dashboard"
                onMenuClick={onMenuClick || (() => {})}
                onProfileClick={onProfileClick}
                onAddUserClick={onAddUserClick}
                showAddUser={true}
                isNurse={true}
            />
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="max-w-[1600px] mx-auto space-y-4">
                    <div className="mb-4">
                        <p className="text-slate-500 font-medium mb-1">
                            {currentDate}
                        </p>
                        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                            {getGreeting()},{' '}
                            <span className="text-blue-600">{displayName}</span> 👋
                        </h2>
                    </div>

                    {/* Stats Row */}
                    <NurseStatCards />

                    {/* Departments Row */}
                    <div className="mt-6 mb-6">
                        <DepartmentCards />
                    </div>

                    {/* Main Content Grid */}
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Left Column */}
                        <div className="flex-1 flex flex-col gap-6 min-w-0">
                            <div className="h-[400px]">
                                <UpcomingAppointmentsList />
                            </div>
                            <div className="h-[300px]">
                                <SurgicalWaitingHall />
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="w-full lg:w-[400px] shrink-0 flex flex-col gap-6">
                            <div className="h-[380px]">
                                <TodaysScheduleTimeline />
                            </div>
                            <div className="h-[320px]">
                                <StaffAvailability />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default NurseDashboardOverview;

