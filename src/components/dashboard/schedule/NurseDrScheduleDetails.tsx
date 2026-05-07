import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, CalendarDays, Loader2 } from 'lucide-react';
import TopBar from '../TopBar';
import { scheduleApi, type DoctorSchedule } from '../../../api/schedules';
import { staffApi } from '../../../api/staff';
import { getClinics } from '../../../api/clinics';
import type { StaffProfile } from '../../../types/staff.types';

interface NurseDrScheduleDetailsProps {
  onMenuClick: () => void;
  onProfileClick: () => void;
}

const DAY_OPTIONS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const extractList = (resObj: any): any[] => {
  if (!resObj) return [];
  if (Array.isArray(resObj)) return resObj;
  if (Array.isArray(resObj.data)) return resObj.data;
  if (Array.isArray(resObj.data?.data)) return resObj.data.data;
  if (Array.isArray(resObj.data?.schedules)) return resObj.data.schedules;
  if (Array.isArray(resObj.data?.items)) return resObj.data.items;
  if (Array.isArray(resObj.schedules)) return resObj.schedules;
  if (Array.isArray(resObj.items)) return resObj.items;
  return [];
};

const NurseDrScheduleDetails: React.FC<NurseDrScheduleDetailsProps> = ({ onMenuClick, onProfileClick }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState<StaffProfile | null>(null);
  const [schedules, setSchedules] = useState<DoctorSchedule[]>([]);
  const [clinics, setClinics] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [profileRes, scheduleRes, clinicRes] = await Promise.all([
          staffApi.getStaffById(id),
          scheduleApi.getSchedules({ DoctorId: Number(id), PageSize: 100 }),
          getClinics({ PageIndex: 0, PageSize: 100 }),
        ]);

        if (profileRes) setDoctor(profileRes);

        const schList = extractList(scheduleRes);
        setSchedules(schList);

        const clinicList = extractList(clinicRes);
        setClinics(clinicList.map((c: any) => ({
          id: c.id ?? c.Id,
          name: c.clinicNameEn ?? c.clinicNameAr ?? `Clinic #${c.id}`,
        })));

      } catch (err: any) {
        console.error('Failed to fetch details', err);
        if (err.message?.includes('403') || err.message?.includes('forbidden') || err.message?.includes('Forbidden')) {
          setAccessDenied(true);
          setDoctor({
            id: id || '101',
            name: "Dr. Marcus Thorne",
            role: "Doctor",
            department: "Cardiology",
            specialization: "Chief Resident Cardiology",
            licenseId: "8829-CT",
            location: "Main Campus, Wing B",
            status: "Active",
            email: "marcus.thorne@hospital.com",
            phone: "+1 234 567 8900",
            gender: "Male"
          } as StaffProfile);
          
          setSchedules([
            { id: 1, doctorId: Number(id), clinicId: 1, clinicName: "Heart Center", dayOfWeek: 1, startTime: "08:00:00", endTime: "16:00:00", isActive: true },
            { id: 2, doctorId: Number(id), clinicId: 2, clinicName: "Surgical Wing", dayOfWeek: 2, startTime: "07:00:00", endTime: "19:00:00", isActive: true },
            { id: 3, doctorId: Number(id), clinicId: 1, clinicName: "Heart Center", dayOfWeek: 3, startTime: "14:00:00", endTime: "22:00:00", isActive: true },
            { id: 4, doctorId: Number(id), clinicId: 3, clinicName: "ER Unit", dayOfWeek: 5, startTime: "20:00:00", endTime: "08:00:00", isActive: true },
          ]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const formatTimeAMPM = (t: string) => {
    if (!t) return 'N/A';
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  const getShiftType = (schedule: DoctorSchedule) => {
    const startH = parseInt(schedule.startTime.split(':')[0], 10);
    const endH = parseInt(schedule.endTime.split(':')[0], 10);
    const duration = (endH < startH ? endH + 24 : endH) - startH;

    if (duration >= 12) return { label: 'Full Day', dot: 'bg-blue-600' };
    if (startH >= 18 || startH < 6) return { label: 'Night Shift', dot: 'bg-red-600' };
    if (startH >= 12) return { label: 'Evening', dot: 'bg-orange-500' };
    return { label: 'Morning', dot: 'bg-blue-400' };
  };

  const getStatus = (schedule: DoctorSchedule) => {
    if (!schedule.isActive) return { text: 'UNAVAILABLE', bg: 'bg-slate-100 text-slate-500' };
    // Just a placeholder for demo logic
    return { text: 'ASSIGNED', bg: 'bg-blue-100 text-blue-700' };
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[#f8fafc]">
        <TopBar title="DR. SCHEDULE › DETAILS" onMenuClick={onMenuClick} showAddUser={false} onProfileClick={onProfileClick} />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="flex flex-col h-screen bg-[#f8fafc]">
        <TopBar title="DR. SCHEDULE › DETAILS" onMenuClick={onMenuClick} showAddUser={false} onProfileClick={onProfileClick} />
        <div className="flex-1 flex flex-col items-center justify-center">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Doctor not found</h2>
          <button onClick={() => navigate(-1)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Go Back</button>
        </div>
      </div>
    );
  }

  // Calculate Stats
  const totalShifts = schedules.filter(s => s.isActive).length;
  let clinicalHours = 0;
  schedules.forEach(s => {
    if (!s.isActive) return;
    const startH = parseInt(s.startTime.split(':')[0], 10);
    const endH = parseInt(s.endTime.split(':')[0], 10);
    clinicalHours += (endH < startH ? endH + 24 : endH) - startH;
  });

  // Next Shift logic (simplistic)
  const sortedSchedules = [...schedules].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  const nextShift = sortedSchedules.find(s => s.isActive);
  
  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] font-sans">
      <TopBar title="DR. SCHEDULE › DETAILS" onMenuClick={onMenuClick} showAddUser={false} onProfileClick={onProfileClick} />

      <main className="flex-1 p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
        {accessDenied && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm flex flex-col gap-1">
            <p className="font-bold">Backend Authorization Restricted (403 Forbidden)</p>
            <p>Your current role does not have permission to fetch live schedule details from the backend. Displaying preview data for demonstration.</p>
          </div>
        )}

        {/* Profile Banner */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-xl bg-slate-200 overflow-hidden shadow-sm shrink-0 border border-slate-100 relative">
              {doctor.avatar ? (
                <img src={doctor.avatar} alt={doctor.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl">
                  {doctor.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
                </div>
              )}
              <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 mb-1">{doctor.name}</h1>
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-3 font-medium">
                <span className="text-blue-500">⚕</span> {doctor.department || 'General Practice'}
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600">
                  <span className="text-slate-400">ID:</span> {doctor.licenseId || doctor.id}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {doctor.location || 'Main Campus'}
                </div>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/dashboard/dr-schedule')}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-lg transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Schedule List
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Detailed Roster */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-lg font-bold text-slate-800">
                <CalendarDays className="w-5 h-5 text-blue-600" /> Detailed Roster
              </div>
              <div className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-600">
                Weekly View
              </div>
            </div>
            
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#f8fafc] border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Day</th>
                    <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Clinic</th>
                    <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Shift Type</th>
                    <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Time Slot</th>
                    <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {schedules.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                        No schedules assigned.
                      </td>
                    </tr>
                  ) : (
                    schedules.sort((a,b) => a.dayOfWeek - b.dayOfWeek).map(schedule => {
                      const dayName = DAY_OPTIONS[schedule.dayOfWeek];
                      const clinicName = schedule.clinicName || clinics.find(c => c.id === schedule.clinicId)?.name || 'Clinic';
                      const shift = getShiftType(schedule);
                      const status = getStatus(schedule);

                      return (
                        <tr key={schedule.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-5">
                            <p className="font-bold text-slate-800 text-base">{dayName}</p>
                          </td>
                          <td className="px-6 py-5">
                            <p className="font-bold text-slate-800">{clinicName}</p>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">Location {schedule.clinicId}</p>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${shift.dot}`}></span>
                              <span className="font-semibold text-slate-700">{shift.label}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className="font-bold text-slate-800 tracking-tight">
                              {formatTimeAMPM(schedule.startTime)} - {formatTimeAMPM(schedule.endTime)}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`px-2.5 py-1 text-[10px] font-extrabold tracking-wider rounded-md ${status.bg}`}>
                              {status.text}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Next Scheduled Shift */}
            <div className="bg-[#0b5cce] rounded-2xl p-6 shadow-md text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
              <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-blue-100 mb-6">Next Scheduled Shift</h3>
              
              {nextShift ? (
                <>
                  <div className="flex items-start gap-4 mb-8">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold mb-1">{DAY_OPTIONS[nextShift.dayOfWeek]}, {formatTimeAMPM(nextShift.startTime)}</h2>
                      <p className="text-blue-100 text-sm">{nextShift.clinicName || clinics.find(c => c.id === nextShift.clinicId)?.name || 'Clinic'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-blue-200 mb-1">Duration</p>
                    <p className="font-bold">{
                      (() => {
                        const sH = parseInt(nextShift.startTime.split(':')[0], 10);
                        const eH = parseInt(nextShift.endTime.split(':')[0], 10);
                        const dur = (eH < sH ? eH + 24 : eH) - sH;
                        return `${dur} Hours`;
                      })()
                    }</p>
                  </div>
                </>
              ) : (
                <div className="py-6 text-center text-blue-100">
                  <p>No upcoming shifts scheduled.</p>
                </div>
              )}
            </div>

            {/* Weekly Summary */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-5">
                <CalendarDays className="w-4 h-4 text-blue-600" /> Weekly Summary
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl">
                  <span className="text-sm font-semibold text-slate-600">Total Shifts</span>
                  <span className="text-sm font-extrabold text-blue-600">{totalShifts} Shifts</span>
                </div>
                
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl">
                  <span className="text-sm font-semibold text-slate-600">Clinical Hours</span>
                  <span className="text-sm font-extrabold text-blue-600">{clinicalHours} Hours</span>
                </div>
                
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl">
                  <span className="text-sm font-semibold text-slate-600">On-Call Days</span>
                  <span className="text-sm font-extrabold text-red-500">
                    {schedules.filter(s => parseInt(s.startTime.split(':')[0], 10) >= 18).map(s => DAY_OPTIONS[s.dayOfWeek].substring(0,3)).join(', ') || 'None'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NurseDrScheduleDetails;
