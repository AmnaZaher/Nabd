import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../TopBar";
import {
  Search,
  ChevronDown,
  Calendar,
  Hourglass,
  CheckCircle2,
  SlidersHorizontal,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface RequestItem {
  id: string;
  patientName: string;
  patientId: string;
  initials: string;
  modality: string;
  bodyPart: string;
  status: "Pending" | "Scheduled" | "In Progress" | "Completed";
  priority: "URGENT" | "NORMAL";
}

const MOCK_REQUESTS: RequestItem[] = [
  // Pending
  {
    id: "1",
    patientName: "Johnathan Stevens",
    patientId: "RAD-99238",
    initials: "JS",
    modality: "MRI",
    bodyPart: "Spine - Lumbar",
    status: "Pending",
    priority: "URGENT",
  },
  {
    id: "2",
    patientName: "Elena Martinez",
    patientId: "RAD-88210",
    initials: "EM",
    modality: "X-Ray",
    bodyPart: "Chest - PA/Lat",
    status: "Pending",
    priority: "NORMAL",
  },
  {
    id: "3",
    patientName: "Arthur Winston",
    patientId: "RAD-77192",
    initials: "AW",
    modality: "CT",
    bodyPart: "Abdomen/Pelvis",
    status: "Pending",
    priority: "URGENT",
  },
  {
    id: "4",
    patientName: "Sarah Kinsley",
    patientId: "RAD-66584",
    initials: "SK",
    modality: "US",
    bodyPart: "Carotid Doppler",
    status: "Pending",
    priority: "NORMAL",
  },
  // Scheduled
  {
    id: "5",
    patientName: "Eleanor P. Vance",
    patientId: "REQ-8829-MR",
    initials: "EV",
    modality: "MRI",
    bodyPart: "Pelvis",
    status: "Scheduled",
    priority: "NORMAL",
  },
  {
    id: "6",
    patientName: "Arthur Gordon",
    patientId: "REQ-8901-CT",
    initials: "AG",
    modality: "CT",
    bodyPart: "Thorax",
    status: "Scheduled",
    priority: "NORMAL",
  },
  {
    id: "7",
    patientName: "Lydia Chen",
    patientId: "REQ-8922-XR",
    initials: "LC",
    modality: "X-Ray",
    bodyPart: "Hand",
    status: "Scheduled",
    priority: "URGENT",
  },
  // In Progress
  {
    id: "8",
    patientName: "Bruce Wayne",
    patientId: "RAD-11223",
    initials: "BW",
    modality: "MRI",
    bodyPart: "Brain",
    status: "In Progress",
    priority: "URGENT",
  },
  {
    id: "9",
    patientName: "Selina Kyle",
    patientId: "RAD-44332",
    initials: "SK",
    modality: "CT",
    bodyPart: "Chest",
    status: "In Progress",
    priority: "NORMAL",
  },
  // Completed
  {
    id: "10",
    patientName: "Clark Kent",
    patientId: "RAD-55667",
    initials: "CK",
    modality: "X-Ray",
    bodyPart: "Spine",
    status: "Completed",
    priority: "NORMAL",
  },
  {
    id: "11",
    patientName: "Diana Prince",
    patientId: "RAD-99887",
    initials: "DP",
    modality: "US",
    bodyPart: "Thyroid",
    status: "Completed",
    priority: "NORMAL",
  },
];

const RadiologistRequests: React.FC<{
  onMenuClick?: () => void;
  onProfileClick?: () => void;
}> = ({ onMenuClick, onProfileClick }) => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<"Pending" | "Scheduled" | "In Progress" | "Completed">("Pending");
  const [searchQuery, setSearchQuery] = useState("");

  const handleStartExam = (id: string) => {
    alert(`Starting exam for Request ID: ${id}`);
  };

  const filteredRequests = MOCK_REQUESTS.filter((req) => {
    const matchesFilter = req.status === activeFilter;
    const matchesSearch =
      req.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.patientId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatsCount = (status: "Pending" | "In Progress" | "Completed") => {
    return MOCK_REQUESTS.filter((req) => req.status === status).length;
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC]">
      <TopBar
        title="REQUESTS"
        onMenuClick={onMenuClick || (() => {})}
        onProfileClick={onProfileClick}
        showAddUser={false}
      />

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Header Description */}
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Active Exams Queue
            </h2>
            <p className="text-slate-500 font-semibold text-sm mt-1 leading-relaxed">
              Real-time status of all diagnostic imaging requests across facilities.
            </p>
          </div>

          {/* Filtering Tab Blocks (Top row) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Pending */}
            <div
              onClick={() => setActiveFilter("Pending")}
              className={`p-6 rounded-3xl bg-white shadow-sm border transition-all cursor-pointer flex items-center justify-between group ${
                activeFilter === "Pending"
                  ? "border-blue-600 ring-4 ring-blue-500/5 scale-[1.02]"
                  : "border-slate-100 hover:border-slate-200"
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="w-3 h-3 rounded-full bg-amber-400 shrink-0" />
                <span className="text-sm font-extrabold text-slate-800">Pending</span>
              </div>
              <span className={`px-3 py-1 rounded-xl text-xs font-black transition-colors ${
                activeFilter === "Pending" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
              }`}>
                {String(getStatsCount("Pending")).padStart(2, "0")}
              </span>
            </div>

            {/* In Progress */}
            <div
              onClick={() => setActiveFilter("In Progress")}
              className={`p-6 rounded-3xl bg-white shadow-sm border transition-all cursor-pointer flex items-center justify-between group ${
                activeFilter === "In Progress"
                  ? "border-blue-600 ring-4 ring-blue-500/5 scale-[1.02]"
                  : "border-slate-100 hover:border-slate-200"
              }`}
            >
              <div className="flex items-center gap-4">
                <Hourglass size={18} className="text-red-450 shrink-0" />
                <span className="text-sm font-extrabold text-slate-800">In Progress</span>
              </div>
              <span className={`px-3 py-1 rounded-xl text-xs font-black transition-colors ${
                activeFilter === "In Progress" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
              }`}>
                {String(getStatsCount("In Progress")).padStart(2, "0")}
              </span>
            </div>

            {/* Completed */}
            <div
              onClick={() => setActiveFilter("Completed")}
              className={`p-6 rounded-3xl bg-white shadow-sm border transition-all cursor-pointer flex items-center justify-between group ${
                activeFilter === "Completed"
                  ? "border-blue-600 ring-4 ring-blue-500/5 scale-[1.02]"
                  : "border-slate-100 hover:border-slate-200"
              }`}
            >
              <div className="flex items-center gap-4">
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                <span className="text-sm font-extrabold text-slate-800">Completed</span>
              </div>
              <span className={`px-3 py-1 rounded-xl text-xs font-black transition-colors ${
                activeFilter === "Completed" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
              }`}>
                {String(getStatsCount("Completed")).padStart(2, "0")}
              </span>
            </div>

          </div>

          {/* Search, Filter dropdowns, Date range row */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search query box */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Patient or Request ID..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-sm font-semibold focus:ring-2 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400"
              />
            </div>
            {/* Filters stack */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              
              {/* Filter 1 */}
              <button className="flex-1 md:flex-initial flex items-center justify-between px-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:bg-slate-50 transition-all font-bold text-xs text-slate-650 min-w-[120px] cursor-pointer">
                <span>Test Name</span>
                <ChevronDown size={14} className="text-slate-400 ml-2" />
              </button>

              {/* Filter 2 */}
              <button className="flex-1 md:flex-initial flex items-center justify-between px-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:bg-slate-50 transition-all font-bold text-xs text-slate-650 min-w-[120px] cursor-pointer">
                <span>Doctor</span>
                <ChevronDown size={14} className="text-slate-400 ml-2" />
              </button>

              {/* Date Filter */}
              <button className="flex-1 md:flex-initial flex items-center justify-between px-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:bg-slate-50 transition-all font-bold text-xs text-slate-650 min-w-[140px] cursor-pointer">
                <span>Date Range</span>
                <Calendar size={14} className="text-slate-450 ml-2" />
              </button>

            </div>
          </div>

          {/* Active Queue Table Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100/80 overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[250px]">
                      Patient Details
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Modality
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Body Part
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Status
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Priority
                    </th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-[160px]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredRequests.map((req) => {
                    const isUrgent = req.priority === "URGENT";
                    return (
                      <tr key={req.id} className="hover:bg-slate-50/20 transition-colors">
                        
                        {/* Patient Details */}
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                              {req.initials}
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-sm font-extrabold text-slate-800 block">
                                {req.patientName}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 tracking-wider block">
                                ID: {req.patientId}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Modality */}
                        <td className="px-6 py-6">
                          <span className="inline-block px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase bg-blue-50 text-blue-650 border border-blue-100">
                            {req.modality}
                          </span>
                        </td>

                        {/* Body Part */}
                        <td className="px-6 py-6 text-sm font-bold text-slate-650">
                          {req.bodyPart}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-slate-400" />
                            <span className="text-xs font-bold text-slate-600">
                              {req.status}
                            </span>
                          </div>
                        </td>

                        {/* Priority */}
                        <td className="px-6 py-6">
                          <span className={`inline-block px-3 py-1 rounded-lg text-[9px] font-black tracking-wider uppercase ${
                            isUrgent ? "bg-red-50 text-red-650 border border-red-100" : "bg-slate-100 text-slate-500"
                          }`}>
                            {isUrgent ? "! URGENT" : "NORMAL"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-8 py-6">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => navigate(`/dashboard/radiology/view-exam/${req.id}`)}
                              title="View Details"
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-all border border-slate-200 cursor-pointer"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => navigate(`/dashboard/radiology/start-exam/${req.id}`)}
                              className="px-4 py-2 text-xs font-black uppercase tracking-wider bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm shadow-blue-50 transition-all cursor-pointer whitespace-nowrap"
                            >
                              Start Exam
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}

                  {filteredRequests.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-16 text-slate-400 text-sm font-medium">
                        No active exams in the queue matching your selection.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Footer */}
            <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Showing {filteredRequests.length} of {MOCK_REQUESTS.filter(r => r.status === activeFilter).length} Active Exams
              </p>
              <div className="flex items-center gap-1">
                <button
                  disabled
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200/50 bg-white text-slate-300 transition-colors disabled:opacity-40 cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200/50 bg-blue-600 text-white text-xs font-bold transition-colors cursor-pointer">
                  1
                </button>
                <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200/50 bg-white text-slate-500 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer">
                  2
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

export default RadiologistRequests;
