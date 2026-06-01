import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../TopBar";
import {
  Calendar,
  ClipboardList,
  CheckCircle2,
  Search,
  ChevronDown,
  SlidersHorizontal,
  RefreshCw,
  Eye,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  getListOfAllExams,
  type RadiologyExamListItemDto,
} from "../../../api/radiologyExamRooms";

type ExamStatus = "Urgent" | "In Progress" | "Completed" | "Pending";

interface ExamRoomItem {
  id: string;
  examId: string;
  isStat?: boolean;
  patientName: string;
  patientId: string;
  modality: string;
  modalityColor: string;
  bodyPart: string;
  time: string;
  priorityDot?: boolean;
  status: ExamStatus;
  statusColor: string;
  radiologist: string;
}

const ITEMS_PER_PAGE = 4;

const getModalityColor = (modality: string) => {
  const value = modality.toLowerCase();

  if (value.includes("mri")) {
    return "bg-purple-50 text-purple-700 border border-purple-100";
  }

  if (value.includes("ct")) {
    return "bg-slate-100 text-slate-700 border border-slate-200";
  }

  if (value.includes("x-ray") || value.includes("xray") || value.includes("xr")) {
    return "bg-blue-50 text-blue-700 border border-blue-100";
  }

  if (value.includes("ultra")) {
    return "bg-violet-100 text-violet-700 border border-violet-200";
  }

  return "bg-slate-50 text-slate-600 border border-slate-100";
};

const mapStatus = (item: RadiologyExamListItemDto): ExamStatus => {
  const rawStatus = (item.status || "").toLowerCase();
  const rawPriority = (item.priority || "").toLowerCase();

  if (item.isStat || rawPriority.includes("urgent") || rawPriority.includes("stat")) {
    return "Urgent";
  }

  if (rawStatus.includes("progress") || rawStatus.includes("in progress")) {
    return "In Progress";
  }

  if (rawStatus.includes("completed") || rawStatus.includes("complete")) {
    return "Completed";
  }

  return "Pending";
};

const getStatusColor = (status: ExamStatus) => {
  switch (status) {
    case "Urgent":
      return "bg-red-50 text-red-650 border border-red-100";
    case "In Progress":
      return "bg-blue-50 text-blue-650 border border-blue-100";
    case "Completed":
      return "bg-emerald-50 text-emerald-650 border border-emerald-100";
    case "Pending":
    default:
      return "bg-amber-50 text-amber-650 border border-amber-100";
  }
};

const formatTime = (value?: string) => {
  if (!value) return "—";

  if (/am|pm/i.test(value)) return value;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const mapExamItem = (item: RadiologyExamListItemDto): ExamRoomItem => {
  const examId = String(item.examId || item.id || "");
  const requestLabel = item.requestNumber
    ? `#${item.requestNumber}`
    : examId
    ? `#RAD-${examId}`
    : "#RAD-0000";

  const modality = item.modality || item.examName || item.testName || "Unknown";
  const status = mapStatus(item);

  return {
    id: requestLabel,
    examId,
    isStat: !!item.isStat,
    patientName: item.patientName || "Unknown Patient",
    patientId: item.patientFileNumber || item.fileNumber || "—",
    modality: modality.toUpperCase(),
    modalityColor: getModalityColor(modality),
    bodyPart: item.bodyPart || item.studyDescription || item.testName || "—",
    time: formatTime(item.scheduledTime || item.examDate || item.createdAt),
    priorityDot: status === "Urgent",
    status,
    statusColor: getStatusColor(status),
    radiologist: item.radiologistName || "Unassigned",
  };
};

const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  badge?: string;
  footerColor?: string;
}> = ({ title, value, icon, badge, footerColor = "bg-blue-100" }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100/80 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
    <div className={`absolute bottom-0 left-0 right-0 h-1 ${footerColor}`} />
    <div className="flex justify-between items-start">
      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 shrink-0">
        {icon}
      </div>
      {badge ? (
        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
          {badge}
        </span>
      ) : null}
    </div>
    <div className="mt-6">
      <p className="text-xs font-medium text-slate-500">{title}</p>
      <h3 className="text-[38px] leading-none font-black text-slate-900 mt-2 tracking-tight">
        {value}
      </h3>
    </div>
  </div>
);

