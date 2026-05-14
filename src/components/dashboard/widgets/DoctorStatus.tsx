import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { staffApi } from "../../../api/staff";
import { useNavigate } from "react-router-dom";

interface Doctor {
  id: string | number;
  name: string;
  specialty: string;
  avatar: string;
  status: "AVAILABLE" | "BUSY" | "OFFLINE";
}

const DoctorStatus: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const res = await staffApi.getStaffs({ Role: "2", PageIndex: 0, PageSize: 5 });
        const list = Array.isArray(res) ? res : (res?.staffs || (res as any)?.items || (res as any)?.data || []);
        
        const mappedDoctors = list.map((item: any) => {
          let statusText: "AVAILABLE" | "BUSY" | "OFFLINE" = "AVAILABLE";
          if (item.isActive === false || item.status === "Disabled") {
            statusText = "OFFLINE";
          } else if (item.status === "Busy") {
            statusText = "BUSY";
          }

          return {
            id: item.id || item.Id || item.nationalId,
            name: item.name || item.fullNameEnglish || item.FullNameEnglish || "Unknown Doctor",
            specialty: item.dept || item.department || item.specialization || "General",
            avatar: item.avatar || item.PersonalPhotos || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || item.fullNameEnglish || "D")}&background=random`,
            status: statusText,
          };
        });

        setDoctors(mappedDoctors.slice(0, 5)); // show up to 5
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800 tracking-tight">Doctors Status</h3>
        <button 
          onClick={() => navigate("/dashboard/users")}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
        >
          View All
        </button>
      </div>

      <div className="space-y-6 min-h-[200px]">
        {loading ? (
          <div className="flex justify-center items-center h-full pt-10">
            <Loader2 className="animate-spin text-slate-300" size={32} />
          </div>
        ) : doctors.length === 0 ? (
          <p className="text-sm text-slate-500 text-center pt-10">No doctors found.</p>
        ) : (
          doctors.map((doctor) => (
            <div key={doctor.id} className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={doctor.avatar}
                  alt={doctor.name}
                  className="w-12 h-12 rounded-2xl object-cover shrink-0 bg-slate-100 shadow-sm"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate tracking-tight">
                  {doctor.name}
                </p>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">
                  {doctor.specialty}
                </p>
              </div>
              <div
                className={`px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm shrink-0 border ${
                  doctor.status === "AVAILABLE"
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                    : doctor.status === "BUSY" 
                    ? "bg-amber-50 text-amber-600 border-amber-100"
                    : "bg-slate-50 text-slate-600 border-slate-200"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      doctor.status === "AVAILABLE" ? "bg-emerald-500" : doctor.status === "BUSY" ? "bg-amber-500" : "bg-slate-500"
                    }`}
                  />
                  {doctor.status}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DoctorStatus;
