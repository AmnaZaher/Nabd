import React, { useState } from "react";
import TopBar from "../TopBar";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Calendar,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
  MoreVertical,
  SlidersHorizontal,
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────────── */

type ReportStatus = "Waiting for Report" | "In Progress" | "Completed" | "Reviewed";
type Priority = "URGENT" | "HIGH" | "NORMAL";
type Modality = "CT Scan" | "X-Ray" | "MRI" | "Ultrasound";

interface ReportItem {
  qId: string;
  patientName: string;
  patientId: string;
  modality: Modality;
  bodyPart: string;
  studyTime: string;
  studyDate: string;
  priority: Priority;
  status: ReportStatus;
}

/* ─── Mock Data ──────────────────────────────────────────── */

const MOCK_REPORTS: ReportItem[] = [
  {
    qId: "#4902",
    patientName: "Harrison, Elena",
    patientId: "882-102-392",
    modality: "CT Scan",
    bodyPart: "Abdomen & Pelvis",
    studyTime: "10:45 AM",
    studyDate: "Oct 24, 2023",
    priority: "URGENT",
    status: "Waiting for Report",
  },
  {
    qId: "#4899",
    patientName: "Chen, Wei",
    patientId: "112-455-820",
    modality: "X-Ray",
    bodyPart: "Chest PA/Lat",
    studyTime: "11:12 AM",
    studyDate: "Oct 24, 2023",
    priority: "NORMAL",
    status: "In Progress",
  },
  {
    qId: "#4895",
    patientName: "Peterson, Clara",
    patientId: "902-111-003",
    modality: "MRI",
    bodyPart: "Lumbar Spine",
    studyTime: "11:30 AM",
    studyDate: "Oct 24, 2023",
    priority: "HIGH",
    status: "Waiting for Report",
  },
  {
    qId: "#4891",
    patientName: "Al-Rashidi, Omar",
    patientId: "334-221-908",
    modality: "CT Scan",
    bodyPart: "Head & Neck",
    studyTime: "12:05 PM",
    studyDate: "Oct 24, 2023",
    priority: "URGENT",
    status: "Waiting for Report",
  },
  {
    qId: "#4888",
    patientName: "Kim, Soo-Yun",
    patientId: "665-773-412",
    modality: "Ultrasound",
    bodyPart: "Thyroid",
    studyTime: "12:40 PM",
    studyDate: "Oct 24, 2023",
    priority: "NORMAL",
    status: "Completed",
  },
  {
    qId: "#4885",
    patientName: "Novak, Petra",
    patientId: "201-887-556",
    modality: "X-Ray",
    bodyPart: "Right Knee",
    studyTime: "1:15 PM",
    studyDate: "Oct 24, 2023",
    priority: "NORMAL",
    status: "Reviewed",
  },
  {
    qId: "#4882",
    patientName: "Fernandez, Luis",
    patientId: "998-332-107",
    modality: "MRI",
    bodyPart: "Brain",
    studyTime: "2:00 PM",
    studyDate: "Oct 24, 2023",
    priority: "HIGH",
    status: "In Progress",
  },
  {
    qId: "#4879",
    patientName: "O'Brien, Maeve",
    patientId: "445-611-234",
    modality: "CT Scan",
    bodyPart: "Chest",
    studyTime: "2:30 PM",
    studyDate: "Oct 24, 2023",
    priority: "NORMAL",
    status: "Waiting for Report",
  },
  {
    qId: "#4876",
    patientName: "Singh, Arjun",
    patientId: "778-990-667",
    modality: "X-Ray",
    bodyPart: "Left Wrist",
    studyTime: "3:10 PM",
    studyDate: "Oct 24, 2023",
    priority: "NORMAL",
    status: "Completed",
  },
  {
    qId: "#4873",
    patientName: "Zhang, Li",
    patientId: "112-008-943",
    modality: "MRI",
    bodyPart: "Cervical Spine",
    studyTime: "3:45 PM",
    studyDate: "Oct 24, 2023",
    priority: "URGENT",
    status: "Waiting for Report",
  },
];

