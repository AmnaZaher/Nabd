import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import TopBar from '../TopBar';
import { Card, Badge, Button, Modal } from '../../ui';
import { profileApi } from '../../../api/profile';
import type { DoctorProfile, DoctorScheduleEntry, DoctorFile } from '../../../api/profile';
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

// ==================== Helper Components ====================
const InfoSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <Card className="flex flex-col !p-0 overflow-hidden h-full">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">{title}</h3>
        </div>
        <div className="p-6 space-y-4">{children}</div>
    </Card>
);

const InfoItem = ({ label, value, subValue }: { label: string; value: string | React.ReactNode; subValue?: string }) => (
    <div className="flex flex-col gap-1">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        <div className="text-sm font-bold text-slate-900 break-words">{value || 'N/A'}</div>
        {subValue && <div className="text-xs text-slate-400 font-medium">{subValue}</div>}
    </div>
);

const ScheduleRow = ({ schedule }: { schedule: DoctorScheduleEntry }) => (
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
    const { id: paramId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user: authUser } = useAuth();

    const id = paramId || authUser?.id;

    const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
    const [schedule, setSchedule] = useState<DoctorScheduleEntry[]>([]);
    const [files, setFiles] = useState<DoctorFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [deactivateModal, setDeactivateModal] = useState(false);
    const [isDeactivating, setIsDeactivating] = useState(false);

    const loadData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            // Fetch profile, schedule, and files in parallel
            const [profileData, scheduleData, filesData] = await Promise.all([
                profileApi.getDoctorProfile(id),
                profileApi.getDoctorSchedule(id),
                profileApi.getUserFiles(id),
            ]);
            setDoctor(profileData);
            setSchedule(scheduleData);
            setFiles(filesData);
        } catch (error) {
            console.error('Failed to load doctor data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const handleDeactivate = async () => {
        if (!doctor || !id) return;
        setIsDeactivating(true);
        try {
            await profileApi.editDoctorProfile(id, {
                IsActive: doctor.isActive ? false : true,
            });
            setDoctor(prev => prev ? { ...prev, isActive: !prev.isActive, status: prev.isActive ? 'Disabled' : 'Active' } : prev);
            setDeactivateModal(false);
        } catch (err) {
            console.error('Deactivation failed:', err);
        } finally {
            setIsDeactivating(false);
        }
    };

    const breadcrumb = (
        <span className="text-slate-400">
            <span className="cursor-pointer hover:text-slate-600 transition-colors" onClick={() => navigate('/dashboard/users')}>
                USER MANAGEMENT
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

    if (!doctor) return (
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
            <TopBar title={breadcrumb} onMenuClick={onMenuClick} />

            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-[1600px] mx-auto pb-10">

                    {/* Header Controls */}
                    <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                Doctor Profile
                                <Badge variant="info" className="text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 border-blue-100">
                                    {doctor.id}
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
                                {doctor.isActive ? 'Deactivate' : 'Activate'}
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
                                            src={doctor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.nameEngLish)}&background=random`}
                                            alt={doctor.nameEngLish}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-white shadow-lg ${doctor.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 mb-1">{doctor.nameEngLish}</h2>
                                <p className="text-slate-400 font-bold text-sm mb-6">{doctor.nameArabic}</p>

                                <div className="w-full space-y-3">
                                    <div className="flex items-center gap-3 bg-blue-50/50 p-3 rounded-xl border border-blue-50">
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                            <Briefcase className="text-blue-600" size={16} />
                                        </div>
                                        <span className="text-xs font-black text-blue-600 uppercase tracking-wide">{doctor.role || 'Doctor'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center">
                                            <MapPin className="text-slate-600" size={16} />
                                        </div>
                                        <span className="text-xs font-black text-slate-600 uppercase tracking-wide">{doctor.location || doctor.city}</span>
                                    </div>
                                    <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 overflow-hidden">
                                        <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
                                            <Mail className="text-slate-600" size={16} />
                                        </div>
                                        <span className="text-xs font-bold text-slate-600 truncate">{doctor.email}</span>
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
                                        <Badge
                                            variant={doctor.isActive ? 'success' : 'danger'}
                                            className={`${doctor.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'} border-0 uppercase text-[10px] font-black`}
                                        >
                                            {doctor.status}
                                        </Badge>
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
                                        <InfoItem label="Full Name (English)" value={doctor.nameEngLish} />
                                        <InfoItem label="Full Name (Arabic)" value={doctor.nameArabic} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <InfoItem label="Email" value={doctor.email} />
                                            <InfoItem label="Phone" value={doctor.phoneNumber} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <InfoItem label="Gender" value={doctor.gender} />
                                            <InfoItem label="DOB" value={doctor.dateOfBirth ? new Date(doctor.dateOfBirth).toLocaleDateString() : 'N/A'} />
                                        </div>
                                        <InfoItem label="Address" value={doctor.address} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <InfoItem label="City" value={doctor.city} />
                                            <InfoItem label="Country" value={doctor.country} />
                                        </div>
                                        <InfoItem label="National ID" value={doctor.nationalId} />
                                    </div>
                                </InfoSection>

                                {/* Professional Information */}
                                <InfoSection title="Professional Information">
                                    <div className="grid grid-cols-1 gap-6">
                                        <InfoItem label="Specialization" value={doctor.specialization} />
                                        <InfoItem label="Educational Qualification" value={doctor.educationalQualification} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <InfoItem label="Graduation Year" value={String(doctor.graduationYear)} />
                                            <InfoItem label="Medical Syndicate No." value={doctor.medicalSyndicateNumber} />
                                        </div>
                                        <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-3">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Organization Assignment</span>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-500">Department</span>
                                                <span className="text-xs font-black text-slate-900">{doctor.department || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-500">Clinic ID</span>
                                                <span className="text-xs font-black text-slate-900">{doctor.clinicId || 'N/A'}</span>
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
                                        {schedule.length} Slots Active
                                    </Badge>
                                </div>
                                <div className="overflow-x-auto">
                                    {schedule.length > 0 ? (
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
                                                {schedule.map((s, idx) => <ScheduleRow key={idx} schedule={s} />)}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className="py-12 text-center text-slate-400 font-bold text-sm">No schedule assigned yet.</div>
                                    )}
                                </div>
                            </Card>

                            {/* Documents */}
                            <Card className="!p-0 overflow-hidden">
                                <div className="px-8 py-5 border-b border-slate-100 flex items-center gap-3 bg-white">
                                    <FileText className="text-blue-600" size={20} />
                                    <h3 className="text-lg font-black text-slate-900">Documents & Attachments</h3>
                                </div>
                                <div className="p-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {files.length > 0 ? files.map((file) => (
                                        <a
                                            key={file.id}
                                            href={file.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer block"
                                        >
                                            <img
                                                src={file.fileUrl}
                                                alt={file.fileName}
                                                onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=DOC&background=e2e8f0&color=94a3b8`; }}
                                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="text-white text-xs font-bold border border-white rounded px-3 py-1">View</span>
                                            </div>
                                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-slate-900/80 to-transparent">
                                                <p className="text-[10px] font-bold text-white truncate">{file.fileName}</p>
                                            </div>
                                        </a>
                                    )) : (
                                        <div className="col-span-5 py-10 text-center text-slate-400 font-bold text-sm">No documents uploaded.</div>
                                    )}
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
                        {doctor.isActive ? 'Deactivate Doctor Profile?' : 'Activate Doctor Profile?'}
                    </h3>
                    <p className="text-slate-500 font-medium mb-8">
                        This will {doctor.isActive ? 'disable' : 'enable'} the doctor's access to the system.
                    </p>
                    <div className="flex gap-3">
                        <Button variant="outline" fullWidth onClick={() => setDeactivateModal(false)}>Cancel</Button>
                        <Button variant="danger" fullWidth isLoading={isDeactivating} onClick={handleDeactivate}>
                            {doctor.isActive ? 'Yes, Deactivate' : 'Yes, Activate'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default DoctorProfileDetail;