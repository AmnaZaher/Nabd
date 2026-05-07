import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { staffApi } from '../../../api/staff';
import { changePassword as apiChangePassword } from '../../../api/auth';
import { 
    User, Mail, Lock, Camera, 
    Trash2, LogOut, Pencil, Save,
    CheckCircle2, AlertCircle, ShieldCheck, Upload
} from 'lucide-react';
import { Card, Button, Badge, Modal } from '../../ui';
import type { StaffProfile } from '../../../types/staff.types';
import { useNavigate } from 'react-router-dom';

// ==================== Change Password Modal ====================
const ChangePasswordModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (passwords.newPassword !== passwords.confirmPassword) {
            setError("New passwords do not match.");
            return;
        }

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('CurrentPassword', passwords.currentPassword);
            formData.append('NewPassword', passwords.newPassword);
            formData.append('ConfirmPassword', passwords.confirmPassword);

            await apiChangePassword(formData);
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 2000);
        } catch (err: any) {
            setError(err.message || "Failed to change password.");
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} size="sm">
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Password Changed!</h3>
                    <p className="text-slate-500">Your security credentials have been updated successfully.</p>
                </div>
            </Modal>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Account & Security" size="sm">
            <form onSubmit={handleSubmit} className="space-y-6 pt-2">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl text-blue-600 mb-2">
                    <ShieldCheck size={20} className="shrink-0" />
                    <p className="text-xs font-bold leading-tight">Maintain a strong password to keep your administrative account secure.</p>
                </div>

                <div className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs font-bold flex items-center gap-2">
                            <AlertCircle size={14} />
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Current Password</label>
                        <input 
                            type="password" 
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            placeholder="••••••••"
                            value={passwords.currentPassword}
                            onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">New Password</label>
                        <input 
                            type="password" 
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            placeholder="Min 12 characters"
                            value={passwords.newPassword}
                            onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Confirm Password</label>
                        <input 
                            type="password" 
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            placeholder="Repeat new password"
                            value={passwords.confirmPassword}
                            onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                            required
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <Button type="submit" fullWidth isLoading={isLoading} icon={<Save size={18} />}>
                        Save Changes
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

// ==================== Main Admin Profile Component ====================
const AdminProfile: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState<StaffProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formValues, setFormValues] = useState<any>({});

    const loadProfile = async () => {
        if (user?.id) {
            setLoading(true);
            try {
                const data = await staffApi.getMyProfile(user.id, user.name, user.role);
                if (data) {
                    setProfile(data);
                    setFormValues({
                        FullNameEnglish: data.name,
                        FullNameArabic: (data as any).fullNameArabic || "",
                        Email: data.email,
                        PhoneNumber: data.phone,
                        Address: data.address,
                        City: data.location,
                        NationalId: data.nationalId,
                        Gender: data.gender,
                        Country: (data as any).country || "",
                        DateOfBirth: (data as any).dateOfBirth ? new Date((data as any).dateOfBirth).toLocaleDateString() : "",
                    });
                }
            } catch (error) {
                console.error('Failed to fetch admin profile:', error);
                setError("Failed to load profile data.");
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        loadProfile();
    }, [user?.id]);

    const handleSave = async () => {
        if (!profile?.id) return;
        setIsSaving(true);
        setError(null);
        try {
            await staffApi.updateStaff(profile.id, formValues);
            setIsEditing(false);
            await loadProfile(); // Refresh data
        } catch (err: any) {
            console.error('Save failed:', err);
            setError(err.message || "Failed to save changes.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!profile) return null;

    const InputField = ({ label, value, name, type = "text", dir = "ltr" }: any) => (
        <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
            {isEditing && name ? (
                <input 
                    type={type}
                    value={formValues[name] || ''}
                    onChange={(e) => setFormValues({...formValues, [name]: e.target.value})}
                    dir={dir}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                />
            ) : (
                <div className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700">
                    {value || 'N/A'}
                </div>
            )}
        </div>
    );

    return (
        <div className="flex-1 overflow-y-auto bg-slate-50">
            <div className="max-w-7xl mx-auto p-4 md:p-10 space-y-8">
                
                {/* Profile Header */}
                <Card className="p-8 lg:p-12 relative overflow-visible">
                    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                        {/* Avatar Section */}
                        <div className="relative group shrink-0">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-2 border-2 border-blue-50 shadow-inner relative">
                                <img 
                                    src={profile.avatar} 
                                    alt={profile.name} 
                                    className="w-full h-full object-cover rounded-full bg-slate-100" 
                                />
                                <div className="absolute bottom-4 right-4 w-5 h-5 rounded-full bg-emerald-500 border-4 border-white shadow-sm ring-1 ring-emerald-500/10"></div>
                            </div>
                            <button className="absolute inset-0 bg-slate-900/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white cursor-pointer">
                                <Camera size={24} />
                            </button>
                        </div>

                        {/* Info & Actions */}
                        <div className="flex-1 text-center md:text-left space-y-4">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                                    {profile.name}
                                </h1>
                                <Badge variant="info" className="uppercase tracking-widest font-black text-[10px] px-3 py-1.5 shadow-sm">
                                    {profile.status}
                                </Badge>
                            </div>
                            
                            <div className="space-y-2">
                                <p className="text-lg font-bold text-slate-500">{profile.role || 'System Administrator'}</p>
                                <div className="flex items-center justify-center md:justify-start gap-2 text-slate-400">
                                    <Mail size={16} />
                                    <span className="text-sm font-bold">{profile.email}</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-4">
                                <Button variant="outline" icon={<Upload size={18} />} className="rounded-xl font-bold border-slate-200">
                                    Upload Photo
                                </Button>
                                {!isEditing ? (
                                    <Button 
                                        variant="primary" 
                                        icon={<Pencil size={18} />} 
                                        onClick={() => setIsEditing(true)}
                                        className="rounded-xl font-bold shadow-blue-200"
                                    >
                                        Edit Profile
                                    </Button>
                                ) : (
                                    <Button 
                                        variant="primary" 
                                        icon={<Save size={18} />} 
                                        onClick={handleSave}
                                        isLoading={isSaving}
                                        className="rounded-xl font-bold"
                                    >
                                        Save All Changes
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Information Grid */}
                <Card className="p-8 md:p-12">
                    <div className="flex items-center gap-3 mb-10 border-b border-slate-50 pb-6">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                            <User size={22} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Personal Information</h2>
                        
                        <div className="ml-auto flex items-center gap-2">
                            <span className="text-[11px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
                            <div className="w-10 h-5 bg-emerald-500 rounded-full relative shadow-inner">
                                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm"></div>
                            </div>
                        </div>
                    </div>

                    {error && !showPasswordModal && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold flex items-center gap-2 border border-red-100">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                        <InputField label="UserID" value={profile.id} />
                        <div className="hidden md:block"></div> {/* Spacer */}
                        
                        <InputField label="Full Name (English)" value={profile.name} name="FullNameEnglish" />
                        <InputField label="Full Name (Arabic)" value={formValues.FullNameArabic} name="FullNameArabic" dir="rtl" />
                        
                        <InputField label="Email Address" value={profile.email} name="Email" type="email" />
                        <InputField label="Phone Number" value={profile.phone} name="PhoneNumber" type="tel" />
                        
                        <InputField label="Address" value={profile.address} name="Address" />
                        <InputField label="Country" value={formValues.Country} name="Country" />
                        
                        <InputField label="City" value={profile.location || ''} name="City" />
                        <InputField label="NationalID" value={profile.nationalId} name="NationalId" />
                        
                        <InputField label="Gender" value={profile.gender} name="Gender" />
                        <InputField label="Date of Birth" value={formValues.DateOfBirth} name="DateOfBirth" />
                    </div>
                </Card>

                {/* Bottom Actions */}
                <div className="flex flex-col md:flex-row items-center gap-6 justify-between pt-4 pb-10">
                    <div className="flex items-center gap-3 text-slate-400 bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100">
                        <AlertCircle size={18} />
                        <p className="text-sm font-bold">Last account update was on Oct 12, 2023</p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Button 
                            variant="outline" 
                            icon={<LogOut size={18} />} 
                            className="rounded-xl font-bold border-slate-200"
                            onClick={handleLogout}
                        >
                            Logout
                        </Button>
                        <Button 
                            variant="danger" 
                            icon={<Trash2 size={18} />} 
                            className="bg-red-50 text-red-600 border-red-100 hover:bg-red-100 rounded-xl font-bold"
                        >
                            Delete Account
                        </Button>
                        <Button 
                            variant="primary" 
                            icon={<Lock size={18} />} 
                            className="rounded-xl font-bold shadow-blue-200"
                            onClick={() => setShowPasswordModal(true)}
                        >
                            Change password
                        </Button>
                    </div>
                </div>

            </div>

            <ChangePasswordModal 
                isOpen={showPasswordModal} 
                onClose={() => setShowPasswordModal(false)} 
            />
        </div>
    );
};

export default AdminProfile;
