import React, { useEffect, useMemo, useState } from "react";
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
import {
  getAllRadiologyReports,
  ensureArray,
  type GetAllReportsApiItem,
} from "../../../api/radiologyReporting";

/* ─── Types ──────────────────────────────────────────────── */

type ReportStatus = "Waiting for Report" | "In Progress" | "Completed" | "Reviewed";
type Priority = "URGENT" | "HIGH" | "NORMAL";
type Modality = "CT Scan" | "X-Ray" | "MRI" | "Ultrasound" | "Unknown";

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
  radiologist: string;
  previewUrl?: string;
  raw?: GetAllReportsApiItem;
}

/* ─── Helpers ────────────────────────────────────────────── */

const ITEMS_PER_PAGE = 3;

const mapApiStatusToUiStatus = (status?: string): ReportStatus => {
  const value = (status || "").toLowerCase();

  if (
    value.includes("verified") ||
    value.includes("reviewed") ||
    value.includes("approved")
  ) {
    return "Reviewed";
  }

  if (
    value.includes("final") ||
    value.includes("complete") ||
    value.includes("completed")
  ) {
    return "Completed";
  }

  if (
    value.includes("draft") ||
    value.includes("progress") ||
    value.includes("in progress")
  ) {
    return "In Progress";
  }

  return "Waiting for Report";
};

const inferPriority = (item: GetAllReportsApiItem): Priority => {
  const text = `${item.bodyPart || ""} ${item.examType || ""} ${item.testName || ""}`.toLowerCase();

  if (text.includes("brain") || text.includes("head") || text.includes("neck")) {
    return "URGENT";
  }

  if (text.includes("spine") || text.includes("abdomen") || text.includes("pelvis")) {
    return "HIGH";
  }

  return "NORMAL";
};

const mapApiModality = (item: GetAllReportsApiItem): Modality => {
  const raw = (
    item.modality ||
    item.examType ||
    item.testName ||
    ""
  ).toLowerCase();

  if (raw.includes("ct")) return "CT Scan";
  if (raw.includes("x-ray") || raw.includes("xray") || raw.includes("xr")) return "X-Ray";
  if (raw.includes("mri")) return "MRI";
  if (raw.includes("ultra")) return "Ultrasound";

  return "Unknown";
};

const formatDate = (value?: string) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (value?: string) => {
  if (!value) return "—";

  const directTimePattern = /am|pm/i.test(value);
  if (directTimePattern) return value;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const normalizeReport = (item: GetAllReportsApiItem): ReportItem => {
  const status = mapApiStatusToUiStatus(item.reportStatus || item.status);
  const modality = mapApiModality(item);

  return {
    qId: item.requestNumber || `#${item.examId || item.reportId || item.id || "—"}`,
    patientName: item.patientName || "Unknown Patient",
    patientId: String(item.patientFileNumber || item.patientId || "—"),
    modality,
    bodyPart: item.bodyPart || item.testName || item.examType || "—",
    studyTime: formatTime(item.studyTime || item.studyDate || item.createdAt),
    studyDate: formatDate(item.studyDate || item.createdAt),
    priority: inferPriority(item),
    status,
    radiologist: item.radiologistName || item.radiologist || "Unassigned",
    previewUrl: item.previewUrl || item.imageUrl,
    raw: item,
  };
};

const getModalityBadge = (mod: Modality) => {
  const base =
    "inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[9px] font-black uppercase whitespace-nowrap";

  switch (mod) {
    case "CT Scan":
      return <span className={`${base} bg-slate-100 text-slate-700`}>CT Scan</span>;
    case "X-Ray":
      return <span className={`${base} bg-blue-50 text-blue-600`}>X-Ray</span>;
    case "MRI":
      return <span className={`${base} bg-indigo-50 text-indigo-600`}>MRI</span>;
    case "Ultrasound":
      return <span className={`${base} bg-emerald-50 text-emerald-600`}>Ultrasound</span>;
    default:
      return <span className={`${base} bg-slate-100 text-slate-500`}>Unknown</span>;
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
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-600 border border-purple-100">
          Waiting for Report
        </span>
      );
    case "In Progress":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-spin text-blue-500"
            style={{ animationDuration: "3s" }}
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          In Progress
        </span>
      );
    case "Completed":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
          <CheckCircle2 size={12} />
          Completed
        </span>
      );
    case "Reviewed":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
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
    case "Reviewed":
      return (
        <button className="px-5 py-2 text-[11px] font-black uppercase tracking-wider bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all cursor-pointer whitespace-nowrap">
          View
        </button>
      );
  }
};

