import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from '../TopBar';
import { Card, Badge, Button, Modal } from '../../ui';
import { staffApi } from '../../../api/staff';
import {
    MapPin,
    Mail,
    Calendar,
    ShieldCheck,
    History,
    Pencil,
    AlertTriangle,
    Trash2,
} from 'lucide-react';
import type { StaffProfile } from '../../../types/staff.types';
import { EditUserModal } from './EditUserModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import DoctorProfileDetail from './DoctorProfileDetail';

// ==================== Helper Components ====================
const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <div>
        <p className="text-xs font-bold text-[#b0bec5] mb-1">{label}</p>
        <p className="text-base font-bold text-slate-900 break-all">{value || 'N/A'}</p>
    </div>
);

const AccountInfoItem = ({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
}) => (
    <div className="flex gap-4 items-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
            {icon}
        </div>
        <div>
            <p className="text-[11px] font-black tracking-widest text-[#b0bec5] uppercase mb-0.5">
                {label}
            </p>
            {typeof value === 'string' ? (
                <p className="text-sm font-extrabold text-slate-900">{value}</p>
            ) : (
                value
            )}
        </div>
    </div>
);

// ==================== Main Component ====================
const UserProfileDetail = ({ onMenuClick }: { onMenuClick: () => void }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<StaffProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [deactivateModal, setDeactivateModal] = useState(false);
    const [isDeactivating, setIsDeactivating] = useState(false);

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const loadStaffData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            // Fetch staff by ID or Username (searching via SearchKey)
            const data = await staffApi.getStaffById(id);
            if (data) {
                setUser(data);
            } else {
                console.error('Staff member not found');
            }
        } catch (error) {
            console.error('Failed to fetch staff profile:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStaffData();
    }, [id]);

    const onDeleteSuccess = () => {
        navigate('/dashboard/users');
    };

    const handleDeactivate = async () => {
        setIsDeactivating(true);
        try {
            // TODO: Call deactivate API
            console.log('Deactivating user:', user?.id);
            await new Promise((r) => setTimeout(r, 1000)); // Simulate API
            setUser((prev) => prev ? { ...prev, status: prev.status === 'Active' ? 'Disabled' : 'Active' } : prev);
            setDeactivateModal(false);
        } catch (err) {
            console.error('Deactivation failed:', err);
        } finally {
            setIsDeactivating(false);
        }
    };

    // Breadcrumb title — no more `as any`
    const breadcrumb: React.ReactNode = (
        <span className="text-slate-400">
            <span
                className="cursor-pointer hover:text-slate-600 transition-colors"
                onClick={() => navigate('/dashboard/users')}
            >
                User Management
            </span>
            <span className="mx-2">&rsaquo;</span>
            <span className="text-slate-900">Profile Detail</span>
        </span>
    );

    if (loading) {
        return (
            <div className="flex flex-col h-full bg-slate-50 relative font-sans w-full">
                <TopBar
                    title={breadcrumb}
                    onMenuClick={onMenuClick}
                    onAddUserClick={() => {}}
                />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    if (!user) return null;

    // Check if the user is a doctor to show the specialized profile
    const isDoctor = user.role?.toLowerCase().includes('doctor') || 
                     user.role?.toLowerCase().trim() === 'doctor' ||
                     user.role === '2';

    if (isDoctor) {
        return <DoctorProfileDetail onMenuClick={onMenuClick} />;
    }

    return (
        <div className="flex flex-col flex-1 h-full w-full bg-slate-50 relative font-sans overflow-hidden">
            <TopBar
                title={breadcrumb}
                onMenuClick={onMenuClick}
                onAddUserClick={() => {}}
            />

            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-[1200px] mx-auto space-y-6 md:space-y-8 pb-10">
                    {/* Header Section */}
                    <Card className="p-6 lg:p-10 flex flex-col md:flex-row items-center gap-6 md:gap-8 relative">
                        <div className="absolute top-6 right-6 flex items-center gap-3">
                            <Button
                                variant="danger"
                                size="sm"
                                icon={<Trash2 size={14} />}
                                onClick={() => setDeleteModalOpen(true)}
                            >
                                Delete
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                icon={<Pencil size={14} />}
                                onClick={() => setEditModalOpen(true)}
                            >
                                Edit
                            </Button>
                        </div>

                        <div className="relative shrink-0">
                            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full p-2 border-2 border-blue-50">
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-full bg-slate-100" />
                            </div>
                            {user.status === 'Active' && (
                                <div className="absolute bottom-4 right-4 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm"></div>
                            )}
                        </div>

                        <div className="flex-1 text-center md:text-left pt-2 md:pt-0">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-2">
                                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                                    {user.name}
                                </h1>
                                <Badge variant="info" className="uppercase tracking-wider font-black text-xs px-3 py-1.5">
                                    {user.role}
                                </Badge>
                            </div>
                            <p className="text-base text-slate-400 font-bold mb-6">
                                {user.department} <span className="mx-2">&bull;</span> Medical License ID: {user.licenseId}
                            </p>
                            <div className="flex flex-wrap flex-col md:flex-row items-center justify-center md:justify-start gap-3">
                                <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                                    <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                                    <span className="text-sm font-bold text-slate-600 truncate">{user.location}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                                    <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                                    <span className="text-sm font-bold text-slate-600 truncate">{user.email}</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                        {/* Personal Information */}
                        <Card className="overflow-hidden flex flex-col !p-0">
                            <div className="px-8 py-6 border-b border-slate-100/60">
                                <h2 className="text-xl font-extrabold text-slate-900 text-center tracking-tight">Personal Information</h2>
                            </div>
                            <div className="p-8 space-y-6 flex-1">
                                <InfoRow label="Full Name" value={user.name} />
                                <InfoRow label="National ID" value={user.nationalId} />
                                <InfoRow label="Phone Number" value={user.phone} />
                                <InfoRow label="Email Address" value={user.email} />
                                <InfoRow label="Address" value={user.address} />
                                <InfoRow label="Gender" value={user.gender} />
                            </div>
                        </Card>

                        {/* Professional Details */}
                        <Card className="overflow-hidden flex flex-col !p-0">
                            <div className="px-8 py-6 border-b border-slate-100/60">
                                <h2 className="text-xl font-extrabold text-slate-900 text-center tracking-tight">Professional Details</h2>
                            </div>
                            <div className="p-8 space-y-6 flex-1">
                                <InfoRow label="Clinical Role" value={user.role} />
                                <InfoRow label="Department" value={user.department} />
                                <div>
                                    <p className="text-xs font-bold text-[#b0bec5] mb-1">Clinic Assignment</p>
                                    <span className="inline-block mt-1 bg-[#eff6ff] text-blue-600 px-3 py-1.5 rounded-lg text-sm font-bold">
                                        {user.location}
                                    </span>
                                </div>
                                <InfoRow label="License Number" value={`${user.licenseId} (${user.status})`} />
                                <InfoRow label="Professional Experience" value={user.experience} />
                                <InfoRow label="Qualifications" value={user.qualifications} />
                            </div>
                        </Card>

                        {/* Work & Account Info */}
                        <Card className="overflow-hidden flex flex-col !p-0">
                            <div className="px-8 py-6 border-b border-slate-100/60">
                                <h2 className="text-xl font-extrabold text-slate-900 text-center tracking-tight">Work & Account Info</h2>
                            </div>
                            <div className="p-6 md:p-8 space-y-6 flex-1 flex flex-col">
                                <div className="bg-[#f8fbff] rounded-[20px] p-6 border border-blue-50/50">
                                    <h3 className="text-sm font-black text-blue-600 tracking-widest uppercase mb-4">WEEKLY SCHEDULE</h3>
                                    <div className="flex justify-between items-center mb-4 px-2">
                                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                                            <div key={i} className="flex flex-col items-center gap-2">
                                                <span className="text-xs font-black text-[#b0bec5]">{day}</span>
                                                <div className={`w-2.5 h-2.5 rounded-full ${i < 5 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-sm font-bold text-slate-500">Morning Shift (8 AM - 4 PM)</p>
                                </div>

                                <AccountInfoItem
                                    icon={<Calendar className="w-5 h-5 text-slate-400" />}
                                    label="NEXT SHIFT"
                                    value="Tomorrow, 08:00 AM"
                                />
                                <AccountInfoItem
                                    icon={<ShieldCheck className="w-5 h-5 text-slate-400" />}
                                    label="ACCOUNT STATUS"
                                    value={
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-extrabold text-slate-900">{user.status}</span>
                                            <div className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                        </div>
                                    }
                                />
                                <AccountInfoItem
                                    icon={<History className="w-5 h-5 text-slate-400" />}
                                    label="LAST LOGIN"
                                    value={user.lastLogin}
                                />

                                {/* Deactivate / Activate Button */}
                                <div className="mt-auto pt-6">
                                    <Button
                                        variant={user.status === 'Active' ? 'danger' : 'primary'}
                                        fullWidth
                                        size="lg"
                                        className="uppercase tracking-wide"
                                        onClick={() => setDeactivateModal(true)}
                                    >
                                        {user.status === 'Active' ? 'Deactivate Account' : 'Activate Account'}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Deactivate / Activate Confirmation Modal */}
            <Modal
                isOpen={deactivateModal}
                onClose={() => setDeactivateModal(false)}
                size="sm"
            >
                <div className="text-center py-4">
                    <div className={`w-16 h-16 ${user.status === 'Active' ? 'bg-red-100' : 'bg-blue-100'} rounded-full flex items-center justify-center mx-auto mb-6`}>
                        <AlertTriangle className={`w-8 h-8 ${user.status === 'Active' ? 'text-red-600' : 'text-blue-600'}`} />
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-900 mb-2">
                        {user.status === 'Active' ? 'Deactivate Account?' : 'Activate Account?'}
                    </h3>
                    <p className="text-slate-500 font-medium mb-8">
                        {user.status === 'Active'
                            ? `This will disable ${user.name}'s access to the system. You can reactivate later.`
                            : `This will restore ${user.name}'s access to the system.`
                        }
                    </p>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            fullWidth
                            onClick={() => setDeactivateModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant={user.status === 'Active' ? 'danger' : 'primary'}
                            fullWidth
                            isLoading={isDeactivating}
                            onClick={handleDeactivate}
                        >
                            {user.status === 'Active' ? 'Yes, Deactivate' : 'Yes, Activate'}
                        </Button>
                    </div>
                </div>
            </Modal>

            <EditUserModal 
                isOpen={editModalOpen} 
                onClose={() => setEditModalOpen(false)} 
                userType="staff" 
                userId={user.id} 
                onSuccess={loadStaffData} 
            />

            <DeleteConfirmModal 
                isOpen={deleteModalOpen} 
                onClose={() => setDeleteModalOpen(false)} 
                userType="staff" 
                userId={user.id} 
                userName={user.name} 
                onSuccess={onDeleteSuccess} 
            />
        </div>
    );
};

export default UserProfileDetail;