import React, { useState, useEffect } from 'react';
import { Camera, Folder, FileText, Upload, ChevronDown, CheckCircle2, User, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { staffApi } from '../../../api/staff';
import type { StaffProfile } from '../../../types/staff.types';
import TopBar from '../TopBar';

interface EditLabTechnicianProfileProps {
  onMenuClick?: () => void;
  onProfileClick?: () => void;
}

const EditLabTechnicianProfile: React.FC<EditLabTechnicianProfileProps> = ({ onMenuClick, onProfileClick }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<any>({
    FullNameEnglish: '',
    FullNameArabic: '',
    NationalId: '',
    Gender: 'Female',
    DateOfBirth: '',
    PhoneNumber: '',
    Email: '',
    Address: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const isDefaultDate = (dateStr?: string) => {
    if (!dateStr) return true;
    return dateStr.startsWith('0001') || dateStr.startsWith('1900');
  };

  const resolveImageUrl = (url: any) => {
    if (!url) return '';
    let strUrl = url;
    if (Array.isArray(url) && url.length > 0) {
      strUrl = url[0];
    }
    if (typeof strUrl !== 'string' || strUrl.trim() === '') return '';
    strUrl = strUrl.replace(/\\/g, '/');
    strUrl = strUrl.replace(/(https?:\/\/)[/]+/g, '$1');
    if (strUrl.startsWith('http://') || strUrl.startsWith('https://') || strUrl.startsWith('data:')) return strUrl;
    if (strUrl.startsWith('/')) return `https://nabd.runasp.net${strUrl}`;
    return `https://nabd.runasp.net/${strUrl}`;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.id) {
        setLoading(true);
        try {
          const data = await staffApi.getMyProfile(user.id, user.name, user.role);
          if (data) {
            setProfile(data);
            setFormData({
              FullNameEnglish: data.name || data.fullNameEnglish || data.FullNameEnglish || '',
              FullNameArabic: data.fullNameArabic || data.FullNameArabic || '',
              NationalId: data.nationalId || data.NationalId || '',
              Gender: data.gender || 'Female',
              DateOfBirth: data.dateOfBirth && !isDefaultDate(data.dateOfBirth) ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '',
              PhoneNumber: data.phone || data.phoneNumber || data.PhoneNumber || '',
              Email: data.email || data.Email || '',
              Address: data.address || data.Address || '',
            });
          }
        } catch (error) {
          console.error("Failed to fetch profile:", error);
          setError("Failed to load profile data.");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!profile?.id) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const payload = {
        ...formData,
        PersonalPhotos: imageFile || undefined,
        showImage: profile.avatar || undefined,
      };
      await staffApi.updateLabTechnicianProfile(profile.id, payload);
      setSuccess(true);
      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } catch (err: any) {
      console.error('Save failed:', err);
      setError(err.message || 'Failed to save profile changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Fallback to static data if no profile returned to match the UI state perfectly
  const displayAvatar = imagePreview || profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.FullNameEnglish || 'Lab')}&background=random`;

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] overflow-y-auto">
      <TopBar 
        title={
          <div className="flex items-center gap-2 text-[15px] md:text-[17px] font-bold tracking-wide">
            <button 
              onClick={() => navigate('/dashboard/profile')} 
              className="text-slate-900 hover:text-slate-700 transition-colors uppercase cursor-pointer"
            >
              LABORATORY PROFILE
            </button>
            <span className="text-slate-300 font-normal mt-0.5">›</span>
            <span className="text-[#1A6FC4] uppercase">EDIT PROFILE</span>
          </div>
        } 
        showAddUser={false} 
        onMenuClick={onMenuClick || (() => {})} 
        onProfileClick={onProfileClick}
      />

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <h1 className="text-[26px] font-bold text-slate-800 mb-8">Edit Technician Profile</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl font-bold text-sm border border-red-100 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-xl font-bold text-sm border border-green-100 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-ping"></span>
            Profile updated successfully! Redirecting...
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left Column */}
          <div className="w-full lg:w-1/3 flex flex-col gap-6">
            
            {/* Profile Card */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col items-center">
              <div className="relative mb-4">
                <div className="w-32 h-32 rounded-xl overflow-hidden bg-slate-100 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <img
                    src={displayAvatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-3 -right-3 w-8 h-8 bg-[#1A6FC4] rounded-lg flex items-center justify-center text-white shadow-sm border-2 border-white hover:bg-[#165DA5] transition-colors cursor-pointer"
                >
                  <Camera size={16} />
                </button>
              </div>
              
              <h2 className="text-xl font-bold text-slate-800 mt-2">{formData.FullNameEnglish || 'Sarah Al-Farsi'}</h2>
              <p className="text-[#1A6FC4] font-medium text-sm mt-1 mb-4">Senior Lab Technician</p>
              
              <div className="px-4 py-1.5 bg-blue-50 text-[#1A6FC4] text-xs font-bold tracking-wider rounded-full flex items-center gap-1.5 uppercase">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1A6FC4]"></div>
                ACTIVE STATUS
              </div>
            </div>

            {/* Document Portal */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-6">
                <Folder size={20} className="text-[#1A6FC4]" />
                <h3 className="text-[17px] font-bold text-slate-800">Document Portal</h3>
              </div>

              <div className="space-y-3 mb-6">
                {profile?.documents && profile.documents.length > 0 ? (
                  profile.documents.map((doc: any, index: number) => {
                    const docType = doc.documentType || doc.type || 'Document';
                    const fileUrl = resolveImageUrl(doc.fileUrl || doc.url);
                    let fileName = docType;
                    try {
                      const urlParts = fileUrl.split(/[/\\]/);
                      const lastPart = urlParts[urlParts.length - 1];
                      if (lastPart && lastPart.includes('.')) {
                        fileName = lastPart;
                      }
                    } catch (e) {}

                    return (
                      <a 
                        key={index}
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-slate-50/80 rounded-xl border-l-4 border-[#1A6FC4] hover:bg-slate-100 transition-colors min-w-0"
                      >
                        <FileText size={18} className="text-slate-400 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-slate-800 truncate">{docType.replace(/([A-Z])/g, ' $1').trim()}</p>
                          <p className="text-[11px] text-slate-500 truncate">{fileName}</p>
                        </div>
                      </a>
                    );
                  })
                ) : (
                  <>
                    <div className="flex items-center gap-3 p-3 bg-slate-50/80 rounded-xl border-l-4 border-[#1A6FC4]">
                      <FileText size={18} className="text-slate-400" />
                      <div>
                        <p className="text-sm font-bold text-slate-800">Medical_License.pdf</p>
                        <p className="text-[11px] text-slate-500">Modified 2 days ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50/80 rounded-xl border-l-4 border-slate-300">
                      <CheckCircle2 size={18} className="text-slate-400" />
                      <div>
                        <p className="text-sm font-bold text-slate-800">ID_Card_Front.jpg</p>
                        <p className="text-[11px] text-slate-500">Uploaded Jun 2023</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <button className="w-full py-3.5 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors">
                <Upload size={18} /> Upload New Document
              </button>
            </div>

          </div>

          {/* Right Column */}
          <div className="w-full lg:w-2/3 flex flex-col gap-6">
            
            {/* Personal Information */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-8">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <User size={18} className="text-[#1A6FC4]" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Personal Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 mb-auto">
                {/* Full Name English */}
                <div className="relative">
                  <label className="text-[13px] font-semibold text-slate-600 block mb-2">Full Name (English)</label>
                  <input 
                    type="text" 
                    name="FullNameEnglish" 
                    value={formData.FullNameEnglish} 
                    onChange={handleChange} 
                    placeholder="Omar Mohamed"
                    className="w-full pb-2 bg-transparent border-b border-slate-300 text-[15px] font-medium text-slate-800 focus:border-[#1A6FC4] outline-none transition-colors" 
                  />
                </div>

                {/* Full Name Arabic */}
                <div className="relative">
                  <label className="text-[13px] font-semibold text-slate-600 block mb-2">Full Name (Arabic)</label>
                  <input 
                    type="text" 
                    name="FullNameArabic" 
                    value={formData.FullNameArabic} 
                    onChange={handleChange} 
                    dir="rtl"
                    placeholder="عمر أحمد"
                    className="w-full pb-2 bg-transparent border-b border-slate-300 text-[15px] font-medium text-slate-800 focus:border-[#1A6FC4] outline-none transition-colors font-arabic" 
                  />
                </div>

                {/* National ID */}
                <div className="relative">
                  <label className="text-[13px] font-semibold text-slate-600 block mb-2">National ID</label>
                  <input 
                    type="text" 
                    name="NationalId" 
                    value={formData.NationalId} 
                    onChange={handleChange} 
                    placeholder="30410052701945"
                    className="w-full pb-2 bg-transparent border-b border-slate-300 text-[15px] font-medium text-slate-800 focus:border-[#1A6FC4] outline-none transition-colors" 
                  />
                </div>

                {/* Gender */}
                <div className="relative">
                  <label className="text-[13px] font-semibold text-slate-600 block mb-2">Gender</label>
                  <div className="relative">
                    <select 
                      name="Gender" 
                      value={formData.Gender} 
                      onChange={handleChange} 
                      className="w-full px-4 py-3 bg-[#E2E8F0]/50 rounded-xl text-[15px] font-medium text-slate-800 appearance-none outline-none focus:ring-2 focus:ring-[#1A6FC4]/20"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="relative">
                  <label className="text-[13px] font-semibold text-slate-600 block mb-2">Date of Birth</label>
                  <input 
                    type="date" 
                    name="DateOfBirth" 
                    value={formData.DateOfBirth} 
                    onChange={handleChange} 
                    className="w-full pb-2 bg-transparent border-b border-slate-300 text-[15px] font-medium text-slate-800 focus:border-[#1A6FC4] outline-none transition-colors" 
                  />
                </div>

                {/* Phone Number */}
                <div className="relative">
                  <label className="text-[13px] font-semibold text-slate-600 block mb-2">Phone Number</label>
                  <input 
                    type="text" 
                    name="PhoneNumber" 
                    value={formData.PhoneNumber} 
                    onChange={handleChange} 
                    placeholder="01000745863"
                    className="w-full pb-2 bg-transparent border-b border-slate-300 text-[15px] font-medium text-slate-800 focus:border-[#1A6FC4] outline-none transition-colors" 
                  />
                </div>

                {/* Email Address */}
                <div className="relative md:col-span-2 lg:col-span-1">
                  <label className="text-[13px] font-semibold text-slate-600 block mb-2">Email Address</label>
                  <input 
                    type="email" 
                    name="Email" 
                    value={formData.Email} 
                    onChange={handleChange} 
                    placeholder="Omar@nabd.com"
                    className="w-full pb-2 bg-transparent border-b border-slate-300 text-[15px] font-medium text-slate-800 focus:border-[#1A6FC4] outline-none transition-colors" 
                  />
                </div>

                {/* Residential Address */}
                <div className="relative md:col-span-2">
                  <label className="text-[13px] font-semibold text-slate-600 block mb-2">Residential Address</label>
                  <textarea 
                    name="Address" 
                    value={formData.Address} 
                    onChange={handleChange} 
                    rows={2}
                    className="w-full p-4 bg-[#E2E8F0]/50 rounded-xl text-[15px] font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#1A6FC4]/20 resize-none" 
                  />
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex justify-end items-center gap-4 mt-10 pt-6 border-t border-slate-100">
                <button 
                  onClick={() => navigate(-1)}
                  className="px-6 py-2.5 bg-[#E2E8F0]/80 text-slate-600 hover:bg-[#E2E8F0] hover:text-slate-800 rounded-lg font-bold text-[14px] transition-colors"
                >
                  Discard Changes
                </button>
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#0b5cba] text-white hover:bg-[#0a4d9c] rounded-lg font-bold text-[14px] transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditLabTechnicianProfile;
