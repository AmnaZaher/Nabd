import React, { useState, useEffect, useMemo } from "react";
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
import {
  getRadiologyRequests,
  type RadiologyRequestListItemDto,
} from "../../../api/radilogist";

interface RequestItem {
  id: string;
  examId: string;
  isStat?: boolean;
  patientName: string;
  patientId: string;
  modality: "MRI" | "CT SCAN" | "X-RAY" | "ULTRASOUND" | "US" | "CT";
  bodyPart: string;
  status: "In Progress" | "Completed" | "Pending";
  statusLabel?: "In Progress" | "Completed" | "Pending" | "Urgent";
  radiologist: string | null;
}

const MOCK_REQUESTS: RadiologyRequestListItemDto[] = [
  {
    id: 9021,
    requestId: 9021,
    requestNumber: "#RAD-9021",
    isStat: true,
    priority: "Urgent",
    patientName: "Eleanor Vance",
    patientId: 101,
    patientFileNumber: "8829-XP",
    modality: "MRI",
    bodyPart: "Brain (Contrast)",
    status: "Pending",
    radiologistName: "Dr. K. Aris",
    examName: "MRI Brain w/ Contrast",
    testName: "MRI Brain w/ Contrast",
    category: "MRI",
    studyDescription: "Brain (Contrast)",
  },
  {
    id: 9022,
    requestId: 9022,
    requestNumber: "#RAD-9022",
    isStat: false,
    priority: "Routine",
    patientName: "Arthur Morgan",
    patientId: 102,
    patientFileNumber: "1102-AM",
    modality: "CT SCAN",
    bodyPart: "Lumbar Spine",
    status: "In Progress",
    radiologistName: "Dr. J. Vane",
    examName: "CT Lumbar Spine",
    testName: "CT Lumbar Spine",
    category: "CT",
    studyDescription: "Lumbar Spine",
  },
  {
    id: 9023,
    requestId: 9023,
    requestNumber: "#RAD-9023",
    isStat: false,
    priority: "Routine",
    patientName: "Sarah Connor",
    patientId: 103,
    patientFileNumber: "5543-SC",
    modality: "X-RAY",
    bodyPart: "Left Ankle",
    status: "Completed",
    radiologistName: "Dr. L. Myers",
    examName: "X-Ray Left Ankle",
    testName: "X-Ray Left Ankle",
    category: "X-RAY",
    studyDescription: "Left Ankle",
  },
  {
    id: 9024,
    requestId: 9024,
    requestNumber: "#RAD-9024",
    isStat: false,
    priority: "Routine",
    patientName: "John Doe",
    patientId: 104,
    patientFileNumber: "0023-JD",
    modality: "ULTRASOUND",
    bodyPart: "Abdomen",
    status: "Pending",
    radiologistName: null,
    examName: "Ultrasound Abdomen",
    testName: "Ultrasound Abdomen",
    category: "ULTRASOUND",
    studyDescription: "Abdomen",
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

const statusConfig: Record<string, { dot: string; text: string; pill: string }> = {
  "In Progress": {
    dot: "bg-blue-400",
    text: "text-blue-600",
    pill: "bg-blue-50 border-blue-100",
  },
  Completed: {
    dot: "bg-green-400",
    text: "text-green-600",
    pill: "bg-green-50 border-green-100",
  },
  Pending: {
    dot: "bg-amber-400",
    text: "text-amber-600",
    pill: "bg-amber-50 border-amber-100",
  },
  Urgent: {
    dot: "bg-red-400",
    text: "text-red-600",
    pill: "bg-red-50 border-red-100",
  },
};

const normalizeModality = (value?: string): RequestItem["modality"] => {
  const v = (value || "").toUpperCase();

  if (v.includes("MRI")) return "MRI";
  if (v.includes("ULTRA")) return "ULTRASOUND";
  if (v === "US") return "US";
  if (v.includes("X-RAY") || v.includes("XRAY") || v.includes("XR")) return "X-RAY";
  if (v.includes("CT")) return "CT SCAN";

  return "CT";
};

const normalizeStatus = (value?: string): RequestItem["status"] => {
  const v = (value || "").toLowerCase();

  if (v.includes("complete") || v.includes("done") || v.includes("finished")) {
    return "Completed";
  }

  if (v.includes("progress") || v.includes("started") || v.includes("checked")) {
    return "In Progress";
  }

  return "Pending";
};

const mapRequest = (item: RadiologyRequestListItemDto): RequestItem => ({
  id: String(item.id ?? item.requestId ?? Math.random()),
  examId: item.requestNumber || `#RAD-${item.id ?? item.requestId ?? "—"}`,
  isStat:
    !!item.isStat ||
    (item.priority || "").toLowerCase().includes("stat") ||
    (item.priority || "").toLowerCase().includes("urgent"),
  patientName: item.patientName || "Unknown Patient",
  patientId: item.patientFileNumber || item.fileNumber || String(item.patientId ?? "—"),
  modality: normalizeModality(item.modality || item.examName || item.testName || item.category),
  bodyPart: item.bodyPart || item.studyDescription || "—",
  status: normalizeStatus(item.status),
  statusLabel:
    (item.priority || "").toLowerCase().includes("urgent") ||
    (item.priority || "").toLowerCase().includes("stat")
      ? "Urgent"
      : normalizeStatus(item.status),
  radiologist: item.radiologistName || null,
});

const RadiologistRequests: React.FC<{
  onMenuClick?: () => void;
  onProfileClick?: () => void;
}> = ({ onMenuClick, onProfileClick }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<StatusTab>("Pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [requests, setRequests] = useState<RadiologyRequestListItemDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const ITEMS_PER_PAGE = 4;

  useEffect(() => {
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getRadiologyRequests();

      if (Array.isArray(data) && data.length > 0) {
        setRequests(data);
      } else {
        console.warn("Radiology API returned empty array, using mock data.");
        setRequests(MOCK_REQUESTS);
      }
    } catch (err: any) {
      console.warn("Radiology API failed, using mock data.", err);
      setRequests(MOCK_REQUESTS);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  fetchRequests();
}, []);

  const mappedRequests = useMemo(() => requests.map(mapRequest), [requests]);

  const getCount = (status: StatusTab) =>
    mappedRequests.filter((r) => r.status === status).length;

  const filtered = mappedRequests.filter((req) => {
    const tabMatch = req.status === activeTab;
    const q = searchQuery.toLowerCase();

    const searchMatch =
      req.patientName.toLowerCase().includes(q) ||
      req.examId.toLowerCase().includes(q) ||
      req.patientId.toLowerCase().includes(q);

    return tabMatch && searchMatch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const tabCountLabel = (count: number) => String(count).padStart(2, "0");

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
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Active Exams Queue
            </h2>
            <p className="text-slate-500 text-sm mt-0.5">
              Real-time status of all diagnostic imaging requests across facilities.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {STATUS_TABS.map((tab) => {
              const active = activeTab === tab;
              const count = getCount(tab);
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setCurrentPage(1);
                  }}
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

          <div className="flex flex-col md:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Patient Name or Queue ID..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 placeholder:text-slate-400 font-medium"
              />
            </div>

            {["Exam Type", "All Statuses", "Doctor"].map((label) => (
              <button
                key={label}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                {label}
                <ChevronDown size={14} className="text-slate-400" />
              </button>
            ))}

            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap">
              <Calendar size={14} className="text-slate-400" />
              Oct 24, 2023
            </button>

            <button className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
              <SlidersHorizontal size={16} className="text-slate-500" />
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-16 text-center text-slate-400 text-sm">
                Loading requests...
              </div>
            ) : error ? (
              <div className="py-16 text-center text-red-500 text-sm">{error}</div>
            ) : (
              <>
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
                        const badgeStatus = req.statusLabel || req.status;
                        const sc = statusConfig[badgeStatus] ?? statusConfig["Pending"];
                        const mc =
                          modalityColors[req.modality] ??
                          "bg-slate-100 text-slate-500 border-slate-200";
                        const canStart = !!req.radiologist;

                        return (
                          <tr
                            key={req.id}
                            className="hover:bg-slate-50/50 transition-colors"
                          >
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

                            <td className="px-6 py-5">
                              <span className="block text-sm font-bold text-slate-800">
                                {req.patientName}
                              </span>
                              <span className="text-[11px] text-slate-400 font-medium">
                                ID: {req.patientId}
                              </span>
                            </td>

                            <td className="px-6 py-5">
                              <span
                                className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase border ${mc}`}
                              >
                                {req.modality}
                              </span>
                            </td>

                            <td className="px-6 py-5 text-sm font-medium text-slate-700">
                              {req.bodyPart}
                            </td>

                            <td className="px-6 py-5">
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${sc.pill} ${sc.text}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                                {badgeStatus}
                              </span>
                            </td>

                            <td className="px-6 py-5 text-sm font-medium text-slate-700">
                              {req.radiologist ?? (
                                <span className="text-slate-400 italic">Unassigned</span>
                              )}
                            </td>

                            <td className="px-6 py-5">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() =>
                                    navigate(`/dashboard/radiology/view-exam/${req.id}`)
                                  }
                                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                                  title="View"
                                >
                                  <Eye size={15} />
                                </button>

                                <button
                                  onClick={() =>
                                    canStart &&
                                    navigate(`/dashboard/radiology/scan/${req.id}`)
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

                <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
                  <p className="text-xs text-slate-400 font-semibold">
                    Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–
                    {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of{" "}
                    {filtered.length} exams
                  </p>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <ChevronLeft size={14} />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(
                        (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
                      )
                      .reduce<(number | "...")[]>((acc, p, i, arr) => {
                        if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((item, i) =>
                        item === "..." ? (
                          <span
                            key={`ellipsis-${i}`}
                            className="w-8 h-8 flex items-center justify-center text-xs text-slate-400"
                          >
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

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RadiologistRequests;