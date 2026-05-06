import React from 'react';
import { Camera, Lock, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EditReceptionistProfile: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans pb-10">
      <div className="w-full bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8">
          {/* Profile Photo Section */}
          <div className="flex items-center gap-6 mb-10">
            <div className="relative group">
              <div className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-white shadow-md bg-slate-50">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop" 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-2 right-2 w-8 h-8 bg-[#1A6FC4] rounded-lg flex items-center justify-center text-white shadow-lg border-2 border-white">
                <Camera size={16} />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Receptionist Profile Photo</h3>
              <p className="text-slate-400 text-sm mb-3">Upload a professional photo to help patients recognize you at the front desk.</p>
              <button className="px-6 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
                Change Photo
              </button>
            </div>
          </div>

          {/* Form Section */}
          <div className="bg-[#F8FAFC] rounded-[1.5rem] p-8">
            <div className="flex items-center gap-2 mb-8 text-[#1A6FC4]">
              <div className="w-1.5 h-6 bg-[#1A6FC4] rounded-full"></div>
              <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* English Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name (English)</label>
                <input type="text" defaultValue="Sarah Al-Farsi" className="w-full px-5 py-3.5 bg-[#E2E8F0]/50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none" />
              </div>

              {/* Arabic Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex justify-between">
                  <span>Full Name (Arabic)</span>
                </label>
                <input type="text" dir="rtl" defaultValue="سارة الفارسي" className="w-full px-5 py-3.5 bg-[#E2E8F0]/50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none font-arabic" />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <input type="email" defaultValue="s.alfarsi@clinicalprecision.com" className="w-full px-5 py-3.5 bg-[#E2E8F0]/50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none" />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                <input type="text" defaultValue="+966 50 123 4567" className="w-full px-5 py-3.5 bg-[#E2E8F0]/50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none" />
              </div>

              {/* National ID (Read Only) */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">National ID (Read-only)</label>
                <div className="relative">
                  <input type="text" readOnly defaultValue="1092837465" className="w-full px-11 py-3.5 bg-[#E2E8F0]/50 border-none rounded-xl text-sm font-bold text-slate-400 outline-none" />
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date of Birth</label>
                <input type="text" defaultValue="05/15/1992" className="w-full px-5 py-3.5 bg-[#E2E8F0]/50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none" />
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                <div className="relative">
                  <select className="w-full px-5 py-3.5 bg-[#E2E8F0]/50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none appearance-none cursor-pointer">
                    <option>Female</option>
                    <option>Male</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Address</label>
                <input type="text" defaultValue="Al-Tahlia Street, Building 45" className="w-full px-5 py-3.5 bg-[#E2E8F0]/50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none" />
              </div>

              {/* City */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">City</label>
                <input type="text" defaultValue="Riyadh" className="w-full px-5 py-3.5 bg-[#E2E8F0]/50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none" />
              </div>

              {/* Country */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Country</label>
                <input type="text" defaultValue="Saudi Arabia" className="w-full px-5 py-3.5 bg-[#E2E8F0]/50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-10 flex justify-end gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="px-10 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 transition-all"
            >
              Cancel
            </button>
            <button className="px-12 py-3 bg-[#1A6FC4] text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-[#165DA5] transition-all">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditReceptionistProfile;