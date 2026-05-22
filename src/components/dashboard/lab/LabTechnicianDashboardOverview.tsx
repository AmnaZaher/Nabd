import React, { useState, useEffect, useCallback } from "react";
import TopBar from "../TopBar";
import {
  ClipboardList,
  Hourglass,
  CheckCircle2,
  AlertCircle,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  FileEdit,
  RefreshCw,
  X,
  Loader2,
  CheckCheck,
  FileDown,
  FlaskConical,
} from "lucide-react";
import {
  getLabResults,
  approveLabResult,
  createLabResult,
  getLabResultDetails,
  exportLabPDF,
} from "../../../api/labs";
import type { LabResult, LabResultDetail, LabStats, FinalResultDto } from "../../../types/labs.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Normalise the various shapes the backend returns for status */
function normaliseStatus(raw: string | undefined): "Pending" | "In Progress" | "Completed" | "Approved" | "Scheduled" {
  if (!raw) return "Pending";
  const s = raw.trim().toLowerCase();
  if (s === "pending") return "Pending";
  if (s === "inprogress" || s === "in progress" || s === "in_progress") return "In Progress";
  if (s === "completed" || s === "complete") return "Completed";
  if (s === "approved") return "Approved";
  if (s === "scheduled") return "Scheduled";
  return "Pending";
}

