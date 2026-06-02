import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Loader2,
  Camera,
  FileText,
  Shield,
  Upload,
  ChevronDown,
  User
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import TopBar from "../TopBar";
import {
  getRadiologistProfile,
  updateRadiologistProfile,
  type RadiologistProfileDto,
} from "../../../api/radiologistProfile";

interface EditRadiologistProfileProps {
  onMenuClick?: () => void;
  onProfileClick?: () => void;
}

const EditRadiologistProfile: React.FC<EditRadiologistProfileProps> = ({ onMenuClick, onProfileClick }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<RadiologistProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const [name, setName] = useState("");
  const [nameArabic, setNameArabic] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [gender, setGender] = useState("Female");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.id) {
        setLoading(true);
        try {
          const data = await getRadiologistProfile(user.id);
          const resolved: RadiologistProfileDto = data || {
            id: user.id || "RAD-9901",
            name: "Sarah Al-Farsi",
            fullNameArabic: "سارة الفارسي",
            email: "s.alfarsi@gm-center.org",
            phone: "+966 55 123 4567",
            gender: "Female",
            address: "742 King Abdullah Road, Olaya District, Riyadh 12211, Saudi Arabia",
            dateOfBirth: "1992-05-14",
            nationalId: "234-9876-1120",
            city: "Riyadh",
            country: "Saudi Arabia",
            role: "Radiologist",
            status: "Active",
            department: "Radiology Department",
            avatar: "",
            lastLogin: new Date().toISOString()
          };

          setProfile(resolved);
          setName(resolved.name || "");
          setNameArabic(resolved.fullNameArabic || "");
          setNationalId(resolved.nationalId || "");
          setGender(resolved.gender || "Female");
          setDateOfBirth(resolved.dateOfBirth || "");
          setPhone(resolved.phone || resolved.phoneNumber || "");
          setEmail(resolved.email || "");
          setAddress(resolved.address || "");
        } catch (error) {
          console.error("Failed to load radiologist profile for edit:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) return;

    setSaving(true);
    try {
      const updated = await updateRadiologistProfile(user.id, {
        name,
        fullNameArabic: nameArabic,
        nationalId,
        gender,
        dateOfBirth,
        phone,
        email,
        address,
      });

      setProfile(updated || profile);
      setSaving(false);
      setShowSuccessToast(true);

      setTimeout(() => {
        setShowSuccessToast(false);
        navigate("/dashboard/profile");
      }, 2000);
    } catch (error) {
      console.error("Failed to update profile:", error);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#F0F4FA] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A6FC4]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#EEF2F8] font-sans overflow-y-auto">
      <TopBar
        title="RADIOLOGIST PROFILE"
        showAddUser={false}
        onMenuClick={onMenuClick || (() => {})}
        onProfileClick={onProfileClick}
      />

      <div className="px-8 py-3 flex items-center gap-2 text-sm font-semibold text-slate-500 bg-white border-b border-slate-100">
        <span
          className="text-slate-700 cursor-pointer hover:text-[#1A6FC4] transition-colors"
          onClick={() => navigate("/dashboard/profile")}
        >
          RADIOLOGIST PROFILE
        </span>
        <span className="text-slate-300">›</span>
        <span className="text-[#1A6FC4]">EDIT PROFILE</span>

        {showSuccessToast && (
          <div className="ml-4 flex items-center gap-2 bg-white border border-emerald-200 text-emerald-600 text-xs font-semibold px-4 py-1.5 rounded-full shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
            <CheckCircle2 size={14} />
            Profile Updated Successfully
          </div>
        )}
      </div>

      <div className="w-full px-6 py-8">
        <form onSubmit={handleSave}>
          <div className="flex gap-6 items-start">
            <div className="w-72 flex-shrink-0 space-y-4">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center gap-3">
                <div className="relative">
                  <div className="w-28 h-28 rounded-xl overflow-hidden bg-slate-100">
                    {profile?.avatar ? (
                      <img src={profile.avatar} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300">
                        <User size={40} className="text-slate-400" />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="absolute bottom-1 right-1 w-7 h-7 bg-[#1A6FC4] rounded-lg flex items-center justify-center shadow-md hover:bg-[#165DA5] transition-colors cursor-pointer"
                  >
                    <Camera size={13} className="text-white" />
                  </button>
                </div>

                <div className="text-center">
                  <h3 className="text-base font-bold text-slate-800">{name || "—"}</h3>
                  <p className="text-xs text-[#1A6FC4] font-semibold">{profile?.role || "Radiologist"}</p>
                </div>

                <div className="mt-1">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    Active Status
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-600">Document Portal</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <FileText size={13} className="text-[#1A6FC4]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-700 truncate">Medical_License</p>
                      <p className="text-[10px] text-slate-400 font-medium">Modified 2 days ago</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Shield size={13} className="text-slate-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-700 truncate">ID_Card_Front.jpg</p>
                      <p className="text-[10px] text-slate-400 font-medium">Uploaded Jun 2023</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-slate-200 rounded-xl text-[11px] font-bold text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors cursor-pointer"
                  >
                    <Upload size={12} />
                    Upload New Document
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <User size={15} className="text-[#1A6FC4]" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Personal Information</h3>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <Field label="Full Name (English)">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Full Name (Arabic)">
                    <input
                      type="text"
                      value={nameArabic}
                      onChange={(e) => setNameArabic(e.target.value)}
                      dir="rtl"
                      className={inputCls + " text-right"}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <Field label="National ID">
                    <input
                      type="text"
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Gender">
                    <div className="relative">
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className={inputCls + " appearance-none pr-9 cursor-pointer"}
                      >
                        <option>Female</option>
                        <option>Male</option>
                        <option>Other</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <Field label="Date of Birth">
                    <input
                      type="text"
                      placeholder="YYYY-MM-DD"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Phone Number">
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                </div>

                <Field label="Email Address">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={inputCls}
                  />
                </Field>

                <Field label="Residential Address">
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                    className={inputCls + " resize-none"}
                  />
                </Field>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard/profile")}
                  className="px-6 py-2.5 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-[#1A6FC4] hover:bg-[#155faa] text-white px-8 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-blue-200/60 transition-all cursor-pointer disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Saving…
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const inputCls =
  "w-full px-0 py-2 bg-transparent border-0 border-b border-slate-200 text-sm text-slate-800 font-medium focus:outline-none focus:border-[#1A6FC4] transition-colors placeholder:text-slate-300";

interface FieldProps {
  label: string;
  children: React.ReactNode;
}

const Field: React.FC<FieldProps> = ({ label, children }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 mb-1">{label}</label>
    {children}
  </div>
);

export default EditRadiologistProfile;