import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from '../TopBar';
import { Card, Badge, Button, Modal } from '../../ui';
import { staffApi } from '../../../api/staff';
import {
    Mail,
    ShieldCheck,
    Pencil,
    AlertTriangle,
    Trash2,
    MapPin,
    User,
    Briefcase,
    Clock,
    FileText,
} from 'lucide-react';
import type { StaffProfile, WorkingSchedule } from '../../../types/staff.types';

// ==================== Helper Components ====================
const InfoSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <Card className="flex flex-col !p-0 overflow-hidden h-full">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">{title}</h3>
        </div>
        <div className="p-6 space-y-4">
            {children}
        </div>
    </Card>
);

const InfoItem = ({ label, value, subValue }: { label: string; value: string | React.ReactNode; subValue?: string }) => (
    <div className="flex flex-col gap-1">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        <div className="text-sm font-bold text-slate-900 break-words">{value || 'N/A'}</div>
        {subValue && <div className="text-xs text-slate-400 font-medium">{subValue}</div>}
    </div>
);

const ScheduleRow = ({ schedule }: { schedule: WorkingSchedule }) => (
    <tr className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
        <td className="py-4 px-4 text-sm font-bold text-slate-900">{schedule.day}</td>
        <td className="py-4 px-4 text-sm font-bold text-slate-600">{schedule.startTime}</td>
        <td className="py-4 px-4 text-sm font-bold text-slate-600">{schedule.endTime}</td>
        <td className="py-4 px-4">
            <Badge variant="info" size="sm" className="bg-blue-50 text-blue-600 border-0">{schedule.shift}</Badge>
        </td>
        <td className="py-4 px-4 text-right">
            <button className="text-slate-300 hover:text-red-500 transition-colors">
                <Trash2 size={16} />
            </button>
        </td>
    </tr>
);

