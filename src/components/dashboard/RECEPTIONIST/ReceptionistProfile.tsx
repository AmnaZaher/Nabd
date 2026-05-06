import React from "react";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ChangePasswordModal from "./ChangePasswordModal";

const ReceptionistProfile: React.FC = () => {
  const navigate = useNavigate();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false);

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans pb-20">
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
            className="flex items-center gap-2 bg-[#1A6FC4] text-white px-6 py-2 rounded-xl font-bold text-sm"
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
                <div className="w-40 h-40 rounded-2xl overflow-hidden border-4 border-[#1A6FC4] p-1">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&h=200&auto=format&fit=crop"
                    alt="Sarah Mitchell"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
              </div>

              <h3 className="text-2xl font-black text-slate-900">
                Sarah Mitchell
              </h3>
              <p className="text-slate-400 font-bold mb-4">(سارة ميتشل)</p>

              <div className="inline-block px-4 py-1.5 bg-blue-50 text-[#1A6FC4] rounded-full text-xs font-black uppercase tracking-widest mb-2">
                Receptionist
              </div>
              <div className="inline-block px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-8">
                ACTIVE
              </div>

              <div className="w-full border-t border-slate-100 pt-8">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                  Assigned Departments
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <span className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">
                    General Surgery
                  </span>
                  <span className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">
                    Orthopedics
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
                value="Sarah Elizabeth Mitchell"
              />
              <InfoField
                label="Full Name (Arabic)"
                value="سارة إليزابيث ميتشل"
                isArabic
              />
              <InfoField label="ID" value="579935" />
              <InfoField
                label="Email Address"
                value="s.mitchell@clinicalprecision.com"
              />
              <InfoField label="Phone Number" value="+1 (555) 902-3344" />
              <InfoField label="Gender" value="Female" />
              <InfoField
                label="Residential Address"
                value="742 Evergreen Terrace, Medical District"
              />
              <InfoField label="Date of Birth" value="May 14, 1992" />
              <InfoField label="National ID" value="ID-8829-X011" />
              <InfoField label="City / State" value="Rochester, Minnesota" />
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

            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
              Assigned Departments
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              <div className="flex items-center gap-4 p-4 bg-[#F8FAFC] rounded-2xl border border-slate-100">
                <div className="bg-white p-2.5 rounded-xl text-blue-600 shadow-sm">
                  <User size={20} />
                </div>
                <div>
                  <p className="font-black text-slate-800 text-sm">
                    General Surgery
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold">
                    North Wing, Floor 4
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-[#F8FAFC] rounded-2xl border border-slate-100">
                <div className="bg-white p-2.5 rounded-xl text-blue-600 shadow-sm">
                  <User size={20} />
                </div>
                <div>
                  <p className="font-black text-slate-800 text-sm">
                    Orthopedics
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold">
                    East Wing, Floor 2
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-slate-100 pt-8">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                  Account Created At
                </p>
                <div className="flex items-center gap-2 font-black text-slate-800">
                  <Calendar size={18} className="text-slate-400" />
                  Jan 12, 2023
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                  Created By
                </p>
                <div className="flex items-center gap-2 font-black text-slate-800">
                  <UserCheck size={18} className="text-slate-400" />
                  Admin (James Wilson)
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
          Last account update was on Oct 12, 2023
        </div>

        <div className="flex flex-wrap gap-4">
          <button className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all">
            <LogOut size={18} /> Logout
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all border border-red-100">
            <Trash2 size={18} /> Delete Account
          </button>
          <button
            onClick={() => setIsPasswordModalOpen(true)} // فتح الـ Modal
            className="flex items-center cursor-pointer gap-2 bg-[#1A6FC4] text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-sm"
          >
            <Key size={18} /> Change password
          </button>
        </div>
      </div>

      {/* Password Change Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
};

// Helper Component for Info Fields
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
