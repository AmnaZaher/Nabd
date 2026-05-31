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
  examId: string;
  isStat?: boolean;
  patientName: string;
  patientId: string;
  modality: "MRI" | "CT SCAN" | "X-RAY" | "ULTRASOUND" | "US" | "CT";
  bodyPart: string;
  status: "In Progress" | "Completed" | "Pending";
  radiologist: string | null;
}

const MOCK_REQUESTS: RequestItem[] = [
 
  {
    id: "1",
    examId: "#RAD-9022",
    patientName: "Arthur Morgan",
    patientId: "1102-AM",
    modality: "CT SCAN",
    bodyPart: "Lumbar Spine",
    status: "In Progress",
    radiologist: "Dr. J. Vane",
  },
  {
    id: "2",
    examId: "#RAD-9023",
    patientName: "Sarah Connor",
    patientId: "5543-SC",
    modality: "X-RAY",
    bodyPart: "Left Ankle",
    status: "Completed",
    radiologist: "Dr. L. Myers",
  },
  {
    id: "3",
    examId: "#RAD-9024",
    patientName: "John Doe",
    patientId: "0023-JD",
    modality: "ULTRASOUND",
    bodyPart: "Abdomen",
    status: "Pending",
    radiologist: null,
  },
  {
    id: "4",
    examId: "#RAD-9026",
    patientName: "Elena Martinez",
    patientId: "RAD-88210",
    modality: "X-RAY",
    bodyPart: "Chest - PA/Lat",
    status: "Pending",
    radiologist: null,
  },
  {
    id: "5",
    examId: "#RAD-9027",
    patientName: "Bruce Wayne",
    patientId: "RAD-11223",
    modality: "MRI",
    bodyPart: "Brain",
    status: "In Progress",
    radiologist: "Dr. J. Vane",
  },
  {
    id: "6",
    examId: "#RAD-9028",
    patientName: "Clark Kent",
    patientId: "RAD-55667",
    modality: "X-RAY",
    bodyPart: "Spine",
    status: "Completed",
    radiologist: "Dr. L. Myers",
  },
];

const STATUS_TABS = ["Pending", "In Progress", "Completed"] as const;
type StatusTab = typeof STATUS_TABS[number];

const modalityColors: Record<string, string> = {
  MRI: "bg-blue-50 text-blue-600 border-blue-100",
  "CT SCAN": "bg-violet-50 text-violet-600 border-violet-100",
  "X-RAY": "bg-sky-50 text-sky-600 border-sky-100",
  ULTRASOUND: "bg-purple-50 text-purple-600 border-purple-100",
  US: "bg-teal-50 text-teal-600 border-teal-100",
  CT: "bg-violet-50 text-violet-600 border-violet-100",
};

const statusConfig: Record<
  string,
  { dot: string; text: string; pill: string }
> = {
  "In Progress":{ dot: "bg-blue-400",  text: "text-blue-600",   pill: "bg-blue-50 border-blue-100" },
  Completed:   { dot: "bg-green-400",  text: "text-green-600",  pill: "bg-green-50 border-green-100" },
  Pending:     { dot: "bg-amber-400",  text: "text-amber-600",  pill: "bg-amber-50 border-amber-100" },
};

