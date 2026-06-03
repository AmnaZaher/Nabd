import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../TopBar";
import {
  ChevronRight,
  Eye,
  Plus,
  Upload,
  FileText,
  Activity,
} from "lucide-react";
import { getTodayRadiologyRequests, type TodayRadiologyRequestDto } from "../../../api/radilogist";

interface Exam {
  id: string;
  patientId: string;
  patientName: string;
  requestId: string;
  modality: string;
  modalityColor: string;
  scheduleTime: string;
  room: string;
  radiologistInitials: string;
  radiologistName: string;
  status: "Checked In" | "Waiting" | "Emergency";
  statusColor: string;
}

const getInitials = (name?: string) => {
  if (!name) return "DR";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
};

const formatTime = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const normalizeStatus = (status?: string): Exam["status"] => {
  const value = (status || "").toLowerCase();

  if (
    value.includes("emergency") ||
    value.includes("urgent") ||
    value.includes("stat")
  ) {
    return "Emergency";
  }

  if (
    value.includes("checked") ||
    value.includes("progress") ||
    value.includes("in-progress") ||
    value.includes("started")
  ) {
    return "Checked In";
  }

  return "Waiting";
};

const getStatusColor = (status: Exam["status"]) => {
  if (status === "Emergency") return "bg-red-500";
  if (status === "Checked In") return "bg-blue-500";
  return "bg-slate-400";
};

const getModalityColor = (modality?: string) => {
  const value = (modality || "").toLowerCase();

  if (value.includes("mri")) {
    return "bg-purple-50 text-purple-650 border border-purple-100";
  }
  if (value.includes("ct")) {
    return "bg-blue-50 text-blue-650 border border-blue-100";
  }
  if (value.includes("x-ray") || value.includes("xray") || value.includes("xr")) {
    return "bg-emerald-50 text-emerald-650 border border-emerald-100";
  }

  return "bg-slate-50 text-slate-650 border border-slate-100";
};

const mapTodayRequestToExam = (item: TodayRadiologyRequestDto): Exam => {
  const resolvedStatus = normalizeStatus(item.status);
  const modalityValue =
    item.modality || item.examName || item.testName || item.category || "Radiology Exam";

  return {
    id: String(item.id ?? item.requestId ?? Math.random()),
    patientId: item.patientId ? String(item.patientId) : "",
    patientName: item.patientName || "Unknown Patient",
    requestId: item.requestNumber || `REQ-${item.requestId ?? item.id ?? "—"}`,
    modality: modalityValue,
    modalityColor: getModalityColor(modalityValue),
    scheduleTime: formatTime(item.scheduleTime || item.scheduledAt || item.examDate),
    room: item.room || item.roomName || "—",
    radiologistInitials: getInitials(item.radiologistName),
    radiologistName: item.radiologistName || "—",
    status: resolvedStatus,
    statusColor: getStatusColor(resolvedStatus),
  };
};

