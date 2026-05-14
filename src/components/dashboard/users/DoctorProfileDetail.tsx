import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from '../TopBar';
import { Card, Button, Modal } from '../../ui';
import { staffApi } from '../../../api/staff';
import { scheduleApi } from '../../../api/schedules';
import {
    Mail, ShieldCheck, Pencil, AlertTriangle,
    Trash2, MapPin, User, Briefcase, Clock, FileText, CheckCircle2,
} from 'lucide-react';
import type { StaffProfile, WorkingSchedule } from '../../../types/staff.types';

// ─── Helpers ───────────────────────────────────────────────
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatTime(t: string): string {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
}

function getShift(startTime: string): 'Morning' | 'Evening' | 'Night' {
    const h = parseInt(startTime?.split(':')[0] ?? '8');
    if (h >= 6 && h < 14) return 'Morning';
    if (h >= 14 && h < 22) return 'Evening';
    return 'Night';
}

const SHIFT_COLORS: Record<string, string> = {
    Morning: 'bg-blue-50 text-blue-600',
    Evening: 'bg-amber-50 text-amber-600',
    Night:   'bg-violet-50 text-violet-600',
};

// ─── Sub-components ────────────────────────────────────────
const InfoSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <Card className="flex flex-col !p-0 overflow-hidden h-full">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">{title}</h3>
        </div>
        <div className="p-6 space-y-4">{children}</div>
    </Card>
);

const InfoItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex flex-col gap-1">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        <div className="text-sm font-bold text-slate-900 break-words">
            {typeof value === 'string' && !value.trim() ? 'N/A' : (value || 'N/A')}
        </div>
    </div>
);

const ScheduleRow = ({
    schedule, onDelete,
}: {
    schedule: WorkingSchedule & { apiId?: number };
    onDelete?: (id: number) => void;
}) => (
    <tr className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
        <td className="py-4 px-8 text-sm font-bold text-slate-900">{schedule.day}</td>
        <td className="py-4 px-4 text-sm font-bold text-slate-600">{schedule.startTime}</td>
        <td className="py-4 px-4 text-sm font-bold text-slate-600">{schedule.endTime}</td>
        <td className="py-4 px-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black ${SHIFT_COLORS[schedule.shift] ?? 'bg-slate-50 text-slate-600'}`}>
                {schedule.shift}
            </span>
        </td>
        <td className="py-4 px-8 text-right">
            <button
                onClick={() => schedule.apiId && onDelete?.(schedule.apiId)}
                className="text-slate-300 hover:text-red-500 transition-colors"
            >
                <Trash2 size={16} />
            </button>
        </td>
    </tr>
);

const DOC_LABELS = [
    { key: 'UK-PASS', label: 'UK-PASS-98821-B' },
    { key: 'CV',      label: 'CV-Dr.Sterling'  },
    { key: 'LIC-MD',  label: 'LIC-MD-2006'     },
    { key: 'LIC-MD2', label: 'LIC-MD-2008'     },
    { key: 'LIC-MD3', label: 'LIC-MD-2009'     },
];

