import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Edit3,
  User,
  Briefcase,
  Info,
  LogOut,
  Trash2,
  Key,
  Calendar,
  UserCheck,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ChangePasswordModal from "./ChangePasswordModal";
import { useAuth } from "../../../context/AuthContext";
import { staffApi } from "../../../api/staff";
import type { StaffProfile } from "../../../types/staff.types";

const ReceptionistProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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
      }
    };
    fetchProfile();
  }, [user?.id]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A6FC4]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="w-full min-h-screen bg-[#F8FAFC] flex items-center justify-center flex-col gap-4">
        <p className="text-slate-500 font-bold">Failed to load profile data.</p>
        <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="w-full h-screen overflow-y-auto bg-[#F8FAFC] p-4 md:p-8 font-sans pb-20">
      {/* Main Profile Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900">
            Receptionist Profile
          </h2>
          <p className="text-slate-500 font-medium">
            View profile information and administrative access.
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-700 transition-colors"
          >
            <ArrowLeft size={18} /> Back
          </button>
          <button
            onClick={() => navigate("edit")}
            className="flex items-center gap-2 bg-[#1A6FC4] text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-[#165DA5] transition-colors"
          >
            <Edit3 size={18} /> Edit Profile
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100 text-center relative overflow-hidden">
            {/* Avatar Decoration */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-[3rem] -z-0 opacity-50"></div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="relative mb-6">
                <div className="w-40 h-40 rounded-2xl overflow-hidden border-4 border-[#1A6FC4] p-1 bg-slate-50">
                  <img
                    src={profile.avatar || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&h=200&auto=format&fit=crop"}
                    alt={profile.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <div className={`absolute bottom-2 right-2 w-6 h-6 border-4 border-white rounded-full ${profile.status === 'Active' ? 'bg-green-500' : 'bg-slate-400'}`}></div>
              </div>

              <h3 className="text-2xl font-black text-slate-900">
                {profile.name}
              </h3>
              {profile.fullNameArabic && (
                <p className="text-slate-400 font-bold mb-4">({profile.fullNameArabic})</p>
              )}

              <div className="inline-block px-4 py-1.5 bg-blue-50 text-[#1A6FC4] rounded-full text-xs font-black uppercase tracking-widest mb-2">
                {profile.role || "Receptionist"}
              </div>
              <div className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 ${profile.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-600'}`}>
                {profile.status}
              </div>

              <div className="w-full border-t border-slate-100 pt-8">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                  Assigned Departments
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <span className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">
                    {profile.department || "General"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Information Cards */}
        <div className="lg:col-span-8 space-y-8">
          {/* Personal Information */}
          <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-10">
              <div className="p-2 bg-blue-50 text-[#1A6FC4] rounded-lg">
                <User size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-800">
                Personal Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
              <InfoField
                label="Full Name (English)"
                value={profile.name}
              />
              <InfoField
                label="Full Name (Arabic)"
                value={profile.fullNameArabic || "--"}
                isArabic
              />
              <InfoField label="ID" value={profile.id} />
              <InfoField
                label="Email Address"
                value={profile.email || "--"}
              />
              <InfoField label="Phone Number" value={profile.phone || "--"} />
              <InfoField label="Gender" value={profile.gender || "--"} />
              <InfoField
                label="Residential Address"
                value={profile.address || "--"}
              />
              <InfoField label="Date of Birth" value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : "--"} />
              <InfoField label="National ID" value={profile.nationalId || "--"} />
              <InfoField label="City / Country" value={`${profile.city || '--'}, ${profile.country || '--'}`} />
            </div>
          </section>

          {/* Work Information */}
          <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-10">
              <div className="p-2 bg-blue-50 text-[#1A6FC4] rounded-lg">
                <Briefcase size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-800">
                Work Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                  Last Login
                </p>
                <div className="flex items-center gap-2 font-black text-slate-800">
                  <Calendar size={18} className="text-slate-400" />
                  {profile.lastLogin ? new Date(profile.lastLogin).toLocaleDateString() : "--"}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                  Department
                </p>
                <div className="flex items-center gap-2 font-black text-slate-800">
                  <UserCheck size={18} className="text-slate-400" />
                  {profile.department || "General"}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="mt-8 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-3 text-slate-500 font-bold text-sm">
          <div className="bg-slate-100 p-2 rounded-lg">
            <Info size={20} />
          </div>
          Keep your password secure and update it regularly.
        </div>

        <div className="flex flex-wrap gap-4">
          <button onClick={handleLogout} className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all">
            <LogOut size={18} /> Logout
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all border border-red-100">
            <Trash2 size={18} /> Delete Account
          </button>
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="flex items-center cursor-pointer gap-2 bg-[#1A6FC4] text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-sm hover:bg-[#165DA5] transition-colors"
          >
            <Key size={18} /> Change password
          </button>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
};

const InfoField = ({
  label,
  value,
  isArabic = false,
}: {
  label: string;
  value: string;
  isArabic?: boolean;
}) => (
  <div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
      {label}
    </p>
    <p className={`font-black text-slate-800 ${isArabic ? "text-right" : ""}`}>
      {value}
    </p>
  </div>
);

export default ReceptionistProfile;