const RadiologistExamRooms: React.FC<{
  onMenuClick?: () => void;
  onProfileClick?: () => void;
}> = ({ onMenuClick, onProfileClick }) => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [examTypeFilter, setExamTypeFilter] = useState("Exam Type");
  const [activeStatus, setActiveStatus] = useState("All Statuses");
  const [doctorFilter] = useState("Doctor");
  const [selectedDate] = useState("Oct 24, 2023");
  const [currentPage, setCurrentPage] = useState(1);

  const [exams, setExams] = useState<ExamRoomItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadExams = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    setErrorMessage("");

    try {
      const data = await getListOfAllExams({
        PageSize: 100,
        PageIndex: 1,
      });

      const mapped = data.map(mapExamItem);
      setExams(mapped);
    } catch (error: any) {
      setErrorMessage(error?.message || "Failed to load exams.");
      setExams([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadExams();
  }, []);

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const matchesSearch =
        exam.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.radiologist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.patientId.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        activeStatus === "All Statuses" || exam.status === activeStatus;

      const matchesExamType =
        examTypeFilter === "Exam Type" || exam.modality === examTypeFilter.toUpperCase();

      return matchesSearch && matchesStatus && matchesExamType;
    });
  }, [exams, searchQuery, activeStatus, examTypeFilter]);

  const totalExamsToday = exams.length;
  const pendingExams = exams.filter((e) => e.status === "Pending" || e.status === "Urgent").length;
  const completedExams = exams.filter((e) => e.status === "Completed").length;

  const totalPages = Math.max(1, Math.ceil(filteredExams.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedExams = filteredExams.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE
  );

  const showingStart = filteredExams.length > 0 ? (safeCurrentPage - 1) * ITEMS_PER_PAGE + 1 : 0;
  const showingEnd = Math.min(safeCurrentPage * ITEMS_PER_PAGE, filteredExams.length);

  const getPageButtons = () => {
    const pages: (number | "...")[] = [];

    if (totalPages <= 4) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    if (safeCurrentPage > 2) pages.push("...");
    if (safeCurrentPage !== 1 && safeCurrentPage !== totalPages) pages.push(safeCurrentPage);
    if (safeCurrentPage < totalPages - 1) pages.push("...");
    pages.push(totalPages);

    return [...new Set(pages)];
  };

  const handleViewExam = (examId: string) => {
    if (!examId) return;
    navigate(`/dashboard/radiology/scan/${examId}`);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC]">
      <TopBar
        title="EXAM ROOMS"
        onMenuClick={onMenuClick || (() => {})}
        onProfileClick={onProfileClick}
        showAddUser={false}
      />

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <h2 className="text-[40px] leading-tight font-extrabold text-slate-800 tracking-tight">
              Radiology Exams List
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              title="Total Exams Today"
              value={totalExamsToday}
              badge="+12%"
              footerColor="bg-blue-200"
              icon={<Calendar size={22} strokeWidth={1.8} />}
            />

            <StatCard
              title="Pending Exams"
              value={pendingExams}
              footerColor="bg-violet-200"
              icon={<ClipboardList size={22} strokeWidth={1.8} />}
            />

            <StatCard
              title="Completed Exams"
              value={completedExams}
              footerColor="bg-blue-200"
              icon={<CheckCircle2 size={22} strokeWidth={1.8} />}
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
                  <button className="flex items-center justify-between px-4 py-3.5 bg-white border border-slate-100 rounded-xl shadow-sm hover:bg-slate-50 transition-all font-medium text-sm text-slate-600 min-w-[120px] cursor-pointer">
                    <span>{examTypeFilter}</span>
                    <ChevronDown size={14} className="text-slate-400 ml-2" />
                  </button>
                  <div className="absolute top-full left-0 mt-1 w-44 bg-white border border-slate-100 rounded-xl shadow-lg z-20 hidden group-hover:block">
                    {["Exam Type", "MRI", "CT SCAN", "X-RAY", "ULTRASOUND"].map((opt) => (
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
                  <button className="flex items-center justify-between px-4 py-3.5 bg-white border border-slate-100 rounded-xl shadow-sm hover:bg-slate-50 transition-all font-medium text-sm text-slate-600 min-w-[120px] cursor-pointer">
                    <span>{activeStatus}</span>
                    <ChevronDown size={14} className="text-slate-400 ml-2" />
                  </button>
                  <div className="absolute top-full left-0 mt-1 w-44 bg-white border border-slate-100 rounded-xl shadow-lg z-20 hidden group-hover:block">
                    {["All Statuses", "Urgent", "In Progress", "Completed", "Pending"].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setActiveStatus(opt);
                          setCurrentPage(1);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer first:rounded-t-xl last:rounded-b-xl ${
                          activeStatus === opt
                            ? "bg-blue-50 text-blue-600"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <button className="flex items-center justify-between px-4 py-3.5 bg-white border border-slate-100 rounded-xl shadow-sm hover:bg-slate-50 transition-all font-medium text-sm text-slate-600 min-w-[90px] cursor-pointer">
                  <span>{doctorFilter}</span>
                  <ChevronDown size={14} className="text-slate-400 ml-2" />
                </button>

                <button className="flex items-center justify-between px-4 py-3.5 bg-white border border-slate-100 rounded-xl shadow-sm hover:bg-slate-50 transition-all font-medium text-sm text-slate-600 min-w-[120px] cursor-pointer">
                  <Calendar size={14} className="text-slate-400 mr-2" />
                  <span>{selectedDate}</span>
                </button>

                <button
                  onClick={() => loadExams(true)}
                  disabled={refreshing}
                  className="flex items-center justify-center px-4 py-3.5 bg-white border border-slate-100 rounded-xl shadow-sm hover:bg-slate-50 transition-all text-blue-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {refreshing ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <SlidersHorizontal size={16} />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[28px] shadow-sm border border-slate-100/80 overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] w-[170px]">
                      Exam ID
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] w-[180px]">
                      Patient
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.18em]">
                      Test Name
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.18em]">
                      Body Part
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.18em]">
                      Status
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.18em]">
                      Radiologist
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] text-center w-[120px]">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-50">
                  {loading &&
                    Array.from({ length: 4 }).map((_, idx) => (
                      <tr key={idx}>
                        {Array.from({ length: 7 }).map((__, colIdx) => (
                          <td key={colIdx} className="px-6 py-6">
                            <div className="h-10 bg-slate-100 rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))}

                  {!loading &&
                    paginatedExams.map((exam) => (
                      <tr key={`${exam.examId}-${exam.id}`} className="hover:bg-slate-50/20 transition-colors">
                        <td className="px-8 py-6">
                          <div className="space-y-0.5">
                            <span className="text-sm font-extrabold text-slate-800 block whitespace-pre-line">
                              {exam.id.replace("#", "#\n")}
                            </span>
                            {exam.isStat && (
                              <span className="text-[9px] font-black tracking-widest text-red-500 block uppercase">
                                STAT
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-6">
                          <div className="space-y-0.5">
                            <span className="text-sm font-extrabold text-slate-800 block whitespace-pre-line">
                              {exam.patientName.split(" ").length > 1
                                ? `${exam.patientName.split(" ")[0]}\n${exam.patientName.split(" ").slice(1).join(" ")}`
                                : exam.patientName}
                            </span>
                            <span className="text-[10px] font-medium text-slate-400 block whitespace-pre-line">
                              ID:
                              {"\n"}
                              {exam.patientId}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-6">
                          <span
                            className={`inline-block px-3 py-1.5 rounded-xl text-[9px] font-black tracking-widest uppercase ${exam.modalityColor}`}
                          >
                            {exam.modality}
                          </span>
                        </td>

                        <td className="px-6 py-6 text-sm font-medium text-slate-650 whitespace-pre-line">
                          {exam.bodyPart.split(" ").length > 1
                            ? `${exam.bodyPart.split(" ")[0]}\n${exam.bodyPart.split(" ").slice(1).join(" ")}`
                            : exam.bodyPart}
                        </td>

                        <td className="px-6 py-6">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-wide ${exam.statusColor}`}
                          >
                            {exam.priorityDot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />}
                            {exam.status}
                          </span>
                        </td>

                        <td className="px-6 py-6 text-sm font-medium text-slate-700">
                          {exam.radiologist}
                        </td>

                        <td className="px-8 py-6">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              title="View Details"
                              onClick={() => handleViewExam(exam.examId)}
                              className="text-slate-400 hover:text-blue-600 transition-all cursor-pointer"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              title="Report Document"
                              className="text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                            >
                              <FileText size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                  {!loading && !errorMessage && paginatedExams.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-16 text-slate-400 text-sm font-medium">
                        No exams found in the list matching your filters.
                      </td>
                    </tr>
                  )}

                  {!loading && errorMessage && (
                    <tr>
                      <td colSpan={7} className="text-center py-16 text-red-500 text-sm font-medium">
                        {errorMessage}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-6 bg-slate-50/60 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-xs font-medium text-slate-500">
                Showing {showingStart}-{showingEnd} of {filteredExams.length} exams
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
        </div>
      </main>
    </div>
  );
};

export default RadiologistExamRooms;