/* ─── Helpers ────────────────────────────────────────────── */

const ITEMS_PER_PAGE = 3;

const getModalityIcon = (mod: Modality) => {
  const base =
    "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0";
  switch (mod) {
    case "CT Scan":
      return (
        <span className={`${base} bg-blue-50 text-blue-600 border border-blue-100`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="12" cy="12" r="4" />
            <line x1="3" y1="12" x2="8" y2="12" />
            <line x1="16" y1="12" x2="21" y2="12" />
          </svg>
        </span>
      );
    case "X-Ray":
      return (
        <span className={`${base} bg-slate-50 text-slate-600 border border-slate-200`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="2" width="16" height="20" rx="2" />
            <line x1="12" y1="6" x2="12" y2="18" />
            <line x1="8" y1="10" x2="16" y2="10" />
            <line x1="8" y1="14" x2="16" y2="14" />
          </svg>
        </span>
      );
    case "MRI":
      return (
        <span className={`${base} bg-indigo-50 text-indigo-600 border border-indigo-100`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3v18" />
            <path d="M3 12h18" />
          </svg>
        </span>
      );
    case "Ultrasound":
      return (
        <span className={`${base} bg-emerald-50 text-emerald-600 border border-emerald-100`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12c2-3 5-5 10-5s8 2 10 5" />
            <path d="M5 12c1.5-2 3.5-3 7-3s5.5 1 7 3" />
            <circle cx="12" cy="12" r="2" />
          </svg>
        </span>
      );
  }
};

const getPriorityBadge = (priority: Priority) => {
  switch (priority) {
    case "URGENT":
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-red-50 text-red-600 border border-red-100">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          URGENT
        </span>
      );
    case "HIGH":
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-amber-50 text-amber-700 border border-amber-100">
          HIGH
        </span>
      );
    case "NORMAL":
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-slate-100 text-slate-500">
          NORMAL
        </span>
      );
  }
};

const getStatusBadge = (status: ReportStatus) => {
  switch (status) {
    case "Waiting for Report":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold bg-slate-50 text-slate-600 border border-slate-200">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Waiting for Report
        </span>
      );
    case "In Progress":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin text-blue-500" style={{ animationDuration: '3s' }}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          In Progress
        </span>
      );
    case "Completed":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
          <CheckCircle2 size={12} />
          Completed
        </span>
      );
    case "Reviewed":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold bg-purple-50 text-purple-600 border border-purple-100">
          <FileCheck2 size={12} />
          Reviewed
        </span>
      );
  }
};

const getActionButton = (status: ReportStatus) => {
  switch (status) {
    case "Waiting for Report":
      return (
        <button className="px-5 py-2 text-[11px] font-black uppercase tracking-wider bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm shadow-blue-100 transition-all cursor-pointer whitespace-nowrap">
          Open
        </button>
      );
    case "In Progress":
      return (
        <button className="px-5 py-2 text-[11px] font-black uppercase tracking-wider bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm shadow-blue-100 transition-all cursor-pointer whitespace-nowrap">
          Resume
        </button>
      );
    case "Completed":
      return (
        <button className="px-5 py-2 text-[11px] font-black uppercase tracking-wider bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all cursor-pointer whitespace-nowrap">
          View
        </button>
      );
    case "Reviewed":
      return (
        <button className="px-5 py-2 text-[11px] font-black uppercase tracking-wider bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all cursor-pointer whitespace-nowrap">
          View
        </button>
      );
  }
};