const RadiologistDashboardOverview: React.FC<{
  onMenuClick?: () => void;
  onProfileClick?: () => void;
}> = ({ onMenuClick, onProfileClick }) => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<TodayRadiologyRequestDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const exams = useMemo<Exam[]>(() => requests.map(mapTodayRequestToExam), [requests]);

  useEffect(() => {
    const fetchTodayRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getTodayRadiologyRequests();
        setRequests(data);
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || "Failed to load today's requests.");
      } finally {
        setLoading(false);
      }
    };

    fetchTodayRequests();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const handleStartExam = (examId: string) => {
    navigate(`/dashboard/radiology/start-exam/${examId}`);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC]">
      <TopBar
        title="DASHBOARD"
        onMenuClick={onMenuClick || (() => {})}
        onProfileClick={onProfileClick}
        showAddUser={false}
      />

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100/80 relative overflow-hidden">
            <div className="relative z-10 space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                {getGreeting()}
              </h2>
              <p className="text-slate-500 font-semibold text-sm leading-relaxed max-w-xl">
                System status is operational. All imaging modalities are online.
              </p>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-[40%] bg-gradient-to-l from-blue-50/40 via-transparent to-transparent pointer-events-none hidden md:block" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 bg-white rounded-3xl shadow-sm border border-slate-100/80 overflow-hidden flex flex-col">
              <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-blue-600 tracking-wide uppercase">
                  Today's Scheduled Exams
                </h3>
              </div>

              {loading ? (
                <div className="p-8 text-sm font-semibold text-slate-500">
                  Loading today's scheduled exams...
                </div>
              ) : error ? (
                <div className="p-8 text-sm font-semibold text-red-500">
                  {error}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[220px]">
                          Patient & Request
                        </th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Modality
                        </th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Schedule
                        </th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Radiologist
                        </th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Status
                        </th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-[160px]">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {exams.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-8 py-10 text-center text-sm font-semibold text-slate-400">
                            No scheduled exams found for today.
                          </td>
                        </tr>
                      ) : (
                        exams.map((exam) => {
                          const isEmergency = exam.status === "Emergency";
                          return (
                            <tr key={exam.id} className="hover:bg-slate-50/20 transition-colors">
                              <td className="px-8 py-6">
                                <div className="space-y-1">
                                  <span
                                    onClick={() => {
                                        if (!exam.patientId) {
                                            console.error("Missing patientId for selected exam:", exam);
                                            return;
                                        }
                                        navigate(`/dashboard/radiology/patient/${exam.patientId}`);
                                    }}
                                    className="text-sm font-extrabold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer block"
                                  >
                                    {exam.patientName}
                                  </span>
                                  <span className="text-[10px] font-bold text-slate-400 tracking-wider block">
                                    {exam.requestId}
                                  </span>
                                </div>
                              </td>

                              <td className="px-6 py-6">
                                <span className={`inline-block px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase ${exam.modalityColor}`}>
                                  {exam.modality}
                                </span>
                              </td>

                              <td className="px-6 py-6">
                                <div className="space-y-0.5">
                                  <span className="text-sm font-extrabold text-slate-800 block">
                                    {exam.scheduleTime}
                                  </span>
                                  <span className="text-[11px] font-medium text-slate-400 block">
                                    {exam.room}
                                  </span>
                                </div>
                              </td>

                              <td className="px-6 py-6">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-500 shrink-0">
                                    {exam.radiologistInitials}
                                  </div>
                                  <span className="text-sm font-bold text-slate-600">
                                    {exam.radiologistName}
                                  </span>
                                </div>
                              </td>

                              <td className="px-6 py-6">
                                <div className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${exam.statusColor}`} />
                                  <span className={`text-xs font-bold ${isEmergency ? "text-red-650" : "text-slate-600"}`}>
                                    {exam.status}
                                  </span>
                                </div>
                              </td>

                              <td className="px-8 py-6">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleStartExam(exam.id)}
                                    className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer whitespace-nowrap ${
                                      isEmergency
                                        ? "bg-red-600 hover:bg-red-750 text-white shadow-red-100"
                                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100"
                                    }`}
                                  >
                                    {isEmergency ? "Start Now" : "Start Exam"}
                                  </button>
                                  <button
                                    title="View Details"
                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-all border border-slate-200 cursor-pointer"
                                  >
                                    <Eye size={15} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100/80 space-y-6">
                <h3 className="text-sm font-extrabold text-slate-800 tracking-tight pb-1 uppercase">
                  Quick Actions
                </h3>

                <div className="space-y-4">
                  <button onClick={() => navigate("/dashboard/radiology/exam-rooms")} className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-blue-50/30 rounded-2xl border border-slate-100 hover:border-blue-150 transition-all text-left group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <FileText size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors">Open Queue</h4>
                        <p className="text-[11px] text-slate-400 font-semibold mt-0.5">All exams</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-350 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  <button className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-blue-50/30 rounded-2xl border border-slate-100 hover:border-blue-150 transition-all text-left group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Plus size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors">New Exam Request</h4>
                        <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Internal referral entry</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-350 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  <button className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-blue-50/30 rounded-2xl border border-slate-100 hover:border-blue-150 transition-all text-left group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Upload size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors">Upload DICOM Files</h4>
                        <p className="text-[11px] text-slate-400 font-semibold mt-0.5">PACS integration upload</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-350 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  <button className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-blue-50/30 rounded-2xl border border-slate-100 hover:border-blue-150 transition-all text-left group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Activity size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors">Draft Report</h4>
                        <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Voice or text entry</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-350 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RadiologistDashboardOverview;