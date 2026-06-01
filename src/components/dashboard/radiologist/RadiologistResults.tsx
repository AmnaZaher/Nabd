import React, { useEffect, useMemo, useState } from "react";
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
  SlidersHorizontal,
} from "lucide-react";
import {
  type ApprovedReportDto,
  getAllApprovedReports,
} from "../../../api/radiologyResults";

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
  examId: string;
  reportId?: string;
}

const normalizeStatus = (item: ApprovedReportDto): ApprovalStatus => {
  const raw = (
    item.approvalStatus ||
    item.reportStatus ||
    item.status ||
    ""
  ).toLowerCase();

  if (raw.includes("approved") || raw.includes("verified") || raw.includes("final")) {
    return "APPROVED";
  }

  if (raw.includes("reject")) {
    return "REJECTED";
  }

  return "PENDING";
};

const normalizePriority = (value?: string): Priority => {
  const v = (value || "").toLowerCase();
  if (v.includes("urgent") || v.includes("stat")) return "URGENT";
  return "NORMAL";
};

const mapReportToResultItem = (item: ApprovedReportDto): ResultItem => ({
  queueId: `RAD-${item.examId ?? item.id ?? item.reportId ?? "—"}`,
  patientName: item.patientName || "Unknown Patient",
  patientId: item.patientFileNumber || item.fileNumber || String(item.patientId ?? "—"),
  examType: item.examType || item.modality || "Radiology Exam",
  bodyPart: item.bodyPart || item.studyDescription || "—",
  radiologist: item.radiologistName || "—",
  priority: normalizePriority(item.priority),
  status: normalizeStatus(item),
  examId: String(item.examId ?? item.id ?? item.reportId ?? "—"),
  reportId: item.reportId ? String(item.reportId) : undefined,
});

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

const RadiologistResults: React.FC<{
  onMenuClick?: () => void;
  onProfileClick?: () => void;
}> = ({ onMenuClick, onProfileClick }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getAllApprovedReports();
        setItems(data.map(mapReportToResultItem));
      } catch (err: any) {
        setError(err?.message || "Failed to load results.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.patientName.toLowerCase().includes(q) ||
        item.queueId.toLowerCase().includes(q) ||
        item.patientId.toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));

  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const approvedCount = items.filter((x) => x.status === "APPROVED").length;
  const pendingCount = items.filter((x) => x.status === "PENDING").length;
  const reviewCount = items.filter((x) => x.status === "PENDING").length;

  const getActionButton = (item: ResultItem) => {
    switch (item.status) {
      case "PENDING":
        return (
          <button
            onClick={() => navigate(`/dashboard/radiology/results/review/${item.examId}`)}
            className="px-4 py-2 text-[11px] font-black uppercase tracking-wider bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm shadow-blue-100 transition-all cursor-pointer whitespace-nowrap"
          >
            Review Report
          </button>
        );
      case "APPROVED":
        return (
          <button
            onClick={() => navigate(`/dashboard/radiology/results/review/${item.examId}`)}
            className="px-4 py-2 text-[11px] font-black uppercase tracking-wider bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl transition-all cursor-pointer whitespace-nowrap"
          >
            View Record
          </button>
        );
      case "REJECTED":
        return (
          <button
            onClick={() => navigate(`/dashboard/radiology/results/review/${item.examId}`)}
            className="px-4 py-2 text-[11px] font-black uppercase tracking-wider bg-slate-800 hover:bg-slate-900 text-white rounded-xl transition-all cursor-pointer whitespace-nowrap"
          >
            Re-Review
          </button>
        );
    }
  };

  const pages: (number | "...")[] = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
    .reduce<(number | "...")[]>((acc, p, i, arr) => {
      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
      acc.push(p);
      return acc;
    }, []);

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
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Report Approval Queue
            </h2>
            <p className="text-slate-500 font-semibold text-sm mt-1 leading-relaxed">
              Reviewing clinical findings for final validation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="relative flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <ClipboardList size={22} className="text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Pending Approvals
                </p>
                <p className="text-2xl font-extrabold text-slate-900 leading-tight mt-0.5">
                  {pendingCount}
                </p>
              </div>
              <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                —
              </span>
            </div>

            <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <Eye size={22} className="text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Reports Under Review
                </p>
                <p className="text-2xl font-extrabold text-slate-900 leading-tight mt-0.5">
                  {reviewCount}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <CheckCircle2 size={22} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Approved Today
                </p>
                <p className="text-2xl font-extrabold text-slate-900 leading-tight mt-0.5">
                  {approvedCount}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Patient Name or Queue ID..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-sm font-semibold focus:ring-2 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <button className="flex-1 md:flex-initial flex items-center justify-between px-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:bg-slate-50 transition-all font-bold text-xs text-slate-600 min-w-[130px] cursor-pointer">
                <span>All Statuses</span>
                <ChevronDown size={14} className="text-slate-400 ml-2" />
              </button>

              <button className="flex-1 md:flex-initial flex items-center justify-between px-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:bg-slate-50 transition-all font-bold text-xs text-slate-600 min-w-[140px] cursor-pointer">
                <span>All Radiologists</span>
                <ChevronDown size={14} className="text-slate-400 ml-2" />
              </button>

              <button className="flex-1 md:flex-initial flex items-center gap-2 px-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:bg-slate-50 transition-all font-bold text-xs text-slate-600 min-w-[140px] cursor-pointer">
                <span>mm/dd/yyyy</span>
                <Calendar size={14} className="text-slate-400 ml-auto" />
              </button>

              <button className="flex items-center justify-center w-11 h-11 bg-white border border-slate-100 rounded-2xl shadow-sm hover:bg-slate-50 transition-all cursor-pointer">
                <SlidersHorizontal size={16} className="text-slate-400" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100/80 overflow-hidden flex flex-col">
            {loading ? (
              <div className="py-16 text-center text-slate-400 text-sm font-medium">
                Loading results...
              </div>
            ) : error ? (
              <div className="py-16 text-center text-red-500 text-sm font-medium">
                {error}
              </div>
            ) : (
              <>
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
                          Exam & Body Part
                        </th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Radiologist
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
                      {paginatedItems.map((item) => (
                        <tr
                          key={item.queueId}
                          className="hover:bg-slate-50/40 transition-colors"
                        >
                          <td className="px-6 py-5">
                            <span className="text-sm font-bold text-slate-500">
                              {item.queueId}
                            </span>
                          </td>

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

                          <td className="px-6 py-5 text-sm font-bold text-slate-600">
                            {item.radiologist}
                          </td>

                          <td className="px-6 py-5">
                            {getStatusBadge(item.status)}
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex items-center justify-center">
                              {getActionButton(item)}
                            </div>
                          </td>
                        </tr>
                      ))}

                      {paginatedItems.length === 0 && (
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

                <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Showing {filteredItems.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}-
                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredItems.length)} of {filteredItems.length} Entries
                  </p>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200/50 bg-white text-slate-300 transition-colors disabled:opacity-40 cursor-pointer"
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
                          onClick={() => setCurrentPage(page)}
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
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200/50 bg-white text-slate-400 hover:text-slate-600 transition-colors cursor-pointer disabled:opacity-40"
                    >
                      <ChevronRight size={16} />
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

export default RadiologistResults;