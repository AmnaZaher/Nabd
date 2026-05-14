import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { profileApi } from '../../../api/profile';
import type { DoctorScheduleEntry } from '../../../api/profile';
import TopBar from '../TopBar';
import { Clock, CalendarClock, Loader2 } from 'lucide-react';

const SHIFT_COLORS: Record<string, { bg: string; text: string }> = {
    morning: { bg: 'bg-amber-50',   text: 'text-amber-600'  },
    evening: { bg: 'bg-blue-50',    text: 'text-blue-600'   },
    night:   { bg: 'bg-indigo-50',  text: 'text-indigo-600' },
};

const shiftStyle = (shift: string) =>
    SHIFT_COLORS[shift?.toLowerCase()] ?? { bg: 'bg-slate-100', text: 'text-slate-600' };

const DAY_ORDER = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface DoctorSchedulePageProps {
    onMenuClick?: () => void;
    onProfileClick?: () => void;
}

const DoctorSchedulePage: React.FC<DoctorSchedulePageProps> = ({ onMenuClick, onProfileClick }) => {
    const { user } = useAuth();
    const [schedule, setSchedule] = useState<DoctorScheduleEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            if (!user?.id) return;
            setLoading(true);
            try {
                const data = await profileApi.getDoctorSchedule(user.id);
                // Sort by day-of-week order
                const sorted = [...data].sort(
                    (a, b) =>
                        DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day)
                );
                setSchedule(sorted);
            } catch (err) {
                console.error('Failed to load doctor schedule:', err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [user?.id]);

    // Group by day for the card grid view
    const byDay = DAY_ORDER.reduce<Record<string, DoctorScheduleEntry[]>>((acc, day) => {
        const slots = schedule.filter(s => s.day === day);
        if (slots.length) acc[day] = slots;
        return acc;
    }, {});

    const activeDays = Object.keys(byDay);

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-[#f8fafc]">
            <TopBar
                title="MY SCHEDULE"
                onMenuClick={onMenuClick || (() => {})}
                onProfileClick={onProfileClick}
                showAddUser={false}
            />

            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-[1200px] mx-auto space-y-8">

                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                <CalendarClock className="text-blue-600" size={26} />
                                Working Schedule
                            </h1>
                            <p className="text-slate-400 font-medium text-sm mt-1">
                                Your assigned shifts and working hours
                            </p>
                        </div>
                        <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-3 text-center">
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Active Days</p>
                            <p className="text-2xl font-black text-blue-600">{activeDays.length}</p>
                        </div>
                    </div>

                    {/* Week strip */}
                    <div className="grid grid-cols-7 gap-2">
                        {DAY_ORDER.map(day => {
                            const isActive = !!byDay[day];
                            return (
                                <div
                                    key={day}
                                    className={`rounded-2xl py-3 flex flex-col items-center gap-1 transition-all ${
                                        isActive
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                            : 'bg-white border border-slate-100 text-slate-300'
                                    }`}
                                >
                                    <span className="text-[10px] font-black uppercase tracking-widest">
                                        {day.slice(0, 3)}
                                    </span>
                                    <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-slate-200'}`} />
                                </div>
                            );
                        })}
                    </div>

                    {/* Schedule Content */}
                    {loading ? (
                        <div className="flex items-center justify-center py-24">
                            <Loader2 className="animate-spin text-blue-600" size={36} />
                        </div>
                    ) : schedule.length === 0 ? (
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm py-20 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <CalendarClock className="text-slate-300" size={32} />
                            </div>
                            <h3 className="text-lg font-black text-slate-700 mb-1">No Schedule Assigned</h3>
                            <p className="text-slate-400 font-medium text-sm">
                                Your working schedule hasn't been set up yet. Contact your administrator.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Table view */}
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                                <div className="px-8 py-5 border-b border-slate-100 flex items-center gap-3">
                                    <Clock className="text-blue-600" size={20} />
                                    <h2 className="text-base font-black text-slate-900 uppercase tracking-widest">
                                        Weekly Breakdown
                                    </h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                                <th className="py-4 px-8">Day</th>
                                                <th className="py-4 px-4">Start Time</th>
                                                <th className="py-4 px-4">End Time</th>
                                                <th className="py-4 px-4">Duration</th>
                                                <th className="py-4 px-4">Shift</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {schedule.map((slot, idx) => {
                                                const { bg, text } = shiftStyle(slot.shift);
                                                // Simple duration calc if times are in HH:MM format
                                                let duration = '—';
                                                try {
                                                    const [sh, sm] = (slot.startTime || '').replace(/[APMapm\s]/g, '').split(':').map(Number);
                                                    const [eh, em] = (slot.endTime   || '').replace(/[APMapm\s]/g, '').split(':').map(Number);
                                                    if (!isNaN(sh) && !isNaN(eh)) {
                                                        const mins = (eh * 60 + em) - (sh * 60 + sm);
                                                        const h = Math.floor(Math.abs(mins) / 60);
                                                        const m = Math.abs(mins) % 60;
                                                        duration = h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ''}` : `${m}m`;
                                                    }
                                                } catch {}

                                                return (
                                                    <tr
                                                        key={idx}
                                                        className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors"
                                                    >
                                                        <td className="py-5 px-8">
                                                            <span className="text-sm font-black text-slate-900">{slot.day}</span>
                                                        </td>
                                                        <td className="py-5 px-4 text-sm font-bold text-slate-600">{slot.startTime || '—'}</td>
                                                        <td className="py-5 px-4 text-sm font-bold text-slate-600">{slot.endTime   || '—'}</td>
                                                        <td className="py-5 px-4 text-sm font-bold text-slate-500">{duration}</td>
                                                        <td className="py-5 px-4">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-black ${bg} ${text}`}>
                                                                {slot.shift || 'N/A'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Day cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {activeDays.map(day => (
                                    <div key={day} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                        <div className="px-5 py-3 bg-blue-600 flex items-center justify-between">
                                            <span className="text-sm font-black text-white uppercase tracking-widest">{day}</span>
                                            <span className="text-[10px] font-bold text-blue-200">
                                                {byDay[day].length} slot{byDay[day].length > 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        <div className="p-5 space-y-3">
                                            {byDay[day].map((slot, i) => {
                                                const { bg, text } = shiftStyle(slot.shift);
                                                return (
                                                    <div key={i} className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                                            <Clock size={14} className="text-slate-400" />
                                                            {slot.startTime} – {slot.endTime}
                                                        </div>
                                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${bg} ${text}`}>
                                                            {slot.shift}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default DoctorSchedulePage;