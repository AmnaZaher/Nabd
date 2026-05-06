import React from 'react';
import { Shield, Save, X } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Background Overlay مع تأثير Blur خفيف كما في الصورة */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-[#1A6FC4]">
              <Shield size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Account & Security</h2>
            <button onClick={onClose} className="ml-auto text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Password</label>
              <input 
                type="password" 
                defaultValue="********"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">New Password</label>
              <input 
                type="password" 
                placeholder="Min 12 characters"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Confirm Password</label>
              <input 
                type="password" 
                placeholder="Repeat new password"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-10 flex justify-end">
            <button className="flex items-center gap-2 bg-[#1A6FC4] text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-[#165DA5] transition-all shadow-lg shadow-blue-200">
              <Save size={18} />
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;