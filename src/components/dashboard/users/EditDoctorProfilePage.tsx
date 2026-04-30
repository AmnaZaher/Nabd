import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from '../TopBar';
import { Card, Badge, Button, Input } from '../../ui';
import { staffApi } from '../../../api/staff';
import {
    Pencil,
    ShieldCheck,
    Clock,
    Plus,
    X,
    Upload,
    ChevronDown,
} from 'lucide-react';
import type { StaffProfile } from '../../../types/staff.types';

// ==================== Helper Components ====================
const FormSection = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
    <Card className="flex flex-col !p-0 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/30 flex items-center gap-3">
            <div className="text-blue-600">{icon}</div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{title}</h3>
        </div>
        <div className="p-5 space-y-5">
            {children}
        </div>
    </Card>
);

const FieldGroup = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        {children}
    </div>
);

// ==================== Main Component ====================
const EditDoctorProfilePage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [formData, setFormData] = useState<Partial<StaffProfile>>({
        name: '',
        fullNameArabic: '',
        email: '',
        phone: '',
        gender: '',
        nationalId: '',
        address: '',
        dateOfBirth: '',
        city: '',
        country: '',
        role: 'Doctor',
        department: '',
        educationalQualification: '',
        graduationYear: '',
        syndicateNumber: '',
        dateOfAppointment: '',
        assignedDept: '',
        assignedClinic: '',
        workingSchedule: [],
    });

    useEffect(() => {
        const loadStaffData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const data = await staffApi.getStaffById(id);
                if (data) {
                    setFormData(data);
                }
            } catch (error) {
                console.error('Failed to fetch doctor for editing:', error);
            } finally {
                setLoading(false);
            }
        };
        loadStaffData();
    }, [id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!id) return;
        setSaving(true);
        try {
            await staffApi.updateStaff(id, formData);
            navigate(`/dashboard/users/staff/${id}`);
        } catch (error) {
            console.error('Failed to update doctor profile:', error);
            alert('Failed to save changes. Please try again.');
        } finally {
            setSaving(false);
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
            <span className="text-blue-600 font-bold">EDIT DOCTOR PROFILE</span>
        </span>
    );

    if (loading) {
        return (
            <div className="flex flex-col h-full bg-slate-50 w-full">
                <TopBar title={breadcrumb} onMenuClick={() => {}} />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col flex-1 h-full w-full bg-slate-50 relative font-sans overflow-hidden">
            <TopBar title={breadcrumb} onMenuClick={() => {}} />

            <div className="flex-1 overflow-y-auto p-4 md:p-5 lg:p-6">
                <div className="max-w-[1400px] mx-auto pb-24">
                    
                    <div className="flex items-center justify-between mb-6 gap-4">
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                Edit Doctor Profile
                            </h1>
                            <p className="text-slate-400 font-bold text-sm">Update doctor information and assignments</p>
                        </div>
                        <Badge variant="info" className="bg-blue-50 text-blue-600 border-blue-100 font-black px-4 py-2 uppercase tracking-widest">
                            DOCTOR ID: {id || 'CP-8842-S'}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                        {/* Left Sidebar */}
                        <div className="lg:col-span-4 xl:col-span-3 space-y-5">
                            <Card className="p-8 flex flex-col items-center text-center">
                                <div className="relative mb-6 group cursor-pointer">
                                    <div className="w-36 h-36 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-slate-100">
                                        <img 
                                            src={formData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'D')}&background=random`} 
                                            alt={formData.name} 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Upload className="text-white" size={24} />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 border-4 border-white shadow-lg"></div>
                                </div>
                                <h2 className="text-xl font-black text-slate-900 mb-1">{formData.name || 'Dr. Elias Sterling'}</h2>
                                <p className="text-slate-400 font-bold text-sm mb-4">د. إيـلياس ستيرلـينغ</p>
                                <Badge variant="info" className="bg-blue-50 text-blue-600 border-0 font-black uppercase tracking-wide px-4 py-1.5 rounded-lg">Senior Neurosurgeon</Badge>
                            </Card>

                            <Card className="p-0 overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30 flex items-center gap-3">
                                    <ShieldCheck className="text-blue-600" size={18} />
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">ACCOUNT STATUS</h3>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-900">Is Active</span>
                                            <span className="text-[10px] text-slate-400 font-bold">Profile visible in clinic directory</span>
                                        </div>
                                        <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${formData.status === 'Active' ? 'bg-blue-600' : 'bg-slate-300'}`}>
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.status === 'Active' ? 'right-1' : 'left-1'}`}></div>
                                        </div>
                                    </div>
                                    <div className="space-y-4 pt-4 border-t border-slate-50">
                                        <div className="flex justify-between">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Created On</span>
                                            <span className="text-xs font-bold text-slate-900">Jan 12, 2023 - 09:44 AM</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Updated</span>
                                            <span className="text-xs font-bold text-slate-900">Oct 24, 2023 - 02:15 PM</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Main Form Area */}
                        <div className="lg:col-span-8 xl:col-span-9 space-y-5">
                            {/* Personal Information */}
                            <FormSection title="Personal Information" icon={<Pencil size={18} />}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FieldGroup label="Full Name (English)">
                                        <Input name="name" value={formData.name} onChange={handleInputChange} className="bg-slate-100/50 border-slate-200 font-bold" />
                                    </FieldGroup>
                                    <FieldGroup label="Full Name (Arabic)">
                                        <Input name="fullNameArabic" value={formData.fullNameArabic} onChange={handleInputChange} className="bg-slate-100/50 border-slate-200 font-bold text-right" dir="rtl" />
                                    </FieldGroup>
                                    <FieldGroup label="Email Address">
                                        <Input name="email" value={formData.email} onChange={handleInputChange} className="bg-slate-100/50 border-slate-200 font-bold" />
                                    </FieldGroup>
                                    <FieldGroup label="Phone Number">
                                        <Input name="phone" value={formData.phone} onChange={handleInputChange} className="bg-slate-100/50 border-slate-200 font-bold" />
                                    </FieldGroup>
                                    <FieldGroup label="Gender">
                                        <div className="relative">
                                            <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full h-11 bg-slate-100/50 border border-slate-200 rounded-xl px-4 font-bold text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                        </div>
                                    </FieldGroup>
                                    <FieldGroup label="National ID (Read-only)">
                                        <Input value={formData.nationalId} readOnly className="bg-slate-100/30 border-slate-200 font-bold text-slate-400" />
                                    </FieldGroup>
                                    <FieldGroup label="Residential Address">
                                        <Input name="address" value={formData.address} onChange={handleInputChange} className="bg-slate-100/50 border-slate-200 font-bold" />
                                    </FieldGroup>
                                    <FieldGroup label="Date of Birth">
                                        <Input name="dateOfBirth" type="date" value={formData.dateOfBirth?.split('T')[0]} onChange={handleInputChange} className="bg-slate-100/50 border-slate-200 font-bold" />
                                    </FieldGroup>
                                    <FieldGroup label="City">
                                        <Input name="city" value={formData.city} onChange={handleInputChange} className="bg-slate-100/50 border-slate-200 font-bold" />
                                    </FieldGroup>
                                    <FieldGroup label="Country">
                                        <Input name="country" value={formData.country} onChange={handleInputChange} className="bg-slate-100/50 border-slate-200 font-bold" />
                                    </FieldGroup>
                                </div>
                            </FormSection>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                                <div className="space-y-8">
                                     {/* Documents */}
                                    <Card className="!p-0 overflow-hidden">
                                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30 flex items-center gap-3">
                                            <Upload className="text-blue-600" size={18} />
                                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">DOCUMENTS & ATTACHMENTS</h3>
                                        </div>
                                        <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            <div className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-200 rounded-xl hover:border-blue-500 transition-colors cursor-pointer group">
                                                <Upload className="text-slate-300 group-hover:text-blue-500 mb-2" size={20} />
                                                <span className="text-[10px] font-black text-slate-400 text-center uppercase tracking-tighter">National ID</span>
                                            </div>
                                            <div className="flex flex-col items-center justify-center p-3 bg-blue-50/30 border border-blue-100 rounded-xl relative group">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                                                    <Badge variant="info" className="p-0 bg-transparent text-blue-600"><Plus size={14}/></Badge>
                                                </div>
                                                <span className="text-[10px] font-black text-blue-600 text-center uppercase tracking-tighter">Medical License</span>
                                                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-sm text-slate-400 cursor-pointer hover:text-red-500">
                                                    <X size={12} />
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-200 rounded-xl hover:border-blue-500 transition-colors cursor-pointer group">
                                                <Plus className="text-slate-300 group-hover:text-blue-500 mb-2" size={20} />
                                                <span className="text-[10px] font-black text-slate-400 text-center uppercase tracking-tighter">Other Docs</span>
                                            </div>
                                        </div>
                                    </Card>

                                    {/* Organization Assignment */}
                                    <FormSection title="ORGANIZATION ASSIGNMENT" icon={<Plus size={18} />}>
                                        <div className="grid grid-cols-1 gap-5">
                                            <FieldGroup label="Assigned Department">
                                                <div className="relative">
                                                    <select name="assignedDept" value={formData.assignedDept || formData.department} onChange={handleInputChange} className="w-full h-11 bg-slate-100/50 border border-slate-200 rounded-xl px-4 font-bold text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                                                        <option value="Neurosurgery">Neurosurgery</option>
                                                        <option value="Cardiology">Cardiology</option>
                                                        <option value="Pediatrics">Pediatrics</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                                </div>
                                            </FieldGroup>
                                            <FieldGroup label="Facility / Clinic">
                                                <div className="relative">
                                                    <select name="assignedClinic" value={formData.assignedClinic || formData.location} onChange={handleInputChange} className="w-full h-11 bg-slate-100/50 border border-slate-200 rounded-xl px-4 font-bold text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                                                        <option value="Specialized Wing B">Specialized Wing B</option>
                                                        <option value="Main Building A">Main Building A</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                                </div>
                                            </FieldGroup>
                                        </div>
                                    </FormSection>
                                </div>

                                {/* Professional Qualifications */}
                                <FormSection title="PROFESSIONAL QUALIFICATIONS" icon={<Plus size={18} />}>
                                    <div className="grid grid-cols-1 gap-6">
                                        <FieldGroup label="Primary Specialization">
                                            <Input name="educationalQualification" value={formData.educationalQualification} onChange={handleInputChange} className="bg-slate-100/50 border-slate-200 font-bold" />
                                        </FieldGroup>
                                        <FieldGroup label="Qualification / Degree">
                                            <Input name="qualifications" value={formData.qualifications} onChange={handleInputChange} className="bg-slate-100/50 border-slate-200 font-bold" />
                                        </FieldGroup>
                                        <div className="grid grid-cols-2 gap-4">
                                            <FieldGroup label="Graduation Year">
                                                <Input name="graduationYear" value={formData.graduationYear} onChange={handleInputChange} className="bg-slate-100/50 border-slate-200 font-bold" />
                                            </FieldGroup>
                                            <FieldGroup label="Syndicate Number">
                                                <Input name="syndicateNumber" value={formData.syndicateNumber} onChange={handleInputChange} className="bg-slate-100/50 border-slate-200 font-bold" />
                                            </FieldGroup>
                                        </div>
                                        <FieldGroup label="Clinic Appointment Date">
                                            <Input name="dateOfAppointment" type="date" value={formData.dateOfAppointment?.split('T')[0]} onChange={handleInputChange} className="bg-slate-100/50 border-slate-200 font-bold" />
                                        </FieldGroup>
                                    </div>
                                </FormSection>
                            </div>

                            {/* Assign Working Hours */}
                            <FormSection title="Assign Working Hours" icon={<Clock size={18} />}>
                                <div className="space-y-8">
                                    <div className="flex flex-wrap gap-2">
                                        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                                            <button key={day} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${day === 'Sunday' || day === 'Tuesday' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}>
                                                {day}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                                        <FieldGroup label="From">
                                            <Input type="time" defaultValue="08:00" className="bg-slate-100/50 border-slate-200 font-bold" />
                                        </FieldGroup>
                                        <div className="flex items-center justify-center pb-3 text-slate-300">
                                            <Plus size={16} className="rotate-45" />
                                        </div>
                                        <FieldGroup label="To">
                                            <Input type="time" defaultValue="16:00" className="bg-slate-100/50 border-slate-200 font-bold" />
                                        </FieldGroup>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                                        <FieldGroup label="Shift Type">
                                            <div className="relative">
                                                <select className="w-full h-11 bg-slate-100/50 border border-slate-200 rounded-xl px-4 font-bold text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                                                    <option>Morning</option>
                                                    <option>Evening</option>
                                                    <option>Night</option>
                                                </select>
                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                            </div>
                                        </FieldGroup>
                                        <Button className="h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-2">
                                            <Plus size={18} />
                                            Add Schedule
                                        </Button>
                                    </div>

                                    <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100">
                                                <Badge variant="info" className="p-0 bg-transparent text-blue-600"><Clock size={16}/></Badge>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">LIVE PREVIEW</span>
                                                <span className="text-sm font-bold text-slate-900">Sun, Tue | 08:00 AM - 04:00 PM</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </FormSection>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Footer */}
            <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-100 px-8 py-4 flex items-center justify-between z-10">
                <button 
                    className="text-red-500 hover:text-red-600 font-bold text-sm underline decoration-red-200 underline-offset-4"
                >
                    Deactivate Doctor Profile
                </button>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="px-10 font-bold" onClick={() => navigate(-1)}>Cancel</Button>
                    <Button 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 shadow-lg shadow-blue-200"
                        isLoading={saving}
                        onClick={handleSave}
                    >
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default EditDoctorProfilePage;
