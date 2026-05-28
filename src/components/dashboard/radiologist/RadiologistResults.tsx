import React from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../TopBar";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Calendar,
  ClipboardList,
  Eye,
  CheckCircle2,
  XCircle,
  SlidersHorizontal,
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────────── */

type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";
type Priority = "URGENT" | "NORMAL";

interface ResultItem {
  queueId: string;
  patientName: string;
  patientId: string;
  examType: string;
  bodyPart: string;
  radiologist: string;
  priority: Priority;
  status: ApprovalStatus;
}

/* ─── Mock Data ──────────────────────────────────────────── */

const MOCK_RESULTS: ResultItem[] = [
  {
    queueId: "RAD-2931",
    patientName: "Alex Thompson",
    patientId: "9823-11-X",
    examType: "CT Scan",
    bodyPart: "Abdomen & Pelvis",
    radiologist: "Dr. Vance",
    priority: "URGENT",
    status: "PENDING",
  },
  {
    queueId: "RAD-2944",
    patientName: "Maria Garcia",
    patientId: "1042-88-Z",
    examType: "MRI Brain",
    bodyPart: "T1/T2 Weighted",
    radiologist: "Dr. Thorne",
    priority: "NORMAL",
    status: "PENDING",
  },
  {
    queueId: "RAD-2812",
    patientName: "David Chen",
    patientId: "0451-22-B",
    examType: "X-Ray / Hand",
    bodyPart: "Left AP/Lateral",
    radiologist: "Dr. Reed",
    priority: "NORMAL",
    status: "APPROVED",
  },
  {
    queueId: "RAD-2990",
    patientName: "Sarah Miller",
    patientId: "1192-33-K",
    examType: "CT Spine",
    bodyPart: "Lumbar 3D Reconstruction",
    radiologist: "Dr. Thorne",
    priority: "URGENT",
    status: "REJECTED",
  },
];

/* ─── Helpers ────────────────────────────────────────────── */

const getStatusBadge = (status: ApprovalStatus) => {
  switch (status) {
    case "PENDING":
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
          PENDING
        </span>
      );
    case "APPROVED":
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200">
          APPROVED
        </span>
      );
    case "REJECTED":
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-red-50 text-red-600 border border-red-200">
          REJECTED
        </span>
      );
  }
};

const getPriorityLabel = (priority: Priority) => {
  if (priority === "URGENT") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-red-600">
        <span className="w-2 h-2 rounded-full bg-red-500" />
        URGENT
      </span>
    );
  }
  return (
    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
      NORMAL
    </span>
  );
};

/* Mini scan preview placeholder */
const PreviewThumbnail: React.FC = () => (
  <div className="flex items-center gap-2.5">
    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
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
    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider cursor-pointer hover:text-blue-700 transition-colors">
      VIEW IMAGES
    </span>
  </div>
);

/* ─── Component ──────────────────────────────────────────── */

