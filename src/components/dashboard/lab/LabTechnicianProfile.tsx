import React, { useState, useEffect } from "react";
import {
  User,
  Briefcase,
  Folder,
  Clock,
  Key,
  Edit3,
  Upload,
  CheckCircle2,
  FileText,
  FileIcon,
  Image as ImageIcon,
  FileArchive,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { staffApi } from "../../../api/staff";
import type { StaffProfile } from "../../../types/staff.types";
import TopBar from "../TopBar";
import ChangePasswordModal from "../RECEPTIONIST/ChangePasswordModal";

interface LabTechnicianProfileProps {
  onMenuClick?: () => void;
}

const LabTechnicianProfile: React.FC<LabTechnicianProfileProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.id) {
        setLoading(true);
        try {
          const data = await staffApi.getMyProfile(user.id, user.name, user.role);
          if (data) setProfile(data);
        } catch (error) {
          console.error("Failed to fetch profile:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Fallback to static data if no profile returned
  const displayProfile = profile || {
    name: "Sarah Jenkins",
    fullNameArabic: "ساره جنكينز",
    role: "Senior Lab Technician",
    status: "Active",
    email: "s.jenkins@precision.clinic",
    phone: "+1 555-0123",
    gender: "Female",
    dateOfBirth: "1990-05-12T00:00:00.000Z",
    nationalId: "294081234567",
    address: "123 Health Ave",
    city: "Chicago",
    country: "USA",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&h=200&auto=format&fit=crop",
    department: "Biochemistry & Hematology"
  };

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] overflow-y-auto">
      <TopBar title="LABORATORY PROFILE" showAddUser={false} onMenuClick={onMenuClick || (() => {})} />

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6 pb-20">
        
        {/* Top Header Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src={displayProfile.avatar}
                  alt={displayProfile.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 border-[3px] border-white rounded-full bg-green-500"></div>
            </div>

            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold text-slate-900">{displayProfile.name}</h2>
                <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-wider rounded-md">
                  {displayProfile.status}
                </span>
              </div>
              <p className="text-[#1A6FC4] font-semibold text-[15px] mb-3">
                {displayProfile.role}
              </p>

              <div className="flex flex-col gap-1.5 text-sm font-medium text-slate-500">
                <div className="flex items-center gap-2">
                  <Briefcase size={16} className="text-slate-400" />
                  {displayProfile.department}
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-slate-400" />
                  Morning Shift (08:00 - 16:00)
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={() => setIsPasswordModalOpen(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg font-semibold text-sm transition-colors"
            >
              <Key size={16} /> Change Password
            </button>
            <button 
              onClick={() => navigate("edit")}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1A6FC4] text-white hover:bg-[#165DA5] rounded-lg font-semibold text-sm transition-colors shadow-sm"
            >
              <Edit3 size={16} /> Edit Profile
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-6">
              <User size={20} className="text-[#1A6FC4]" />
              <h3 className="text-[17px] font-bold text-slate-800">Personal Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <InfoField label="FULL NAME (ENGLISH)" value={displayProfile.name} />
              <InfoField label="FULL NAME (ARABIC)" value={displayProfile.fullNameArabic || "--"} isArabic />
              <InfoField label="NATIONAL ID" value={displayProfile.nationalId || "--"} />
              <InfoField label="GENDER" value={displayProfile.gender || "--"} />
              <InfoField label="DATE OF BIRTH" value={displayProfile.dateOfBirth ? new Date(displayProfile.dateOfBirth).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "--"} />
              <InfoField label="PHONE" value={displayProfile.phone || "--"} />
              <div className="md:col-span-2">
                <InfoField label="EMAIL" value={displayProfile.email || "--"} isLink />
              </div>
              <InfoField label="ADDRESS" value={displayProfile.address || "--"} />
              <InfoField label="CITY/COUNTRY" value={`${displayProfile.city || '--'}, ${displayProfile.country || '--'}`} />
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-6">
              <Briefcase size={20} className="text-[#1A6FC4]" />
              <h3 className="text-[17px] font-bold text-slate-800">Professional Information</h3>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <span className="text-sm font-medium text-slate-500">License Number</span>
                <span className="text-sm font-bold text-slate-800">LT-2023-8842</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <span className="text-sm font-medium text-slate-500">Employment Date</span>
                <span className="text-sm font-bold text-slate-800">Jan 15, 2021</span>
              </div>
              
              <div>
                <span className="block text-sm font-medium text-slate-500 mb-3">Allowed Test Types</span>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">Biochemistry</span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">Hematology</span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">Immunology</span>
                </div>
              </div>

              <div>
                <span className="block text-sm font-medium text-slate-500 mb-3">Permissions</span>
                <div className="space-y-3">
                  <PermissionRow label="Can Perform Tests" />
                  <PermissionRow label="Can Approve Results" />
                  <PermissionRow label="Can Manage Equipment" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Document Portal */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Folder size={20} className="text-[#1A6FC4]" />
              <h3 className="text-[17px] font-bold text-slate-800">Document Portal</h3>
            </div>
            <button className="flex items-center gap-1.5 text-sm font-bold text-[#1A6FC4] hover:text-[#165DA5] transition-colors">
              <Upload size={16} /> Upload New
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <DocumentCard title="ID Card" size="1.2 MB" type="PDF" icon="id" />
            <DocumentCard title="Qualification Certificate" size="4.5 MB" type="PDF" icon="cert" />
            <DocumentCard title="Internship Certificate" size="2.1 MB" type="JPG" icon="img" />
            <DocumentCard title="Practice License" size="3.8 MB" type="PDF" icon="license" />
            <DocumentCard title="Health Certificate" size="1.1 MB" type="PDF" icon="health" />
            <DocumentCard title="Personal Photos" size="12.4 MB" type="ZIP" icon="zip" />
            <DocumentCard title="Professional CV" size="0.9 MB" type="PDF" icon="cv" />
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-6">
            <User size={20} className="text-[#1A6FC4]" />
            <h3 className="text-[17px] font-bold text-slate-800">Account Information</h3>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
              <span className="text-sm font-medium text-slate-500">Account Status</span>
              <div className="flex items-center gap-1.5 text-[#1A6FC4] font-bold text-sm">
                <CheckCircle2 size={16} /> Verified
              </div>
            </div>
            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
              <span className="text-sm font-medium text-slate-500">Created At</span>
              <span className="text-sm font-medium text-slate-800">Jan 10, 2021</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
              <span className="text-sm font-medium text-slate-500">Last Updated</span>
              <span className="text-sm font-medium text-slate-800">Oct 24, 2023</span>
            </div>
            <div className="flex justify-between items-center pb-2">
              <span className="text-sm font-medium text-slate-500">Last Login</span>
              <span className="text-sm font-bold text-slate-800">Today, 08:05 AM</span>
            </div>
          </div>
        </div>

      </main>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
};

// Helper Components
const InfoField = ({ label, value, isArabic, isLink }: { label: string, value: string, isArabic?: boolean, isLink?: boolean }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
      {label}
    </span>
    {isLink ? (
      <a href={`mailto:${value}`} className="text-[14px] font-bold text-[#1A6FC4] hover:underline">
        {value}
      </a>
    ) : (
      <span className={`text-[14px] font-bold text-slate-800 ${isArabic ? 'text-right font-arabic' : ''}`}>
        {value}
      </span>
    )}
  </div>
);

const PermissionRow = ({ label }: { label: string }) => (
  <div className="flex items-center gap-2.5">
    <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center">
      <CheckCircle2 size={14} className="text-[#1A6FC4]" />
    </div>
    <span className="text-sm font-semibold text-slate-700">{label}</span>
  </div>
);

const DocumentCard = ({ title, size, type, icon }: { title: string, size: string, type: string, icon: string }) => {
  const getIcon = () => {
    switch (icon) {
      case 'id': return <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 mb-3"><User size={20} /></div>;
      case 'cert': return <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 mb-3"><FileText size={20} /></div>;
      case 'img': return <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 mb-3"><ImageIcon size={20} /></div>;
      case 'license': return <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500 mb-3"><FileText size={20} /></div>;
      case 'health': return <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-500 mb-3"><FileText size={20} /></div>;
      case 'zip': return <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 mb-3"><FileArchive size={20} /></div>;
      case 'cv': return <div className="w-10 h-10 rounded-lg bg-[#1A6FC4] flex items-center justify-center text-white mb-3"><FileText size={20} /></div>;
      default: return <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 mb-3"><FileIcon size={20} /></div>;
    }
  };

  return (
    <div className="p-4 border border-slate-100 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer bg-slate-50/50">
      {getIcon()}
      <h4 className="text-[13px] font-bold text-slate-800 leading-tight mb-1">{title}</h4>
      <p className="text-[11px] font-medium text-slate-500">
        {type} • {size}
      </p>
    </div>
  );
};

export default LabTechnicianProfile;
