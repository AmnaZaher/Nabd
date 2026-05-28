import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../TopBar";
import {
  Calendar,
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Eye,
  Plus,
  Upload,
  FileText,
  Activity,
  TrendingUp,
} from "lucide-react";

interface Exam {
  id: string;
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

const MOCK_EXAMS: Exam[] = [
  {
    id: "1",
    patientName: "Eleanor P. Vance",
    requestId: "REQ-8829-MR",
    modality: "MRI - PELVIS",
    modalityColor: "bg-purple-50 text-purple-650 border border-purple-100",
    scheduleTime: "10:15 AM",
    room: "Room B-04",
    radiologistInitials: "DR",
    radiologistName: "Dr. Rossi",
    status: "Checked In",
    statusColor: "bg-blue-500",
  },
  {
    id: "2",
    patientName: "Arthur Gordon",
    requestId: "REQ-8901-CT",
    modality: "CT - THORAX",
    modalityColor: "bg-blue-50 text-blue-650 border border-blue-100",
    scheduleTime: "10:45 AM",
    room: "Room A-02",
    radiologistInitials: "DT",
    radiologistName: "Dr. Thorne",
    status: "Waiting",
    statusColor: "bg-slate-400",
  },
  {
    id: "3",
    patientName: "Lydia Chen",
    requestId: "REQ-8922-XR",
    modality: "HAND X-RAY",
    modalityColor: "bg-emerald-50 text-emerald-650 border border-emerald-100",
    scheduleTime: "11:00 AM",
    room: "Room X-01",
    radiologistInitials: "DR",
    radiologistName: "Dr. Rossi",
    status: "Emergency",
    statusColor: "bg-red-500",
  },
];

const RadiologistDashboardOverview: React.FC<{
  onMenuClick?: () => void;
  onProfileClick?: () => void;
}> = ({ onMenuClick, onProfileClick }) => {
  const navigate = useNavigate();
  const [exams] = useState<Exam[]>(MOCK_EXAMS);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const handleStartExam = (examId: string) => {
    alert(`Starting exam for ID: ${examId}`);
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
          
          {/* Header/Greeting Section */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100/80 relative overflow-hidden">
            <div className="relative z-10 space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                {getGreeting()}, <span className="text-blue-600">Dr. Vance</span>
              </h2>
              <p className="text-slate-500 font-semibold text-sm leading-relaxed max-w-xl">
                System status is operational. All imaging modalities are online.
              </p>
            </div>
            {/* Abstract Background Design Element */}
            <div className="absolute right-0 top-0 bottom-0 w-[40%] bg-gradient-to-l from-blue-50/40 via-transparent to-transparent pointer-events-none hidden md:block" />
          </div>

          {/* Stats Cards Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Total Exams Today */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100/80 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 shrink-0">
                  <Calendar size={22} strokeWidth={1.8} />
                </div>
                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 flex items-center gap-1">
                  <TrendingUp size={10} />
                  +12%
                </span>
              </div>
              <div className="mt-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Exams Today</p>
                <h3 className="text-3xl font-black text-slate-900 mt-1 tracking-tight">42</h3>
              </div>
            </div>

            {/* Pending Reports */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100/80 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 shrink-0">
                <ClipboardList size={22} strokeWidth={1.8} />
              </div>
              <div className="mt-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Reports</p>
                <h3 className="text-3xl font-black text-slate-900 mt-1 tracking-tight">08</h3>
              </div>
            </div>

            {/* Completed Reports */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100/80 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500 shrink-0">
                  <CheckCircle2 size={22} strokeWidth={1.8} />
                </div>
                <span className="text-[11px] font-bold text-slate-400 mt-1">
                  Target: 40
                </span>
              </div>
              <div className="mt-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Reports</p>
                <h3 className="text-3xl font-black text-slate-900 mt-1 tracking-tight">34</h3>
              </div>
            </div>

            {/* Urgent Cases */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100/80 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 shrink-0">
                <AlertTriangle size={22} strokeWidth={1.8} />
              </div>
              <div className="mt-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Urgent Cases</p>
                <h3 className="text-3xl font-black text-red-650 mt-1 tracking-tight">03</h3>
              </div>
            </div>

          </div>

          {/* Main Layout Grid: Schedule (Left) + Quick Actions (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Today's Scheduled Exams (8 Cols) */}
            <div className="lg:col-span-8 bg-white rounded-3xl shadow-sm border border-slate-100/80 overflow-hidden flex flex-col">
              <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-blue-600 tracking-wide uppercase">
                  Today's Scheduled Exams
                </h3>
              </div>

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
                    {exams.map((exam) => {
                      const isEmergency = exam.status === "Emergency";
                      return (
                        <tr key={exam.id} className="hover:bg-slate-50/20 transition-colors">
                          
                          {/* Patient & Request */}
                          <td className="px-8 py-6">
                            <div className="space-y-1">
                              <span
                                onClick={() => navigate(`/dashboard/radiologist/patient/${exam.id}`)}
                                className="text-sm font-extrabold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer block"
                              >
                                {exam.patientName}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 tracking-wider block">
                                {exam.requestId}
                              </span>
                            </div>
                          </td>

                          {/* Modality */}
                          <td className="px-6 py-6">
                            <span className={`inline-block px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase ${exam.modalityColor}`}>
                              {exam.modality}
                            </span>
                          </td>

                          {/* Schedule */}
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

                          {/* Radiologist */}
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

                          {/* Status */}
                          <td className="px-6 py-6">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${exam.statusColor}`} />
                              <span className={`text-xs font-bold ${
                                isEmergency ? "text-red-650" : "text-slate-600"
                              }`}>
                                {exam.status}
                              </span>
                            </div>
                          </td>

                          {/* Actions */}
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
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions (4 Cols) */}
            <div className="lg:col-span-4 space-y-6">
              
              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100/80 space-y-6">
                <h3 className="text-sm font-extrabold text-slate-800 tracking-tight pb-1 uppercase">
                  Quick Actions
                </h3>

                <div className="space-y-4">
                  
                  {/* Action 1: Open Queue */}
                  <button className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-blue-50/30 rounded-2xl border border-slate-100 hover:border-blue-150 transition-all text-left group cursor-pointer">
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

                  {/* Action 2: New Exam Request */}
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

                  {/* Action 3: Upload DICOM Files */}
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

                  {/* Action 4: Draft Report */}
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