const RadiologistRequests: React.FC<{
  onMenuClick?: () => void;
  onProfileClick?: () => void;
}> = ({ onMenuClick, onProfileClick }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<StatusTab>("Pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 4;

  const getCount = (status: StatusTab) =>
    MOCK_REQUESTS.filter((r) => r.status === status).length;

  const filtered = MOCK_REQUESTS.filter((req) => {
    const tabMatch =
      activeTab === "Pending"
        ? req.status === "Pending"
        : req.status === activeTab;
    const searchMatch =
      req.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.examId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.patientId.toLowerCase().includes(searchQuery.toLowerCase());
    return tabMatch && searchMatch;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const tabCountLabel = (count: number) =>
    String(count).padStart(2, "0");

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F4F6FA]">
      <TopBar
        title="REQUESTS"
        onMenuClick={onMenuClick || (() => {})}
        onProfileClick={onProfileClick}
        showAddUser={false}
      />

      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-6">

          {/* Page title */}
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Active Exams Queue
            </h2>
            <p className="text-slate-500 text-sm mt-0.5">
              Real-time status of all diagnostic imaging requests across facilities.
            </p>
          </div>

          {/* ── Status tab pills ── */}
          <div className="grid grid-cols-3 gap-4">
            {STATUS_TABS.map((tab) => {
              const active = activeTab === tab;
              const count = getCount(tab);
              return (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                  className={`flex items-center justify-between px-5 py-4 rounded-2xl border text-sm font-bold transition-all cursor-pointer ${
                    active
                      ? "bg-white border-[#1A6FC4] ring-4 ring-blue-500/8 shadow-sm"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {tab === "Pending" && (
                      <span className="w-3 h-3 rounded-full bg-amber-400 shrink-0" />
                    )}
                    {tab === "In Progress" && (
                      <Hourglass size={16} className="text-slate-400 shrink-0" />
                    )}
                    {tab === "Completed" && (
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                    )}
                    <span className="text-slate-800">{tab}</span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-lg text-xs font-black tabular-nums ${
                      active
                        ? "bg-[#1A6FC4] text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {tabCountLabel(count)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── Search + filters ── */}
          <div className="flex flex-col md:flex-row gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Patient Name or Queue ID..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 placeholder:text-slate-400 font-medium"
              />
            </div>

            {/* Dropdowns */}
            {["Exam Type", "All Statuses", "Doctor"].map((label) => (
              <button
                key={label}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                {label}
                <ChevronDown size={14} className="text-slate-400" />
              </button>
            ))}

            {/* Date */}
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap">
              <Calendar size={14} className="text-slate-400" />
              Oct 24, 2023
            </button>

            {/* Sliders */}
            <button className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
              <SlidersHorizontal size={16} className="text-slate-500" />
            </button>
          </div>

          {/* ── Table ── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[780px]">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Exam ID
                    </th>
                    <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Patient
                    </th>
                    <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Modality
                    </th>
                    <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Body Part
                    </th>
                    <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Status
                    </th>
                    <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Radiologist
                    </th>
                    <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginated.map((req) => {
                    const sc = statusConfig[req.status] ?? statusConfig["Pending"];
                    const mc = modalityColors[req.modality] ?? "bg-slate-100 text-slate-500 border-slate-200";
                    const canStart = !!req.radiologist;
                    return (
                      <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">

                        {/* Exam ID */}
                        <td className="px-6 py-5">
                          <span className="block text-sm font-extrabold text-slate-800">
                            {req.examId}
                          </span>
                          {req.isStat && (
                            <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-widest text-red-500">
                              STAT
                            </span>
                          )}
                        </td>

                        {/* Patient */}
                        <td className="px-6 py-5">
                          <span className="block text-sm font-bold text-slate-800">
                            {req.patientName}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            ID: {req.patientId}
                          </span>
                        </td>

                        {/* Modality */}
                        <td className="px-6 py-5">
                          <span
                            className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase border ${mc}`}
                          >
                            {req.modality}
                          </span>
                        </td>

                        {/* Body Part */}
                        <td className="px-6 py-5 text-sm font-medium text-slate-700">
                          {req.bodyPart}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${sc.pill} ${sc.text}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                            {req.status}
                          </span>
                        </td>

                        {/* Radiologist */}
                        <td className="px-6 py-5 text-sm font-medium text-slate-700">
                          {req.radiologist ?? (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => navigate(`/dashboard/radiology/view-exam/${req.id}`)}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                              title="View"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() =>
                                canStart &&
                                navigate(`/dashboard/radiology/start-exam/${req.id}`)
                              }
                              disabled={!canStart}
                              className={`px-4 py-2 text-[11px] font-black uppercase tracking-wide rounded-xl transition-all ${
                                canStart
                                  ? "bg-[#1A6FC4] hover:bg-[#155faa] text-white shadow-sm cursor-pointer"
                                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
                              }`}
                            >
                              Start Exam
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}

                  {paginated.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-16 text-slate-400 text-sm"
                      >
                        No exams match your selection.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Pagination footer ── */}
            <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
              <p className="text-xs text-slate-400 font-semibold">
                Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–
                {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} exams
              </p>

              <div className="flex items-center gap-1">
                {/* Prev */}
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .reduce<(number | "...")[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, i) =>
                    item === "..." ? (
                      <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-slate-400">
                        ...
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setCurrentPage(item as number)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                          currentPage === item
                            ? "bg-[#1A6FC4] border-[#1A6FC4] text-white"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}

                {/* Next */}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronRight size={14} />
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