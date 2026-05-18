import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Building2, Eye, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import TopBar from '../TopBar';
import { scheduleApi, type DoctorSchedule } from '../../../api/schedules';
import { getClinics } from '../../../api/clinics';

interface NurseDrSchedulePageProps {
  onMenuClick: () => void;
  onProfileClick: () => void;
}

const DAY_OPTIONS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const getDayName = (dayVal: any): string => {
  if (dayVal === undefined || dayVal === null) return '';
  if (typeof dayVal === 'number') return DAY_OPTIONS[dayVal] || '';
  if (!isNaN(Number(dayVal))) return DAY_OPTIONS[Number(dayVal)] || '';
  // It's already a string like "Monday"
  return String(dayVal);
};

const NurseDrSchedulePage: React.FC<NurseDrSchedulePageProps> = ({ onMenuClick, onProfileClick }) => {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState<{ id: number; name: string }[]>([]);
  const [clinics, setClinics] = useState<{ id: number; name: string }[]>([]);

  const [schedules, setSchedules] = useState<DoctorSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  // Stats state
  const [stats, setStats] = useState({ totalActiveToday: 0, availableNow: 0, clinicsOpen: 0 });

  const [filterDoctorId, setFilterDoctorId] = useState('');
  const [filterClinicId, setFilterClinicId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    const loadDropdowns = async () => {
      // 1. Load Clinics (highly accessible and robust)
      try {
        const clinicRes = await getClinics({ PageIndex: 0, PageSize: 100 });
        const clinicAny = clinicRes as any;
        const clinicList: any[] = clinicAny?.data?.data ?? clinicAny?.data?.clinics ?? clinicAny?.data?.items ?? (Array.isArray(clinicAny?.data) ? clinicAny.data : []);
        setClinics(clinicList.map((c: any) => ({
          id: c.id ?? c.Id,
          name: c.clinicNameEn ?? c.clinicNameAr ?? `Clinic #${c.id}`,
        })));
      } catch (e) {
        console.error('Failed to load clinics dropdown', e);
      }


    };
    loadDropdowns();
  }, []);

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

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    
    let allSchedulesList: DoctorSchedule[] = [];
    try {
      // Fetch stats (use PageSize 100 to prevent 500 errors)
      const allSchedulesRes = await scheduleApi.getSchedules({ PageIndex: 0, PageSize: 100 });
      allSchedulesList = extractList(allSchedulesRes);
      
      const now = new Date();
      const currentDay = now.getDay();
      const currentH = now.getHours();
      const currentM = now.getMinutes();
      const currentMins = currentH * 60 + currentM;

      const activeTodaySchedules = allSchedulesList.filter(s => {
        const schedDay = typeof s.dayOfWeek === 'number' ? s.dayOfWeek : !isNaN(Number(s.dayOfWeek)) ? Number(s.dayOfWeek) : -1;
        return s.isActive && schedDay === currentDay;
      });
      
      const uniqueDoctorsToday = new Set(activeTodaySchedules.map(s => s.doctorId));
      const uniqueClinicsToday = new Set(activeTodaySchedules.map(s => s.clinicId));
      
      const availableDoctors = new Set(activeTodaySchedules.filter(s => {
        const [startH, startM] = s.startTime.split(':').map(Number);
        const [endH, endM] = s.endTime.split(':').map(Number);
        const startMins = startH * 60 + startM;
        const endMins = endH * 60 + endM;
        return currentMins >= startMins && currentMins <= endMins;
      }).map(s => s.doctorId));

      setStats({
        totalActiveToday: uniqueDoctorsToday.size,
        availableNow: availableDoctors.size,
        clinicsOpen: uniqueClinicsToday.size,
      });

      // Extract unique doctors from schedules list as a fallback for the filter dropdown
      if (allSchedulesList.length > 0) {
        const uniqueDocsMap = new Map<number, string>();
        allSchedulesList.forEach((s: any) => {
          const dId = s.doctorId ?? s.DoctorId;
          const dName = s.doctorName ?? s.DoctorName;
          if (dId && dName) {
            uniqueDocsMap.set(dId, dName);
          }
        });
        if (uniqueDocsMap.size > 0) {
          setDoctors(prev => {
            const merged = new Map(prev.map(d => [d.id, d.name]));
            uniqueDocsMap.forEach((name, id) => {
              if (!merged.has(id)) {
                merged.set(id, name);
              }
            });
            return Array.from(merged.entries()).map(([id, name]) => ({ id, name }));
          });
        }
      }
    } catch (e) {
      console.error('Failed to fetch stats schedules:', e);
    }

    try {
      // Fetch paginated for table
      const res = await scheduleApi.getSchedules({
        PageIndex: currentPage - 1,
        PageSize: PAGE_SIZE,
        DoctorId: filterDoctorId ? Number(filterDoctorId) : undefined,
        ClinicId: filterClinicId ? Number(filterClinicId) : undefined,
      });
      const any = res as any;
      const list: DoctorSchedule[] = extractList(any);
      
      const total: number = any?.data?.totalCount ?? any?.data?.totalPages ?? any?.totalCount ?? list.length;
      setSchedules(list);
      setTotalCount(total);
      setTotalPages(Math.max(1, typeof any?.data?.totalPages === 'number' ? any.data.totalPages : Math.ceil(total / PAGE_SIZE)));
    } catch (e: any) { 
      console.error('Failed to fetch paginated schedules', e); 
      if (e.message?.includes('403') || e.message?.includes('forbidden') || e.message?.includes('Forbidden')) {
        setAccessDenied(true);
        // Provide mock data so the UI can still be previewed
        const mockSchedules: DoctorSchedule[] = [
          { id: 1, doctorId: 101, doctorName: "Dr. Marcus Thorne", clinicId: 1, clinicName: "Cardiology", dayOfWeek: 1, startTime: "08:00:00", endTime: "16:00:00", isActive: true },
          { id: 2, doctorId: 102, doctorName: "Dr. Sarah Chen", clinicId: 2, clinicName: "Neurology", dayOfWeek: 1, startTime: "14:00:00", endTime: "22:00:00", isActive: true },
          { id: 3, doctorId: 103, doctorName: "Dr. Elena Rodriguez", clinicId: 3, clinicName: "Pediatrics", dayOfWeek: 1, startTime: "06:00:00", endTime: "14:00:00", isActive: false },
          { id: 4, doctorId: 104, doctorName: "Dr. Julian Vance", clinicId: 4, clinicName: "Orthopedics", dayOfWeek: 1, startTime: "09:00:00", endTime: "17:00:00", isActive: true },
        ];
        setSchedules(mockSchedules);
        setTotalCount(24);
        setTotalPages(3);
        setStats({ totalActiveToday: 24, availableNow: 18, clinicsOpen: 12 });
      }
    }
    finally { setLoading(false); }
  }, [currentPage, filterDoctorId, filterClinicId]);

  useEffect(() => { fetchSchedules(); }, [fetchSchedules]);

  const handleResetFilters = () => {
    setFilterDoctorId('');
    setFilterClinicId('');
    setCurrentPage(1);
    setTimeout(() => fetchSchedules(), 0);
  };



  const getStatus = (schedule: DoctorSchedule) => {
    if (!schedule.isActive) return { text: 'INACTIVE', color: 'bg-slate-100 text-slate-500' };
    
    const now = new Date();
    const currentDay = now.getDay();
    const schedDay = typeof schedule.dayOfWeek === 'number' ? schedule.dayOfWeek : !isNaN(Number(schedule.dayOfWeek)) ? Number(schedule.dayOfWeek) : -1;
    if (schedDay !== currentDay) return { text: 'UPCOMING', color: 'bg-blue-50 text-blue-600' };

    const [startH, startM] = schedule.startTime.split(':').map(Number);
    const [endH, endM] = schedule.endTime.split(':').map(Number);
    const currentH = now.getHours();
    const currentM = now.getMinutes();

    const startMins = startH * 60 + startM;
    const endMins = endH * 60 + endM;
    const currentMins = currentH * 60 + currentM;

    if (currentMins >= startMins && currentMins <= endMins) {
      return { text: 'ACTIVE NOW', color: 'bg-emerald-50 text-emerald-600', dot: 'bg-emerald-500' };
    } else if (currentMins < startMins) {
      return { text: 'UPCOMING', color: 'bg-blue-50 text-blue-600' };
    } else {
      return { text: 'COMPLETED', color: 'bg-slate-50 text-slate-500' };
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#f8fafc] overflow-y-auto font-sans">
      <TopBar title="DR. SCHEDULE" onMenuClick={onMenuClick} showAddUser={false} onProfileClick={onProfileClick} />

      <main className="flex-1 p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Doctor Schedule</h1>
          <p className="text-slate-500 text-sm">View doctor working hours and availability across all departments.</p>
          {accessDenied && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm flex flex-col gap-1">
              <p className="font-bold">Backend Authorization Restricted (403 Forbidden)</p>
              <p>Your current role does not have permission to fetch live schedules from the backend. Displaying preview data for demonstration.</p>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Active Doctors Today</p>
              <h3 className="text-3xl font-extrabold text-slate-900">{stats.totalActiveToday}</h3>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Available Doctors Now</p>
              <h3 className="text-3xl font-extrabold text-slate-900">{stats.availableNow}</h3>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6 text-indigo-500" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Clinics Open</p>
              <h3 className="text-3xl font-extrabold text-slate-900">{stats.clinicsOpen}</h3>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">DOCTOR</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                <select 
                  value={filterDoctorId}
                  onChange={(e) => { setFilterDoctorId(e.target.value); setCurrentPage(1); fetchSchedules(); }}
                  className="w-full pl-9 pr-8 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition-all"
                >
                  <option value="">All Doctors</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">CLINIC</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                <select 
                  value={filterClinicId}
                  onChange={(e) => { setFilterClinicId(e.target.value); setCurrentPage(1); fetchSchedules(); }}
                  className="w-full pl-9 pr-8 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition-all"
                >
                  <option value="">All Clinics</option>
                  {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
              </div>
            </div>

            <div className="flex items-center gap-3 sm:col-span-2 md:col-span-2 justify-end">
              <button 
                onClick={handleResetFilters}
                className="bg-white border border-slate-200 text-slate-600 px-6 py-2.5 rounded-xl font-bold text-sm transition-all hover:bg-slate-50"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#f8fafc] border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Doctor Name</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Clinic</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Day of Week</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Shift Hours</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                        <p>Loading schedule...</p>
                      </div>
                    </td>
                  </tr>
                ) : schedules.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      No doctors found for the selected criteria.
                    </td>
                  </tr>
                ) : (
                  schedules.map((schedule, index) => {
                    const docName = schedule.doctorName || doctors.find(d => d.id === (schedule.doctorId || (schedule as any).DoctorId))?.name || 'Unknown Doctor';
                    const clinicName = schedule.clinicName || clinics.find(c => c.id === schedule.clinicId)?.name || 'Unknown Clinic';
                    const dayName = getDayName(schedule.dayOfWeek);
                    const initials = docName.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase();
                    const status = getStatus(schedule);

                    return (
                      <tr key={schedule.id || `${schedule.doctorId || ''}-${schedule.dayOfWeek || ''}-${index}`} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center shrink-0">
                              {initials}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{docName}</p>
                              <p className="text-xs text-slate-500">Doctor ID: {schedule.doctorId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700">{clinicName}</td>
                        <td className="px-6 py-4 font-medium text-slate-700">{dayName}</td>
                        <td className="px-6 py-4 font-medium text-slate-700">
                          {schedule.startTime.substring(0,5)} <span className="text-slate-400 font-normal mx-1">TO</span> {schedule.endTime.substring(0,5)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide ${status.color}`}>
                            {status.dot && <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />}
                            {status.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => navigate(`/dashboard/dr-schedule/details/${schedule.doctorId}`)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && schedules.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-[#f8fafc]">
              <p className="text-sm text-slate-500">
                Showing <span className="font-medium text-slate-900">{schedules.length}</span> of <span className="font-medium text-slate-900">{totalCount}</span> doctors currently on duty roster.
              </p>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded text-sm font-medium ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default NurseDrSchedulePage;