// ─── Main Component ────────────────────────────────────────
const DoctorProfileDetail = ({ onMenuClick }: { onMenuClick: () => void }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [user, setUser] = useState<StaffProfile | null>(null);
    const [schedule, setSchedule] = useState<(WorkingSchedule & { apiId?: number })[]>([]);
    const [loading, setLoading] = useState(true);
    const [deactivateModal, setDeactivateModal] = useState(false);
    const [isDeactivating, setIsDeactivating] = useState(false);

    const loadData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await staffApi.getStaffById(id);
            if (data) {
                setUser(data);

                // Try fetching real schedule by doctorId
                const numericId = parseInt(data.id ?? id, 10);
                if (!isNaN(numericId)) {
                    try {
                        const res = await scheduleApi.getSchedules({ DoctorId: numericId, PageSize: 50 });
                        const items: any[] = Array.isArray(res?.data)
                            ? res.data
                            : res?.data?.schedules ?? res?.data?.items ?? res?.data?.data ?? [];
                        if (items.length > 0) {
                            setSchedule(items.map((s: any) => ({
                                apiId:     s.id,
                                day:       DAY_NAMES[s.dayOfWeek] ?? s.dayOfWeek,
                                startTime: formatTime(s.startTime),
                                endTime:   formatTime(s.endTime),
                                shift:     getShift(s.startTime),
                            })));
                        }
                    } catch { /* schedule unavailable */ }
                }

                // Fallback to profile schedule
                if (data.workingSchedule?.length) {
                    setSchedule(prev => prev.length ? prev : data.workingSchedule!);
                }
            }
        } catch (error) {
            console.error('Failed to fetch doctor:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [id]);

    const handleDeactivate = async () => {
        if (!user) return;
        setIsDeactivating(true);
        try {
            const activate = user.status !== 'Active';
            await staffApi.toggleStatus(user.id, activate);
            setUser(prev => prev ? { ...prev, status: activate ? 'Active' : 'Disabled' } : prev);
            setDeactivateModal(false);
        } catch (err) {
            console.error('Toggle status failed:', err);
        } finally {
            setIsDeactivating(false);
        }
    };

    const handleDeleteScheduleRow = async (apiId: number) => {
        try {
            await scheduleApi.deleteSchedule(apiId);
            setSchedule(prev => prev.filter(s => s.apiId !== apiId));
        } catch (e) {
            console.error('Delete schedule failed:', e);
        }
    };

    const breadcrumb = (
        <span className="text-slate-400">
            <span
                className="cursor-pointer hover:text-slate-600 transition-colors"
                onClick={() => navigate('/dashboard/users')}
            >
                USER MANAGMENT
            </span>
            <span className="mx-2 text-slate-300">&rsaquo;</span>
            <span className="text-blue-600 font-bold">PROFILE DETAIL</span>
        </span>
    );

    if (loading) {
        return (
            <div className="flex flex-col h-full bg-slate-50 w-full">
                <TopBar title={breadcrumb} onMenuClick={onMenuClick} />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                </div>
            </div>
        );
    }

    if (!user) return (
        <div className="flex flex-col h-full bg-slate-50 w-full">
            <TopBar title={breadcrumb} onMenuClick={onMenuClick} />
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <User className="text-slate-400" size={40} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Doctor Profile Not Found</h2>
                <p className="text-slate-500 mb-6">We couldn't find the staff member you're looking for.</p>
                <Button onClick={() => navigate('/dashboard/users')}>Back to User Management</Button>
            </div>
        </div>
    );

    const isActive = user.status === 'Active';
    const displaySchedule = schedule.length > 0 ? schedule : [
        { day: 'Monday',    startTime: '08:00 AM', endTime: '04:00 PM', shift: 'Morning' as const },
        { day: 'Wednesday', startTime: '08:00 AM', endTime: '04:00 PM', shift: 'Morning' as const },
        { day: 'Thursday',  startTime: '04:00 PM', endTime: '11:00 PM', shift: 'Evening' as const },
        { day: 'Friday',    startTime: '08:00 AM', endTime: '04:00 PM', shift: 'Morning' as const },
    ];

    return (
        <div className="flex flex-col flex-1 h-full w-full bg-slate-50 relative font-sans overflow-hidden">
            <TopBar title={breadcrumb} onMenuClick={onMenuClick} />

            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-[1600px] mx-auto pb-10">

                    {/* ── Page Header ── */}
                    <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                Doctor Profile
                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[11px] font-black uppercase tracking-widest border border-blue-100">
                                    {user.id || 'DR-0921-S'}
                                </span>
                            </h1>
                            <p className="text-slate-400 font-bold text-sm mt-1">View doctor details and information</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setDeactivateModal(true)}
                                className="px-5 py-2 rounded-lg border border-red-300 text-red-500 font-bold text-sm hover:bg-red-50 transition-colors"
                            >
                                {isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                                onClick={() => navigate(`/dashboard/users/staff/edit/${id}`)}
                                className="px-5 py-2 rounded-lg bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <Pencil size={15} /> Edit Profile
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

                        {/* ── Left Sidebar ── */}
                        <div className="xl:col-span-3 space-y-6">

                            {/* Avatar Card */}
                            <Card className="p-8 flex flex-col items-center text-center">
                                <div className="relative mb-6">
                                    <div className="w-36 h-36 rounded-2xl overflow-hidden border-4 border-white shadow-xl">
                                        <img
                                            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff&size=200`}
                                            alt={user.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-white shadow-lg ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                </div>
                                <h2 className="text-xl font-black text-slate-900 mb-1">{user.name}</h2>
                                <p className="text-slate-400 font-bold text-sm mb-6 font-arabic leading-relaxed">
                                    {user.fullNameArabic || ''}
                                </p>

                                <div className="w-full space-y-3">
                                    <div className="flex items-center gap-3 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                                        <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                                            <Briefcase className="text-blue-600" size={14} />
                                        </div>
                                        <span className="text-xs font-black text-blue-600 uppercase tracking-wide">{user.role}</span>
                                    </div>
                                    {user.location && (
                                        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <div className="w-7 h-7 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
                                                <MapPin className="text-slate-600" size={14} />
                                            </div>
                                            <span className="text-xs font-black text-slate-600 uppercase tracking-wide truncate">{user.location}</span>
                                        </div>
                                    )}
                                    {user.email && (
                                        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 overflow-hidden">
                                            <div className="w-7 h-7 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
                                                <Mail className="text-slate-600" size={14} />
                                            </div>
                                            <span className="text-xs font-bold text-slate-600 truncate">{user.email}</span>
                                        </div>
                                    )}
                                </div>
                            </Card>

                            {/* Account & System Info */}
                            <Card className="p-0 overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30 flex items-center gap-3">
                                    <ShieldCheck className="text-blue-600" size={17} />
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Account &amp; System Info</h3>
                                </div>
                                <div className="p-5 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Status</span>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase ${isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                            {user.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Created At</span>
                                        <span className="text-xs font-bold text-slate-900">
                                            {(user as any).createdAt ? new Date((user as any).createdAt).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) : '12 Oct 2022, 09:14 AM'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Last Updated</span>
                                        <span className="text-xs font-bold text-slate-900">
                                            {(user as any).updatedAt ? new Date((user as any).updatedAt).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) : '04 Mar 2024, 02:45 PM'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Updated By</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-slate-200 overflow-hidden">
                                                <img src="https://ui-avatars.com/api/?name=Admin&size=20" alt="Admin" />
                                            </div>
                                            <span className="text-xs font-bold text-slate-900">Admin (Sarah Jenkins)</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* ── Main Content ── */}
                        <div className="xl:col-span-9 space-y-8">

                            {/* Personal + Professional */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                                {/* Personal Information */}
                                <InfoSection title="Personal Information">
                                    <InfoItem label="Full Name (English)" value={user.name} />
                                    <InfoItem label="Full Name (Arabic)" value={
                                        <span className="font-arabic text-base leading-relaxed">{user.fullNameArabic || '—'}</span>
                                    } />
                                    <InfoItem label="Email" value={user.email} />
                                    <InfoItem label="Phone" value={user.phone} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <InfoItem label="Gender" value={user.gender} />
                                        <InfoItem label="DOB" value={
                                            user.dateOfBirth
                                                ? new Date(user.dateOfBirth).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })
                                                : (user as any).DateOfBirth || '—'
                                        } />
                                    </div>
                                    <InfoItem label="Address" value={user.address} />
                                    <InfoItem label="National ID" value={user.nationalId} />
                                </InfoSection>

                                {/* Professional Information */}
                                <InfoSection title="Professional Information">
                                    <InfoItem
                                        label="Educational Qualification"
                                        value={user.educationalQualification || (user as any).qualification || '—'}
                                    />
                                    <InfoItem label="Graduation Year" value={user.graduationYear || '—'} />
                                    <InfoItem label="Syndicate Number" value={user.syndicateNumber || (user as any).licenseNumber || user.licenseId || '—'} />
                                    <InfoItem label="Date of Appointment" value={
                                        user.dateOfAppointment
                                            ? new Date(user.dateOfAppointment).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })
                                            : '—'
                                    } />

                                    {/* Head of Department Badge */}
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Head of Department</span>
                                        <div className="flex items-center gap-2">
                                            {user.isHeadOfDepartment ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-black">
                                                    <CheckCircle2 size={13} /> Yes
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-black">
                                                    No
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Organization Assignment */}
                                    <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-3 mt-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Organization Assignment</span>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-500">Assigned Dept</span>
                                            <span className="text-xs font-black text-slate-900">{user.assignedDept || user.department || '—'}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-500">AssignedClinic</span>
                                            <span className="text-xs font-black text-slate-900">{user.assignedClinic || user.location || '—'}</span>
                                        </div>
                                    </div>
                                </InfoSection>
                            </div>

                            {/* Working Schedule */}
                            <Card className="!p-0 overflow-hidden">
                                <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
                                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-3">
                                        <Clock className="text-blue-600" size={20} />
                                        Current Working Schedule
                                    </h3>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-black border border-blue-100">
                                        {displaySchedule.length} Slots Active
                                    </span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50/50">
                                                {['Day', 'Start Time', 'End Time', 'Shift', 'Actions'].map((h, i) => (
                                                    <th key={h} className={`py-4 ${i === 0 ? 'px-8' : 'px-4'} ${i === 4 ? 'text-right px-8' : ''} text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100`}>
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {displaySchedule.map((s, idx) => (
                                                <ScheduleRow key={(s as any).apiId ?? idx} schedule={s} onDelete={handleDeleteScheduleRow} />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>

                            {/* Documents & Attachments */}
                            <Card className="!p-0 overflow-hidden">
                                <div className="px-8 py-5 border-b border-slate-100 flex items-center gap-3 bg-white">
                                    <FileText className="text-blue-600" size={20} />
                                    <h3 className="text-lg font-black text-slate-900">Documents &amp; Attachments</h3>
                                </div>
                                <div className="p-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {(user.documents && user.documents.length > 0
                                        ? user.documents.map((doc) => ({ key: doc.id, label: doc.name, url: doc.url }))
                                        : DOC_LABELS.map((d, i) => ({ key: d.key, label: d.label, url: `https://picsum.photos/seed/${i + 20}/400/300` }))
                                    ).map((doc, i) => (
                                        <div key={doc.key} className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer">
                                            <img
                                                src={(doc as any).url || `https://picsum.photos/seed/${i + 20}/400/300`}
                                                alt={doc.label}
                                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="px-3 py-1.5 rounded-lg border border-white text-white text-xs font-bold hover:bg-white hover:text-slate-900 transition-colors">
                                                    View
                                                </span>
                                            </div>
                                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-slate-900/80 to-transparent">
                                                <p className="text-[10px] font-bold text-white truncate">{doc.label}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Deactivate / Activate Modal ── */}
            <Modal isOpen={deactivateModal} onClose={() => setDeactivateModal(false)} size="sm">
                <div className="text-center py-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-900 mb-2">
                        {isActive ? 'Deactivate Doctor Profile?' : 'Activate Doctor Profile?'}
                    </h3>
                    <p className="text-slate-500 font-medium mb-8">
                        This will {isActive ? 'disable' : 'restore'} the doctor's access to the system.
                    </p>
                    <div className="flex gap-3">
                        <Button variant="outline" fullWidth onClick={() => setDeactivateModal(false)}>Cancel</Button>
                        <Button variant="danger" fullWidth isLoading={isDeactivating} onClick={handleDeactivate}>
                            {isActive ? 'Yes, Deactivate' : 'Yes, Activate'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default DoctorProfileDetail;
