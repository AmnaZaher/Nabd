import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import NurseStatCards from './NurseStatCards';
import DepartmentCards from './DepartmentCards';
import UpcomingAppointmentsList from './UpcomingAppointmentsList';
import SurgicalWaitingHall from './SurgicalWaitingHall';
import TodaysScheduleTimeline from './TodaysScheduleTimeline';
import StaffAvailability from './StaffAvailability';

const NurseDashboardOverview: React.FC = () => {
    const { user } = useAuth();
    
    // We will use the same greeting logic
    const getGreeting = () => {
        const hour = new Date().getHours();
        return hour < 12 ? "Good Morning" : "Good Evening";
    };

    const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    };
    const currentDate = new Date().toLocaleDateString("en-US", options);

    return (
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-[1600px] mx-auto space-y-4">
                <div className="mb-4">
                    <p className="text-slate-500 font-medium mb-1">
                        {currentDate}
                    </p>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                        {getGreeting()} {user?.name}
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
    );
};

export default NurseDashboardOverview;