const StatCard: React.FC<{
  label: string;
  value: number;
  icon: React.ReactNode;
  iconBg: string;
  accent?: string;
}> = ({ label, value, icon, iconBg, accent = "bg-blue-100" }) => (
  <div className="relative flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
    <div className={`absolute bottom-0 left-0 right-0 h-1 ${accent} rounded-b-2xl`} />
    <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
        {label}
      </p>
      <p className="text-2xl font-extrabold text-slate-900 leading-tight mt-0.5">
        {value}
      </p>
    </div>
  </div>
);

const PreviewThumbnail: React.FC<{ modality: Modality; previewUrl?: string }> = ({
  modality,
  previewUrl,
}) => {
  const bgColor =
    modality === "CT Scan" || modality === "MRI"
      ? "bg-slate-900"
      : modality === "X-Ray"
      ? "bg-slate-800"
      : "bg-slate-700";

  if (previewUrl) {
    return (
      <div className="w-11 h-11 rounded-lg overflow-hidden bg-slate-900 border border-slate-200">
        <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div className={`w-11 h-11 rounded-lg ${bgColor} flex items-center justify-center overflow-hidden`}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="opacity-70">
        <rect x="6" y="4" width="12" height="16" rx="1" fill="#475569" />
        <circle cx="12" cy="10" r="3" fill="#94A3B8" />
        <rect x="9" y="14" width="6" height="4" rx="0.5" fill="#94A3B8" />
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
  const [selectedDateLabel] = useState("Oct 24, 2023");

  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getAllRadiologyReports({
          PageSize: 100,
          PageIndex: 1,
        });

        const rawItems = ensureArray<GetAllReportsApiItem>(response);
        const mapped = rawItems.map(normalizeReport);

        setReports(mapped);
      } catch (err: any) {
        setError(err?.message || "Failed to load reports.");
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const pendingTotal = reports.filter((r) => r.status === "Waiting for Report").length;
  const inProgressTotal = reports.filter((r) => r.status === "In Progress").length;
  const completedToday = reports.filter(
    (r) => r.status === "Completed" || r.status === "Reviewed"
  ).length;

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
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
  }, [reports, searchQuery, examTypeFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / ITEMS_PER_PAGE));

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedReports = filteredReports.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE
  );

  const showingStart =
    filteredReports.length > 0 ? (safeCurrentPage - 1) * ITEMS_PER_PAGE + 1 : 0;
  const showingEnd = Math.min(
    safeCurrentPage * ITEMS_PER_PAGE,
    filteredReports.length
  );

  const getPageButtons = () => {
    const pages: (number | "...")[] = [];

    if (totalPages <= 4) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);

    if (safeCurrentPage > 2) pages.push("...");
    if (safeCurrentPage !== 1 && safeCurrentPage !== totalPages) {
      pages.push(safeCurrentPage);
    }
    if (safeCurrentPage < totalPages - 1) pages.push("...");
    pages.push(totalPages);

    return [...new Set(pages)];
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
        <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <h2 className="text-[40px] leading-tight font-extrabold text-slate-800 tracking-tight">
              Pending Reports Queue
            </h2>
            <p className="text-slate-500 font-medium text-lg mt-1">
              Review and finalize diagnostic reports for priority imaging.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <StatCard
              label="Pending Total"
              value={pendingTotal}
              icon={<ClipboardList size={22} className="text-blue-600" />}
              iconBg="bg-blue-50"
              accent="bg-blue-200"
            />
            <StatCard
              label="In Progress"
              value={inProgressTotal}
              icon={<FileCheck2 size={22} className="text-indigo-600" />}
              iconBg="bg-indigo-50"
              accent="bg-blue-200"
            />
            <StatCard
              label="Completed Today"
              value={completedToday}
              icon={<CheckCircle2 size={22} className="text-slate-700" />}
              iconBg="bg-slate-100"
              accent="bg-slate-200"
            />
          </div>

          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
            <div className="flex flex-col xl:flex-row gap-3 items-stretch xl:items-center">
              <div className="relative flex-1">
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
                  placeholder="Patient Name or Queue ID..."
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-100 rounded-xl shadow-sm text-sm font-medium focus:ring-2 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative group">
                  <button className="flex items-center justify-between px-4 py-3.5 bg-white border border-slate-100 rounded-xl shadow-sm hover:bg-slate-50 transition-all font-medium text-sm text-slate-600 min-w-[110px] cursor-pointer">
                    <span>{examTypeFilter}</span>
                    <ChevronDown size={14} className="text-slate-400 ml-2" />
                  </button>
                  <div className="absolute top-full left-0 mt-1 w-44 bg-white border border-slate-100 rounded-xl shadow-lg z-20 hidden group-hover:block">
                    {["All", "CT Scan", "X-Ray", "MRI", "Ultrasound"].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setExamTypeFilter(opt);
                          setCurrentPage(1);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer first:rounded-t-xl last:rounded-b-xl ${
                          examTypeFilter === opt
                            ? "bg-blue-50 text-blue-600"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative group">
                  <button className="flex items-center justify-between px-4 py-3.5 bg-white border border-slate-100 rounded-xl shadow-sm hover:bg-slate-50 transition-all font-medium text-sm text-slate-600 min-w-[130px] cursor-pointer">
                    <span>{statusFilter === "All" ? "All Statuses" : statusFilter}</span>
                    <ChevronDown size={14} className="text-slate-400 ml-2" />
                  </button>
                  <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-slate-100 rounded-xl shadow-lg z-20 hidden group-hover:block">
                    {["All", "Waiting for Report", "In Progress", "Completed", "Reviewed"].map(
                      (opt) => (
                        <button
                          key={opt}
                          onClick={() => {
                            setStatusFilter(opt);
                            setCurrentPage(1);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer first:rounded-t-xl last:rounded-b-xl ${
                            statusFilter === opt
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

                <button className="flex items-center gap-2 px-4 py-3.5 bg-white border border-slate-100 rounded-xl shadow-sm hover:bg-slate-50 transition-all font-medium text-sm text-slate-600 cursor-pointer">
                  <span>Doctor</span>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                <button className="flex items-center gap-2 px-4 py-3.5 bg-white border border-slate-100 rounded-xl shadow-sm hover:bg-slate-50 transition-all font-medium text-sm text-slate-600 cursor-pointer">
                  <Calendar size={14} className="text-slate-400" />
                  <span>{selectedDateLabel}</span>
                </button>

                <button className="flex items-center gap-2 px-4 py-3.5 bg-white border border-slate-100 rounded-xl shadow-sm hover:bg-slate-50 transition-all font-medium text-sm text-blue-600 cursor-pointer">
                  <SlidersHorizontal size={16} className="text-blue-600" />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[28px] shadow-sm border border-slate-100/80 overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] w-[110px]">
                      Exam ID
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] w-[190px]">
                      Patient &amp; ID
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.18em]">
                      Test Name
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.18em]">
                      Bodypart
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.18em]">
                      Preview
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.18em]">
                      Status
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.18em]">
                      Radiologist
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] text-center w-[150px]">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-50">
                  {loading &&
                    Array.from({ length: 3 }).map((_, idx) => (
                      <tr key={idx}>
                        {Array.from({ length: 8 }).map((__, tdIdx) => (
                          <td key={tdIdx} className="px-6 py-5">
                            <div className="h-10 bg-slate-100 rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))}

                  {!loading &&
                    paginatedReports.map((report) => (
                      <tr key={`${report.qId}-${report.patientId}`} className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-6 py-5">
                          <span className="text-sm font-medium text-slate-500">{report.qId}</span>
                        </td>

                        <td className="px-6 py-5">
                          <div className="space-y-0.5">
                            <span className="text-[28px] leading-7 font-extrabold text-slate-800 block md:text-base md:leading-tight">
                              {report.patientName}
                            </span>
                            <span className="text-[10px] font-medium text-slate-400 block">
                              ID: {report.patientId}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          {getModalityBadge(report.modality)}
                        </td>

                        <td className="px-6 py-5">
                          <span className="text-sm text-slate-700 font-medium whitespace-pre-line">
                            {report.bodyPart}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <PreviewThumbnail
                            modality={report.modality}
                            previewUrl={report.previewUrl}
                          />
                        </td>

                        <td className="px-6 py-5">
                          {getStatusBadge(report.status)}
                        </td>

                        <td className="px-6 py-5">
                          <span className="text-sm text-slate-700 font-medium">
                            {report.radiologist}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center justify-center gap-2">
                            {getActionButton(report.status)}
                          </div>
                        </td>
                      </tr>
                    ))}

                  {!loading && !error && paginatedReports.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="text-center py-16 text-slate-400 text-sm font-medium"
                      >
                        No reports matching your search criteria.
                      </td>
                    </tr>
                  )}

                  {!loading && error && (
                    <tr>
                      <td
                        colSpan={8}
                        className="text-center py-16 text-red-500 text-sm font-medium"
                      >
                        {error}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-6 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-xs font-medium text-slate-500">
                Showing {showingStart} - {showingEnd} of {filteredReports.length} studies
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage === 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>

                {getPageButtons().map((page, idx) =>
                  page === "..." ? (
                    <span
                      key={`dots-${idx}`}
                      className="w-8 h-8 flex items-center justify-center text-xs text-slate-400 font-bold"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page as number)}
                      className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold transition-colors cursor-pointer ${
                        safeCurrentPage === page
                          ? "bg-blue-600 text-white"
                          : "text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {!loading && reports.length > 0 && (
            <div className="hidden">
              {getPriorityBadge("NORMAL")}
              {getPriorityBadge("HIGH")}
              {getPriorityBadge("URGENT")}
              <AlertTriangle size={16} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default RadiologistReporting;