/** Derive display initials from a name */
function initials(name?: string) {
  if (!name) return "??";
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Compute stat counts from the raw results list */
function computeStats(results: LabResult[]): LabStats {
  let pending = 0, inProgress = 0, completed = 0, critical = 0;
  for (const r of results) {
    const s = normaliseStatus(r.status);
    if (s === "Pending" || s === "Scheduled") pending++;
    if (s === "In Progress") inProgress++;
    if (s === "Completed" || s === "Approved") completed++;
    if ((r.priority || "").toLowerCase() === "urgent") critical++;
  }
  return { total: results.length, pending, inProgress, completed, critical };
}

// ─── Enter Result Modal ───────────────────────────────────────────────────────

interface EnterResultModalProps {
  result: LabResultDetail;
  onClose: () => void;
  onSubmit: (payload: FinalResultDto) => Promise<void>;
}

const EnterResultModal: React.FC<EnterResultModalProps> = ({ result, onClose, onSubmit }) => {
  const [values, setValues] = useState<Record<number, { value: string; comment: string }>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params = result.parameters ?? [];

  const handleChange = (paramId: number, field: "value" | "comment", val: string) => {
    setValues((prev) => ({
      ...prev,
      [paramId]: { ...(prev[paramId] ?? { value: "", comment: "" }), [field]: val },
    }));
  };

  const handleSubmit = async () => {
    setError(null);
    const results = params
      .filter((p) => values[p.id]?.value !== undefined && values[p.id]?.value !== "")
      .map((p) => ({
        paramterId: p.id,
        paramterValue: parseFloat(values[p.id]?.value ?? "0"),
        comment: values[p.id]?.comment ?? "",
      }));

    if (results.length === 0) {
      setError("Please enter at least one result value.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ requestId: result.requestId ?? result.id, results });
      onClose();
    } catch (e: any) {
      setError(e.message ?? "Failed to submit results.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Enter Lab Results</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {result.patientName ?? result.patient?.name ?? "Patient"} — {result.testName ?? result.labTest?.testNameEnglish ?? "Test"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {params.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No parameters defined for this test.</p>
          ) : (
            params.map((p) => (
              <div key={p.id} className="bg-slate-50 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">{p.parameterNameEnglish}</span>
                  <span className="text-xs text-slate-400">
                    {p.unit} &nbsp;|&nbsp; Ref: {p.referenceRangeMin}–{p.referenceRangeMax}
                  </span>
                </div>
                <input
                  type="number"
                  placeholder="Enter value..."
                  value={values[p.id]?.value ?? ""}
                  onChange={(e) => handleChange(p.id, "value", e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                />
                <input
                  type="text"
                  placeholder="Comment (optional)"
                  value={values[p.id]?.comment ?? ""}
                  onChange={(e) => handleChange(p.id, "comment", e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                />
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 space-y-3">
          {error && (
            <p className="text-xs font-semibold text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-xl text-sm font-bold text-white transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <FlaskConical size={14} />}
              {submitting ? "Submitting…" : "Submit Results"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Tab type ─────────────────────────────────────────────────────────────────

type TabStatus = "Pending" | "Scheduled" | "In Progress" | "Completed";

// ─── Main Component ───────────────────────────────────────────────────────────

const PAGE_SIZE = 7;

const LabTechnicianDashboardOverview: React.FC<{
  onMenuClick?: () => void;
  onProfileClick?: () => void;
}> = ({ onMenuClick, onProfileClick }) => {
  const [activeTab, setActiveTab] = useState<TabStatus>("Pending");
  const [results, setResults] = useState<LabResult[]>([]);
  const [stats, setStats] = useState<LabStats>({ total: 0, pending: 0, inProgress: 0, completed: 0, critical: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Enter result modal state
  const [enterResultFor, setEnterResultFor] = useState<LabResultDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<number | null>(null);

  // Approve state
  const [approvingId, setApprovingId] = useState<number | null>(null);

  // ── Fetch all results ──────────────────────────────────────────────────────

  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getLabResults();
      const data: LabResult[] = Array.isArray(res) ? res : (res as any)?.data ?? [];
      setResults(data);
      setStats(computeStats(data));
    } catch (e: any) {
      setError(e.message ?? "Failed to load lab results.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // ── Filtered & paginated list ──────────────────────────────────────────────

  const filteredResults = results.filter((r) => {
    const s = normaliseStatus(r.status);
    if (activeTab === "Pending") return s === "Pending";
    if (activeTab === "Scheduled") return s === "Scheduled";
    if (activeTab === "In Progress") return s === "In Progress";
    if (activeTab === "Completed") return s === "Completed" || s === "Approved";
    return false;
  });

  const totalPages = Math.max(1, Math.ceil(filteredResults.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filteredResults.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Recently completed (last 4)
  const recentlyCompleted = results
    .filter((r) => {
      const s = normaliseStatus(r.status);
      return s === "Completed" || s === "Approved";
    })
    .slice(-4)
    .reverse();

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleApprove = async (resultId: number) => {
    setApprovingId(resultId);
    try {
      await approveLabResult(resultId);
      await fetchResults(); // refresh
    } catch (e: any) {
      alert(`Approve failed: ${e.message}`);
    } finally {
      setApprovingId(null);
    }
  };

  const handleOpenEnterResult = async (resultId: number) => {
    setLoadingDetail(resultId);
    try {
      const detail = await getLabResultDetails(resultId);
      const detailData: LabResultDetail = (detail as any)?.data ?? detail;
      setEnterResultFor(detailData as LabResultDetail);
    } catch (e: any) {
      alert(`Could not load details: ${e.message}`);
    } finally {
      setLoadingDetail(null);
    }
  };

  const handleSubmitResult = async (payload: FinalResultDto) => {
    await createLabResult(payload);
    await fetchResults();
  };

  const handleExport = (resultId: number) => {
    exportLabPDF(resultId);
  };

  // ── Tab change resets page ─────────────────────────────────────────────────

  const handleTabChange = (tab: TabStatus) => {
    setActiveTab(tab);
    setPage(1);
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC]">
      <TopBar
        title="DASHBOARD"
        onMenuClick={onMenuClick || (() => {})}
        onProfileClick={onProfileClick}
        showAddUser={false}
      />

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-[1600px] mx-auto space-y-8">

          {/* Subheader */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Lab Technician Dashboard
              </h2>
              <p className="text-slate-500 font-medium mt-1">
                Manage laboratory requests and daily operations
              </p>
            </div>
            <button
              onClick={fetchResults}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {/* Global error banner */}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-5 py-4 text-red-700 text-sm font-medium">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
              <button
                onClick={fetchResults}
                className="ml-auto text-red-600 font-bold hover:underline text-xs"
              >
                Retry
              </button>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">

            {/* Card 1: Total */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
                  <ClipboardList size={22} />
                </div>
              </div>
              <div className="mt-5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Requests</p>
                {loading ? (
                  <div className="h-9 w-12 bg-slate-100 animate-pulse rounded-lg mt-1" />
                ) : (
                  <h3 className="text-3xl font-black text-slate-900 mt-1">{stats.total}</h3>
                )}
              </div>
            </div>

            {/* Card 2: Pending */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between group hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 shrink-0">
                <Clock size={22} />
              </div>
              <div className="mt-5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending</p>
                {loading ? (
                  <div className="h-9 w-12 bg-slate-100 animate-pulse rounded-lg mt-1" />
                ) : (
                  <h3 className="text-3xl font-black text-slate-900 mt-1">{stats.pending}</h3>
                )}
              </div>
            </div>

            {/* Card 3: In Progress */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between group hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-500 shrink-0">
                <Hourglass size={22} />
              </div>
              <div className="mt-5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">In Progress</p>
                {loading ? (
                  <div className="h-9 w-12 bg-slate-100 animate-pulse rounded-lg mt-1" />
                ) : (
                  <h3 className="text-3xl font-black text-slate-900 mt-1">{stats.inProgress}</h3>
                )}
              </div>
            </div>

            {/* Card 4: Completed */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between group hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 shrink-0">
                <CheckCircle2 size={22} />
              </div>
              <div className="mt-5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed</p>
                {loading ? (
                  <div className="h-9 w-12 bg-slate-100 animate-pulse rounded-lg mt-1" />
                ) : (
                  <h3 className="text-3xl font-black text-slate-900 mt-1">{stats.completed}</h3>
                )}
              </div>
            </div>

            {/* Card 5: Critical / Urgent */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-500 shrink-0">
                  <AlertCircle size={22} />
                </div>
                {stats.critical > 0 && (
                  <span className="text-[9px] font-black tracking-wider text-white bg-red-500 px-2 py-0.5 rounded-full uppercase">
                    Urgent
                  </span>
                )}
              </div>
              <div className="mt-5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Critical Results</p>
                {loading ? (
                  <div className="h-9 w-12 bg-slate-100 animate-pulse rounded-lg mt-1" />
                ) : (
                  <h3 className="text-3xl font-black text-red-600 mt-1">{stats.critical}</h3>
                )}
              </div>
            </div>
          </div>

          {/* Two Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Left Column: Today's Lab Requests */}
            <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col justify-between min-h-[500px]">
              <div>
                {/* Table Header */}
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h3 className="text-lg font-bold text-slate-800">Lab Requests</h3>
                  {/* Tabs */}
                  <div className="bg-slate-100/80 p-1 rounded-xl flex gap-1 self-stretch sm:self-auto overflow-x-auto">
                    {(["Pending", "Scheduled", "In Progress", "Completed"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => handleTabChange(tab)}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                          activeTab === tab
                            ? "bg-white text-blue-600 shadow-sm border border-slate-200/40"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  {loading ? (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 size={28} className="animate-spin text-blue-500" />
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50">
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">ID</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Patient</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Test</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Priority</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {paginated.map((req) => {
                          const normStatus = normaliseStatus(req.status);
                          const patientName = req.patientName ?? req.patient?.name ?? "Unknown";
                          const testName = req.testName ?? req.labTest?.testNameEnglish ?? "—";
                          const doctorName = req.doctorName ?? req.doctor?.name ?? "—";
                          const priority = req.priority ?? "Normal";
                          const isUrgent = priority.toLowerCase() === "urgent";
                          const isCompleted = normStatus === "Completed" || normStatus === "Approved";
                          const isApproved = req.isApproved || normStatus === "Approved";

                          return (
                            <tr key={req.id} className="hover:bg-slate-50/30 transition-colors">
                              {/* ID */}
                              <td className="px-6 py-4">
                                <span className="text-sm font-bold text-blue-600">#{req.id}</span>
                              </td>

                              {/* Patient */}
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 border border-slate-200/30">
                                    {initials(patientName)}
                                  </div>
                                  <div>
                                    <span className="text-sm font-semibold text-slate-700">{patientName}</span>
                                    {req.fileNumber && (
                                      <p className="text-[10px] text-slate-400">#{req.fileNumber}</p>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Test */}
                              <td className="px-6 py-4">
                                <p className="text-sm font-semibold text-slate-700">{testName}</p>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{doctorName}</span>
                              </td>

                              {/* Priority */}
                              <td className="px-6 py-4">
                                <span className={`text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full ${
                                  isUrgent
                                    ? "bg-red-50 text-red-600"
                                    : "bg-slate-100 text-slate-500"
                                }`}>
                                  {priority}
                                </span>
                              </td>

                              {/* Status */}
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2 text-xs font-medium">
                                  <Clock size={14} className="text-slate-400" />
                                  <span className="text-slate-600">{normStatus}</span>
                                </div>
                              </td>

                              {/* Actions */}
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-1">
                                  {/* Enter Result — only for non-completed */}
                                  {!isCompleted && (
                                    <button
                                      onClick={() => handleOpenEnterResult(req.id)}
                                      disabled={loadingDetail === req.id}
                                      title="Enter Result"
                                      className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-50"
                                    >
                                      {loadingDetail === req.id
                                        ? <Loader2 size={16} className="animate-spin" />
                                        : <FileEdit size={16} />
                                      }
                                    </button>
                                  )}

                                  {/* Approve — only for completed, not yet approved */}
                                  {isCompleted && !isApproved && (
                                    <button
                                      onClick={() => handleApprove(req.id)}
                                      disabled={approvingId === req.id}
                                      title="Approve Result"
                                      className="p-2 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-all cursor-pointer disabled:opacity-50"
                                    >
                                      {approvingId === req.id
                                        ? <Loader2 size={16} className="animate-spin" />
                                        : <CheckCheck size={16} />
                                      }
                                    </button>
                                  )}

                                  {/* Export PDF — only for approved */}
                                  {isApproved && (
                                    <button
                                      onClick={() => handleExport(req.id)}
                                      title="Export PDF"
                                      className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all cursor-pointer"
                                    >
                                      <FileDown size={16} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}

                        {!loading && paginated.length === 0 && (
                          <tr>
                            <td colSpan={6} className="text-center py-16 text-slate-400 text-sm font-medium">
                              No requests found for "{activeTab}" status.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Pagination */}
              <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Showing {paginated.length} of {filteredResults.length} results
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={safePage <= 1}
                    className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200/50 bg-white text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200/50 bg-white text-xs font-bold transition-colors cursor-pointer ${
                        p === safePage ? "text-blue-600" : "text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage >= totalPages}
                    className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200/50 bg-white text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-4 space-y-8 relative">

              {/* Recently Completed */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-5">
                <h3 className="text-sm font-bold text-slate-800 tracking-wider border-b border-slate-50 pb-4">
                  Recently Completed
                </h3>

                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start gap-3 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-slate-200 mt-1.5 shrink-0" />
                        <div className="space-y-1.5 flex-1">
                          <div className="h-3 bg-slate-100 rounded w-3/4" />
                          <div className="h-2 bg-slate-100 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentlyCompleted.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-4">No completed tests yet.</p>
                ) : (
                  <div className="space-y-4">
                    {recentlyCompleted.map((item) => (
                      <div key={item.id} className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <div>
                          <h4 className="text-sm font-bold text-slate-700 leading-tight">
                            {item.testName ?? item.labTest?.testNameEnglish ?? "Test"}
                          </h4>
                          <span className="text-xs font-semibold text-slate-400">
                            {item.patientName ?? item.patient?.name ?? "—"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => handleTabChange("Completed")}
                  className="text-blue-600 hover:text-blue-700 font-bold text-xs uppercase tracking-wider text-center block w-full pt-4 border-t border-slate-50 hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>

              {/* FAB */}
              <div className="absolute -bottom-4 right-0 z-10">
                <button
                  onClick={() => handleTabChange("Pending")}
                  title="View Pending Requests"
                  className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <Plus size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Enter Result Modal */}
      {enterResultFor && (
        <EnterResultModal
          result={enterResultFor}
          onClose={() => setEnterResultFor(null)}
          onSubmit={handleSubmitResult}
        />
      )}
    </div>
  );
};

export default LabTechnicianDashboardOverview;
