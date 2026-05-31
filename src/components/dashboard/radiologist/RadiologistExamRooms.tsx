import React, { useState } from "react";
import TopBar from "../TopBar";
import {
  Calendar,
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  Search,
  ChevronDown,
  SlidersHorizontal,
  RefreshCw,
  Eye,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface ExamRoomItem {
  id: string;
  isStat?: boolean;
  image: string;
  patientName: string;
  patientId: string;
  modality: string;
  modalityColor: string;
  bodyPart: string;
  time: string;
  priorityDot?: boolean;
  status: "Urgent" | "In Progress" | "Completed" | "Pending";
  statusColor: string;
  radiologist: string;
}

const MOCK_EXAM_ROOMS: ExamRoomItem[] = [
  {
    id: "#RAD-9021",
    isStat: true,
    image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=100&auto=format&fit=crop",
    patientName: "Eleanor Vance",
    patientId: "8829-XP",
    modality: "MRI",
    modalityColor: "bg-purple-50 text-purple-650 border border-purple-100",
    bodyPart: "Brain (Contrast)",
    time: "09:15 AM",
    priorityDot: true,
    status: "Urgent",
    statusColor: "bg-red-50 text-red-650 border border-red-100",
    radiologist: "Dr. K. Aris",
  },
  {
    id: "#RAD-9022",
    image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=100&auto=format&fit=crop",
    patientName: "Arthur Morgan",
    patientId: "1102-AM",
    modality: "CT SCAN",
    modalityColor: "bg-slate-50 text-slate-650 border border-slate-100",
    bodyPart: "Lumbar Spine",
    time: "10:00 AM",
    status: "In Progress",
    statusColor: "bg-blue-50 text-blue-650 border border-blue-100",
    radiologist: "Dr. J. Vane",
  },
  {
    id: "#RAD-9023",
    image: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?q=80&w=100&auto=format&fit=crop",
    patientName: "Sarah Connor",
    patientId: "5543-SC",
    modality: "X-RAY",
    modalityColor: "bg-blue-50 text-blue-650 border border-blue-100",
    bodyPart: "Left Ankle",
    time: "10:45 AM",
    status: "Completed",
    statusColor: "bg-emerald-50 text-emerald-650 border border-emerald-100",
    radiologist: "Dr. L. Myers",
  },
  {
    id: "#RAD-9024",
    image: "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=100&auto=format&fit=crop",
    patientName: "John Doe",
    patientId: "0023-JD",
    modality: "ULTRASOUND",
    modalityColor: "bg-purple-100 text-purple-800 border border-purple-200",
    bodyPart: "Abdomen",
    time: "11:30 AM",
    status: "Pending",
    statusColor: "bg-amber-50 text-amber-650 border border-amber-100",
    radiologist: "Unassigned",
  },
];

const RadiologistExamRooms: React.FC<{
  onMenuClick?: () => void;
  onProfileClick?: () => void;
}> = ({ onMenuClick, onProfileClick }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState<string>("All");

  const filteredExams = MOCK_EXAM_ROOMS.filter((exam) => {
    const matchesSearch =
      exam.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.radiologist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = activeStatus === "All" || exam.status === activeStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC]">
      <TopBar
        title="EXAM ROOMS"
        onMenuClick={onMenuClick || (() => {})}
        onProfileClick={onProfileClick}
        showAddUser={false}
      />

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Header */}
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Radiology Exams List
            </h2>
          </div>

          {/* 4 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Total Exams Today */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100/80 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 shrink-0">
                  <Calendar size={22} strokeWidth={1.8} />
                </div>
                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                  +12%
                </span>
              </div>
              <div className="mt-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Exams Today</p>
                <h3 className="text-3xl font-black text-slate-900 mt-1 tracking-tight">42</h3>
              </div>
            </div>

            {/* Pending Exams */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100/80 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 shrink-0">
                <ClipboardList size={22} strokeWidth={1.8} />
              </div>
              <div className="mt-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Exams</p>
                <h3 className="text-3xl font-black text-slate-900 mt-1 tracking-tight">12</h3>
              </div>
            </div>

            {/* Completed Exams */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100/80 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 shrink-0">
                <CheckCircle2 size={22} strokeWidth={1.8} />
              </div>
              <div className="mt-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Exams</p>
                <h3 className="text-3xl font-black text-slate-900 mt-1 tracking-tight">28</h3>
              </div>
            </div>

          </div>

          {/* Filters Row */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by patient or radiologist..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-sm font-semibold focus:ring-2 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400"
              />
            </div>
            {/* Dropdowns & buttons */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              
              {/* Exam Type */}
              <button className="flex-1 md:flex-initial flex items-center justify-between px-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:bg-slate-50 transition-all font-bold text-xs text-slate-650 min-w-[120px] cursor-pointer">
                <span>Exam Type</span>
                <ChevronDown size={14} className="text-slate-400 ml-2" />
              </button>

              {/* Status */}
              <button className="flex-1 md:flex-initial flex items-center justify-between px-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:bg-slate-50 transition-all font-bold text-xs text-slate-650 min-w-[130px] cursor-pointer">
                <span>All Statuses</span>
                <ChevronDown size={14} className="text-slate-400 ml-2" />
              </button>

              {/* Date */}
              <button className="flex-1 md:flex-initial flex items-center justify-between px-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:bg-slate-50 transition-all font-bold text-xs text-slate-650 min-w-[140px] cursor-pointer">
                <span>Oct 24, 2023</span>
                <Calendar size={14} className="text-slate-400 ml-2" />
              </button>

              {/* Refresh */}
              <button className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:bg-slate-50 transition-all text-slate-500 cursor-pointer">
                <RefreshCw size={14} />
              </button>

            </div>
          </div>

          {/* Table Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100/80 overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[180px]">
                      Exam ID
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[200px]">
                      Patient
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Modality
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Body Part
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Time
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-[100px]">
                      Priority
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Status
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Radiologist
                    </th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-[120px]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredExams.map((exam) => {
                    return (
                      <tr key={exam.id} className="hover:bg-slate-50/20 transition-colors">
                        
                        {/* Exam ID */}
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 shadow-sm bg-slate-900 border border-slate-200">
                              <img
                                src={exam.image}
                                alt="Exam scan thumbnail"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-sm font-extrabold text-slate-800 block">
                                {exam.id}
                              </span>
                              {exam.isStat && (
                                <span className="text-[9px] font-black tracking-widest text-red-500 block uppercase">
                                  STAT
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Patient */}
                        <td className="px-6 py-6">
                          <div className="space-y-0.5">
                            <span className="text-sm font-extrabold text-slate-800 block">
                              {exam.patientName}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 block">
                              ID: {exam.patientId}
                            </span>
                          </div>
                        </td>

                        {/* Modality */}
                        <td className="px-6 py-6">
                          <span className={`inline-block px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase ${exam.modalityColor}`}>
                            {exam.modality}
                          </span>
                        </td>

                        {/* Body Part */}
                        <td className="px-6 py-6 text-sm font-bold text-slate-650">
                          {exam.bodyPart}
                        </td>

                        {/* Time */}
                        <td className="px-6 py-6 text-sm font-bold text-slate-650">
                          {exam.time}
                        </td>

                        {/* Priority */}
                        <td className="px-6 py-6 text-center">
                          {exam.priorityDot ? (
                            <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-650 ring-4 ring-red-100 animate-pulse" />
                          ) : (
                            <span className="text-slate-300 font-bold">—</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-6">
                          <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black tracking-wide uppercase ${exam.statusColor}`}>
                            {exam.status}
                          </span>
                        </td>

                        {/* Radiologist */}
                        <td className="px-6 py-6 text-sm font-extrabold text-slate-650">
                          {exam.radiologist}
                        </td>

                        {/* Actions */}
                        <td className="px-8 py-6">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              title="View Details"
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-all border border-slate-200 cursor-pointer"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              title="Report Document"
                              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all border border-slate-200 cursor-pointer"
                            >
                              <FileText size={15} />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}

                  {filteredExams.length === 0 && (
                    <tr>
                      <td colSpan={9} className="text-center py-16 text-slate-400 text-sm font-medium">
                        No exams found in the list matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Showing {filteredExams.length} of {MOCK_EXAM_ROOMS.length} exams
              </p>
              <div className="flex items-center gap-1">
                <button
                  disabled
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200/50 bg-white text-slate-350 transition-colors disabled:opacity-40 cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200/50 bg-blue-600 text-white text-xs font-bold transition-colors cursor-pointer">
                  1
                </button>
                <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200/50 bg-white text-slate-500 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer">
                  2
                </button>
                <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200/50 bg-white text-slate-500 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer">
                  3
                </button>
                <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200/50 bg-white text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
};

export default RadiologistExamRooms;