// ==================== Main Component ====================
const DoctorProfileDetail = ({ onMenuClick }: { onMenuClick: () => void }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<StaffProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [deactivateModal, setDeactivateModal] = useState(false);
    const [isDeactivating, setIsDeactivating] = useState(false);

    console.log('Rendering DoctorProfileDetail for ID:', id);

    const loadStaffData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await staffApi.getStaffById(id);
            if (data) {
                setUser(data);
            } else {
                console.error('Doctor not found');
            }
        } catch (error) {
            console.error('Failed to fetch doctor profile:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStaffData();
    }, [id]);

    const handleDeactivate = async () => {
        setIsDeactivating(true);
        try {
            // TODO: Call deactivate API
            await new Promise((r) => setTimeout(r, 1000)); 
            setUser((prev) => prev ? { ...prev, status: prev.status === 'Active' ? 'Disabled' : 'Active' } : prev);
            setDeactivateModal(false);
        } catch (err) {
            console.error('Deactivation failed:', err);
        } finally {
            setIsDeactivating(false);
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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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

    return (
        <div className="flex flex-col flex-1 h-full w-full bg-slate-50 relative font-sans overflow-hidden">
            <TopBar
                title={breadcrumb}
                onMenuClick={onMenuClick}
            />

            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-[1600px] mx-auto pb-10">
                    
                    {/* Header Controls */}
                    <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                Doctor Profile
                                <Badge variant="info" className="text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 border-blue-100">
                                    {user.id || 'DR-0928-S'}
                                </Badge>
                            </h1>
                            <p className="text-slate-400 font-bold text-sm">View doctor details and information</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button 
                                variant="danger" 
                                className="bg-red-50 text-red-500 hover:bg-red-100 border-0 font-bold px-6"
                                onClick={() => setDeactivateModal(true)}
                            >
                                Deactivate
                            </Button>
                            <Button 
                                className="bg-blue-600 text-white hover:bg-blue-700 font-bold px-6 flex items-center gap-2"
                                onClick={() => navigate(`/dashboard/users/staff/edit/${id}`)}
                            >
                                <Pencil size={16} />
                                Edit Profile
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                        {/* Sidebar */}
                        <div className="xl:col-span-3 space-y-8">
                            <Card className="p-8 flex flex-col items-center text-center">
                                <div className="relative mb-6">
                                    <div className="w-40 h-40 rounded-2xl overflow-hidden border-4 border-white shadow-xl">
                                        <img 
                                            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`} 
                                            alt={user.name} 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 border-4 border-white shadow-lg"></div>
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 mb-1">{user.name}</h2>
                                <p className="text-slate-400 font-bold text-sm mb-6">{user.fullNameArabic || 'د. إيـلياس ستيرلـينغ'}</p>
                                
                                <div className="w-full space-y-3">
                                    <div className="flex items-center gap-3 bg-blue-50/50 p-3 rounded-xl border border-blue-50">
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                            <Briefcase className="text-blue-600" size={16} />
                                        </div>
                                        <span className="text-xs font-black text-blue-600 uppercase tracking-wide">{user.role}</span>
                                    </div>
                                    <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center">
                                            <MapPin className="text-slate-600" size={16} />
                                        </div>
                                        <span className="text-xs font-black text-slate-600 uppercase tracking-wide">{user.location}</span>
                                    </div>
                                    <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 overflow-hidden">
                                        <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
                                            <Mail className="text-slate-600" size={16} />
                                        </div>
                                        <span className="text-xs font-bold text-slate-600 truncate">{user.email}</span>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-0 overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30 flex items-center gap-3">
                                    <ShieldCheck className="text-blue-600" size={18} />
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Account & System Info</h3>
                                </div>
                                <div className="p-6 space-y-5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Status</span>
                                        <Badge variant="success" className="bg-emerald-50 text-emerald-600 border-0 uppercase text-[10px] font-black">{user.status}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Created At</span>
                                        <span className="text-xs font-bold text-slate-900">12 Oct 2022, 09:14 AM</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Last Updated</span>
                                        <span className="text-xs font-bold text-slate-900">04 Mar 2024, 02:45 PM</span>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-2">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Updated By</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-slate-200 overflow-hidden">
                                                <img src="https://ui-avatars.com/api/?name=Admin" alt="Admin" />
                                            </div>
                                            <span className="text-xs font-bold text-slate-900">Admin (Sarah Jenkins)</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Main Content */}
                        <div className="xl:col-span-9 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Personal Information */}
                                <InfoSection title="Personal Information">
                                    <div className="grid grid-cols-1 gap-6">
                                        <InfoItem label="Full Name (English)" value={user.name} />
                                        <InfoItem label="Full Name (Arabic)" value={user.fullNameArabic || 'إيـلياس ألـكسندر ستيرلـينغ'} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <InfoItem label="Email" value={user.email} />
                                            <InfoItem label="Phone" value={user.phone} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <InfoItem label="Gender" value={user.gender} />
                                            <InfoItem label="DOB" value={user.dateOfBirth || '24 Jan 1980'} />
                                        </div>
                                        <InfoItem label="Address" value={user.address || '742 Evergreen Terrace, West District, London, UK'} />
                                        <InfoItem label="National ID" value={user.nationalId || 'UK-PASS-98821-B'} />
                                    </div>
                                </InfoSection>

                                {/* Professional Information */}
                                <InfoSection title="Professional Information">
                                    <div className="grid grid-cols-1 gap-6">
                                        <InfoItem 
                                            label="Educational Qualification" 
                                            value={user.educationalQualification || 'MD, PhD, FACS (Fellow of American College of Surgeons)'} 
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <InfoItem label="Graduation Year" value={user.graduationYear || '2008'} />
                                            <InfoItem label="Syndicate Number" value={user.syndicateNumber || 'SN-4491-X'} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <InfoItem label="Date of Appointment" value={user.dateOfAppointment || '15 Nov 2012'} />
                                            <InfoItem label="Head of Department" value={user.isHeadOfDepartment ? 'Yes' : 'No'} />
                                        </div>
                                        
                                        <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-3">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Organization Assignment</span>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-500">Assigned Dept</span>
                                                <span className="text-xs font-black text-slate-900">{user.assignedDept || user.department || 'Neurosurgery'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-500">Assigned Clinic</span>
                                                <span className="text-xs font-black text-slate-900">{user.assignedClinic || user.location || 'Specialized Wing B'}</span>
                                            </div>
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
                                    <Badge variant="info" className="bg-blue-50 text-blue-600 border-0 font-black">
                                        {user.workingSchedule?.length || 4} Slots Active
                                    </Badge>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50/50">
                                                <th className="py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Day</th>
                                                <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Start Time</th>
                                                <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">End Time</th>
                                                <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Shift</th>
                                                <th className="py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(user.workingSchedule && user.workingSchedule.length > 0) ? user.workingSchedule.map((s, idx) => (
                                                <ScheduleRow key={idx} schedule={s} />
                                            )) : (
                                                <>
                                                    <ScheduleRow schedule={{ day: 'Monday', startTime: '08:00 AM', endTime: '04:00 PM', shift: 'Morning' }} />
                                                    <ScheduleRow schedule={{ day: 'Wednesday', startTime: '08:00 AM', endTime: '04:00 PM', shift: 'Morning' }} />
                                                    <ScheduleRow schedule={{ day: 'Thursday', startTime: '04:00 PM', endTime: '11:00 PM', shift: 'Evening' }} />
                                                    <ScheduleRow schedule={{ day: 'Friday', startTime: '08:00 AM', endTime: '04:00 PM', shift: 'Morning' }} />
                                                </>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>

                            {/* Documents */}
                            <Card className="!p-0 overflow-hidden">
                                <div className="px-8 py-5 border-b border-slate-100 flex items-center gap-3 bg-white">
                                    <FileText className="text-blue-600" size={20} />
                                    <h3 className="text-lg font-black text-slate-900">Documents & Attachments</h3>
                                </div>
                                <div className="p-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer">
                                            <img 
                                                src={`https://picsum.photos/seed/${i + 10}/400/300`} 
                                                alt={`Document ${i}`} 
                                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Button size="sm" variant="outline" className="text-white border-white hover:bg-white hover:text-slate-900">View</Button>
                                            </div>
                                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-slate-900/80 to-transparent">
                                                <p className="text-[10px] font-bold text-white truncate">DOC-ID-{2000 + i}.pdf</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* Deactivation Modal */}
            <Modal isOpen={deactivateModal} onClose={() => setDeactivateModal(false)} size="sm">
                 <div className="text-center py-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-900 mb-2">
                        {user.status === 'Active' ? 'Deactivate Doctor Profile?' : 'Activate Doctor Profile?'}
                    </h3>
                    <p className="text-slate-500 font-medium mb-8">
                        This will {user.status === 'Active' ? 'disable' : 'enable'} the doctor's access to the system.
                    </p>
                    <div className="flex gap-3">
                        <Button variant="outline" fullWidth onClick={() => setDeactivateModal(false)}>Cancel</Button>
                        <Button variant="danger" fullWidth isLoading={isDeactivating} onClick={handleDeactivate}>
                            {user.status === 'Active' ? 'Yes, Deactivate' : 'Yes, Activate'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default DoctorProfileDetail;