const RadiologistResults: React.FC<{
  onMenuClick?: () => void;
  onProfileClick?: () => void;
}> = ({ onMenuClick, onProfileClick }) => {
  const navigate = useNavigate();

  /* Action button per status */
  const getActionButton = (item: ResultItem) => {
    switch (item.status) {
      case "PENDING":
        return (
          <button
            onClick={() =>
              navigate(
                `/dashboard/radiology/results/review/${item.queueId}`
              )
            }
            className="px-4 py-2 text-[11px] font-black uppercase tracking-wider bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm shadow-blue-100 transition-all cursor-pointer whitespace-nowrap"
          >
            Review Report
          </button>
        );
      case "APPROVED":
        return (
          <button className="px-4 py-2 text-[11px] font-black uppercase tracking-wider bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl transition-all cursor-pointer whitespace-nowrap">
            View Record
          </button>
        );
      case "REJECTED":
        return (
          <button className="px-4 py-2 text-[11px] font-black uppercase tracking-wider bg-slate-800 hover:bg-slate-900 text-white rounded-xl transition-all cursor-pointer whitespace-nowrap">
            Re-Review
          </button>
        );
    }
  };

  /* Pagination stub */
  const pages: (number | "...")[] = [1, 2, 3, "...", 6];
  const currentPage = 1;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC]">
      <TopBar
        title="RESULTS"
        onMenuClick={onMenuClick || (() => {})}
        onProfileClick={onProfileClick}
        showAddUser={false}
      />

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header */}
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Report Approval Queue
            </h2>
            <p className="text-slate-500 font-semibold text-sm mt-1 leading-relaxed">
              Reviewing clinical findings for final validation.
            </p>
          </div>

          {/* ── Stat Cards Row ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Pending Approvals */}
            <div className="relative flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <ClipboardList size={22} className="text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Pending Approvals
                </p>
                <p className="text-2xl font-extrabold text-slate-900 leading-tight mt-0.5">
                  24
                </p>
              </div>
              <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                +12%
              </span>
            </div>

            {/* Reports Under Review */}
            <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <Eye size={22} className="text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Reports Under Review
                </p>
                <p className="text-2xl font-extrabold text-slate-900 leading-tight mt-0.5">
                  8
                </p>
              </div>
            </div>

            {/* Approved Today */}
            <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <CheckCircle2 size={22} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Approved Today
                </p>
                <p className="text-2xl font-extrabold text-slate-900 leading-tight mt-0.5">
                  156
                </p>
              </div>
            </div>

            {/* Rejected Reports */}
            <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <XCircle size={22} className="text-red-500" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Rejected Reports
                </p>
                <p className="text-2xl font-extrabold text-slate-900 leading-tight mt-0.5">
                  3
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
                placeholder="Patient Name or Queue ID..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-sm font-semibold focus:ring-2 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Status Dropdown */}
              <button className="flex-1 md:flex-initial flex items-center justify-between px-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:bg-slate-50 transition-all font-bold text-xs text-slate-600 min-w-[130px] cursor-pointer">
                <span>All Statuses</span>
                <ChevronDown size={14} className="text-slate-400 ml-2" />
              </button>

              {/* Radiologist Dropdown */}
              <button className="flex-1 md:flex-initial flex items-center justify-between px-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:bg-slate-50 transition-all font-bold text-xs text-slate-600 min-w-[140px] cursor-pointer">
                <span>All Radiologists</span>
                <ChevronDown size={14} className="text-slate-400 ml-2" />
              </button>

              {/* Date */}
              <button className="flex-1 md:flex-initial flex items-center gap-2 px-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:bg-slate-50 transition-all font-bold text-xs text-slate-600 min-w-[140px] cursor-pointer">
                <span>mm/dd/yyyy</span>
                <Calendar size={14} className="text-slate-400 ml-auto" />
              </button>

              {/* More Filters */}
              <button className="flex items-center justify-center w-11 h-11 bg-white border border-slate-100 rounded-2xl shadow-sm hover:bg-slate-50 transition-all cursor-pointer">
                <SlidersHorizontal size={16} className="text-slate-400" />
              </button>
            </div>
          </div>

          {/* ── Data Table ── */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100/80 overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1100px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[100px]">
                      Queue #
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[180px]">
                      Patient Details
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Scan Preview
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Exam & Body Part
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Radiologist
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Priority
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Status
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-[150px]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {MOCK_RESULTS.map((item) => (
                    <tr
                      key={item.queueId}
                      className="hover:bg-slate-50/40 transition-colors"
                    >
                      {/* Queue # */}
                      <td className="px-6 py-5">
                        <span className="text-sm font-bold text-slate-500">
                          {item.queueId}
                        </span>
                      </td>

                      {/* Patient Details */}
                      <td className="px-6 py-5">
                        <div className="space-y-0.5">
                          <span className="text-sm font-extrabold text-slate-800 block">
                            {item.patientName}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 tracking-wider block">
                            ID: {item.patientId}
                          </span>
                        </div>
                      </td>

                      {/* Scan Preview */}
                      <td className="px-6 py-5">
                        <PreviewThumbnail />
                      </td>

                      {/* Exam & Body Part */}
                      <td className="px-6 py-5">
                        <div className="space-y-0.5">
                          <span className="text-sm font-bold text-slate-700 block">
                            {item.examType}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400 block">
                            {item.bodyPart}
                          </span>
                        </div>
                      </td>

                      {/* Radiologist */}
                      <td className="px-6 py-5 text-sm font-bold text-slate-600">
                        {item.radiologist}
                      </td>

                      {/* Priority */}
                      <td className="px-6 py-5">
                        {getPriorityLabel(item.priority)}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5">
                        {getStatusBadge(item.status)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center">
                          {getActionButton(item)}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {MOCK_RESULTS.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
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
                Showing 1-4 of 24 Pending Entries
              </p>
              <div className="flex items-center gap-1">
                <button
                  disabled
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200/50 bg-white text-slate-300 transition-colors disabled:opacity-40 cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>

                {pages.map((page, idx) =>
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

                <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200/50 bg-white text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
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

export default RadiologistResults;