/* Mini X-ray preview placeholder */
const PreviewThumbnail: React.FC<{ modality: Modality }> = ({ modality }) => {
  const bgColor =
    modality === "CT Scan" || modality === "MRI"
      ? "bg-slate-800"
      : modality === "X-Ray"
      ? "bg-slate-700"
      : "bg-slate-600";

  return (
    <div
      className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center overflow-hidden`}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        className="opacity-60"
      >
        <rect x="6" y="4" width="12" height="16" rx="1" fill="#475569" />
        <circle cx="12" cy="10" r="3" fill="#64748B" />
        <rect x="9" y="14" width="6" height="4" rx="0.5" fill="#64748B" />
      </svg>
    </div>
  );
};

/* ─── Component ──────────────────────────────────────────── */

const RadiologistReporting: React.FC<{
  onMenuClick?: () => void;
  onProfileClick?: () => void;
}> = ({ onMenuClick, onProfileClick }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [examTypeFilter, setExamTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  /* Computed stats */
  const pendingTotal = MOCK_REPORTS.filter(
    (r) => r.status === "Waiting for Report"
  ).length;
  const inProgressTotal = MOCK_REPORTS.filter(
    (r) => r.status === "In Progress"
  ).length;
  const completedToday = MOCK_REPORTS.filter(
    (r) => r.status === "Completed" || r.status === "Reviewed"
  ).length;
  const urgentCases = MOCK_REPORTS.filter(
    (r) => r.priority === "URGENT"
  ).length;

  /* Filtering */
  const filteredReports = MOCK_REPORTS.filter((r) => {
    const matchesSearch =
      r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.qId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesExam =
      examTypeFilter === "All" || r.modality === examTypeFilter;

    const matchesStatus =
      statusFilter === "All" || r.status === statusFilter;

    return matchesSearch && matchesExam && matchesStatus;
  });

  /* Pagination */
  const totalPages = Math.max(1, Math.ceil(filteredReports.length / ITEMS_PER_PAGE));
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const showingStart = filteredReports.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0;
  const showingEnd = Math.min(currentPage * ITEMS_PER_PAGE, filteredReports.length);

  /* Page buttons */
  const getPageButtons = () => {
    const pages: (number | "...")[] = [];
    for (let i = 1; i <= Math.min(3, totalPages); i++) pages.push(i);
    if (totalPages > 4) pages.push("...");
    if (totalPages > 3) pages.push(totalPages);
    return pages;
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC]">
      <TopBar
        title="REPORTING"
        onMenuClick={onMenuClick || (() => {})}
        onProfileClick={onProfileClick}
        showAddUser={false}
      />

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header */}
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Pending Reports Queue
            </h2>
            <p className="text-slate-500 font-semibold text-sm mt-1 leading-relaxed">
              Review and finalize diagnostic reports for priority imaging.
            </p>
          </div>

          {/* ── Stat Cards Row ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Pending Total */}
            <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <ClipboardList size={22} className="text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Pending Total
                </p>
                <p className="text-2xl font-extrabold text-slate-900 leading-tight mt-0.5">
                  {String(pendingTotal).padStart(2, "0")}
                </p>
              </div>
            </div>

            {/* In Progress */}
            <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <FileCheck2 size={22} className="text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  In Progress
                </p>
                <p className="text-2xl font-extrabold text-slate-900 leading-tight mt-0.5">
                  {String(inProgressTotal).padStart(2, "0")}
                </p>
              </div>
            </div>

            {/* Completed Today */}
            <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <CheckCircle2 size={22} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Completed Today
                </p>
                <p className="text-2xl font-extrabold text-slate-900 leading-tight mt-0.5">
                  {String(completedToday).padStart(2, "0")}
                </p>
              </div>
            </div>

            {/* Urgent Cases */}
            <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <AlertTriangle size={22} className="text-red-500" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Urgent Cases
                </p>
                <p className="text-2xl font-extrabold text-slate-900 leading-tight mt-0.5">
                  {String(urgentCases).padStart(2, "0")}
                </p>
              </div>
            </div>
          </div>

          {/* ── Search & Filters Row ── */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by patient name, ID or accession #"
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-sm font-semibold focus:ring-2 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Exam Type */}
              <div className="relative group">
                <button className="flex items-center justify-between px-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:bg-slate-50 transition-all font-bold text-xs text-slate-600 min-w-[130px] cursor-pointer">
                  <span>Exam Type: {examTypeFilter}</span>
                  <ChevronDown size={14} className="text-slate-400 ml-2" />
                </button>
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-100 rounded-xl shadow-lg z-20 hidden group-hover:block">
                  {["All", "CT Scan", "X-Ray", "MRI", "Ultrasound"].map(
                    (opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setExamTypeFilter(opt);
                          setCurrentPage(1);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer first:rounded-t-xl last:rounded-b-xl ${
                          examTypeFilter === opt
                            ? "bg-blue-50 text-blue-600"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {opt}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="relative group">
                <button className="flex items-center justify-between px-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:bg-slate-50 transition-all font-bold text-xs text-slate-600 min-w-[120px] cursor-pointer">
                  <span>Status: {statusFilter}</span>
                  <ChevronDown size={14} className="text-slate-400 ml-2" />
                </button>
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-100 rounded-xl shadow-lg z-20 hidden group-hover:block">
                  {[
                    "All",
                    "Waiting for Report",
                    "In Progress",
                    "Completed",
                    "Reviewed",
                  ].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setStatusFilter(opt);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer first:rounded-t-xl last:rounded-b-xl ${
                        statusFilter === opt
                          ? "bg-blue-50 text-blue-600"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Today */}
              <button className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:bg-slate-50 transition-all font-bold text-xs text-slate-600 cursor-pointer">
                <Calendar size={14} className="text-slate-400" />
                <span>Today</span>
              </button>

              {/* More Filters */}
              <button className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:bg-slate-50 transition-all font-bold text-xs text-slate-600 cursor-pointer">
                <SlidersHorizontal size={14} className="text-slate-400" />
                <span>More Filters</span>
              </button>
            </div>
          </div>

          {/* ── Data Table ── */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100/80 overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[80px]">
                      Q-ID
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[180px]">
                      Patient &amp; ID
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Modality
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Body Part
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Study Time
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Priority
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Preview
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Status
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-[140px]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginatedReports.map((report) => (
                    <tr
                      key={report.qId}
                      className="hover:bg-slate-50/40 transition-colors"
                    >
                      {/* Q-ID */}
                      <td className="px-6 py-5">
                        <span className="text-sm font-bold text-slate-500">
                          {report.qId}
                        </span>
                      </td>

                      {/* Patient & ID */}
                      <td className="px-6 py-5">
                        <div className="space-y-0.5">
                          <span className="text-sm font-extrabold text-slate-800 block">
                            {report.patientName}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 tracking-wider block">
                            ID: {report.patientId}
                          </span>
                        </div>
                      </td>

                      {/* Modality */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2.5">
                          {getModalityIcon(report.modality)}
                          <span className="text-xs font-bold text-slate-700">
                            {report.modality}
                          </span>
                        </div>
                      </td>

                      {/* Body Part */}
                      <td className="px-6 py-5 text-sm font-bold text-slate-600">
                        {report.bodyPart}
                      </td>

                      {/* Study Time */}
                      <td className="px-6 py-5">
                        <div className="space-y-0.5">
                          <span className="text-sm font-bold text-slate-700 block">
                            {report.studyTime}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400 block">
                            {report.studyDate}
                          </span>
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="px-6 py-5">
                        {getPriorityBadge(report.priority)}
                      </td>

                      {/* Preview */}
                      <td className="px-6 py-5">
                        <PreviewThumbnail modality={report.modality} />
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5">
                        {getStatusBadge(report.status)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          {getActionButton(report.status)}
                          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all cursor-pointer">
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {paginatedReports.length === 0 && (
                    <tr>
                      <td
                        colSpan={9}
                        className="text-center py-16 text-slate-400 text-sm font-medium"
                      >
                        No reports matching your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Showing {showingStart} - {showingEnd} of{" "}
                {filteredReports.length} studies
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.max(1, p - 1))
                  }
                  disabled={currentPage === 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200/50 bg-white text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>

                {getPageButtons().map((page, idx) =>
                  page === "..." ? (
                    <span
                      key={`dots-${idx}`}
                      className="w-8 h-8 flex items-center justify-center text-xs text-slate-400 font-bold"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page as number)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center border text-xs font-bold transition-colors cursor-pointer ${
                        currentPage === page
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-200/50 bg-white text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200/50 bg-white text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
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

export default RadiologistReporting;
