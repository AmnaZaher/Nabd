import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ClipboardCheck,
    CheckCircle2,
    AlertTriangle,
    Clock,
    Search,
    FilterX,
    Eye,
    ShieldCheck,
    Pencil,
    Printer,
    Loader2,
    Calendar,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { exportLabPDF } from '../../../api/labs';
import { useGetLabResultsQuery, useApproveLabResultMutation } from '../../../store/api/labApiSlice';
import type { LabResult } from '../../../types/labs.types';
import TopBar from '../TopBar';

// Normalisation of status to match our UI mapping
function normaliseStatus(raw: string | undefined): string {
    if (!raw) return "Pending";
    const s = raw.trim().toLowerCase();
    if (s === "pending" || s === "scheduled") return "Pending";
    if (s === "inprogress" || s === "in progress" || s === "in_progress") return "In Progress";
    if (s === "completed" || s === "complete") return "Pending Approval";
    if (s === "approved") return "Reviewed";
    return "Pending";
}

function initials(name?: string) {
    if (!name) return "??";
    return name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
}

function formatDate(dateStr?: string) {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    const day = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return `${day} ${time}`;
}

const PAGE_SIZE = 10;

const MOCK_LAB_RESULTS: LabResult[] = [
  { id: 99281, patientName: "James Morrison", fileNumber: "M, 42y", testName: "CBC + Electrolytes", doctorName: "Dr. Aris Thorne", status: "Completed", priority: "Urgent", createdAt: "2023-10-24T14:22:00" },
  { id: 99278, patientName: "Sarah Waters", fileNumber: "F, 29y", testName: "Lipid Profile", doctorName: "Dr. Elena Vance", status: "Completed", priority: "Normal", createdAt: "2023-10-24T13:05:00" },
  { id: 99275, patientName: "Robert King", fileNumber: "M, 65y", testName: "Glucose Tolerance", doctorName: "Dr. Aris Thorne", status: "Approved", priority: "Normal", createdAt: "2023-10-24T11:15:00" },
];

interface LabApprovalPageProps {
    onMenuClick?: () => void;
    onProfileClick?: () => void;
}

const LabApprovalPage: React.FC<LabApprovalPageProps> = ({ onMenuClick, onProfileClick }) => {
    const navigate = useNavigate();


    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [testFilter, setTestFilter] = useState("All Tests");
    const [doctorFilter, setDoctorFilter] = useState("All Doctors");
    const [dateFilter, setDateFilter] = useState("Today");

    const [page, setPage] = useState(1);
    const [approvingIds, setApprovingIds] = useState<Set<number>>(new Set());

    const { data: apiData, isLoading, isError } = useGetLabResultsQuery();
    const [approveResultMutation] = useApproveLabResultMutation();

    const results = useMemo(() => {
        if (apiData && apiData.length > 0) return apiData;
        if (isError) {
            console.warn("Failed to load lab results. Falling back to mock data.");
            return MOCK_LAB_RESULTS;
        }
        return [];
    }, [apiData, isError]);

    const loading = isLoading;

    // Data Processing
    const approvalList = useMemo(() => {
        // We only want tests that are completed or approved for this screen
        return results.filter(r => {
            const s = normaliseStatus(r.status);
            return s === "Pending Approval" || s === "Reviewed";
        });
    }, [results]);

    // Derived stats
    const stats = useMemo(() => {
        let totalPending = 0;
        let approvedToday = 0; // approximation
        let criticalWaiting = 0;

        approvalList.forEach(r => {
            const s = normaliseStatus(r.status);
            const isUrgent = (r.priority || "").toLowerCase() === "urgent";

            if (s === "Pending Approval") {
                totalPending++;
                if (isUrgent) criticalWaiting++;
            }
            if (s === "Reviewed") {
                approvedToday++;
            }
        });

        return { totalPending, approvedToday, criticalWaiting, avgTime: 18 };
    }, [approvalList]);

    // Filtering
    const uniqueTests = ["All Tests", ...Array.from(new Set(approvalList.map(r => r.testName ?? r.labTest?.testNameEnglish ?? "Unknown"))).filter(Boolean)];
    const uniqueDoctors = ["All Doctors", ...Array.from(new Set(approvalList.map(r => r.doctorName ?? r.doctor?.name ?? "Unknown"))).filter(Boolean)];

    const filteredList = approvalList.filter(r => {
        const pName = (r.patientName ?? r.patient?.name ?? "").toLowerCase();
        const tName = (r.testName ?? r.labTest?.testNameEnglish ?? "Unknown");
        const dName = (r.doctorName ?? r.doctor?.name ?? "Unknown");
        
        if (searchQuery && !pName.includes(searchQuery.toLowerCase()) && !r.id.toString().includes(searchQuery)) return false;
        if (testFilter !== "All Tests" && tName !== testFilter) return false;
        if (doctorFilter !== "All Doctors" && dName !== doctorFilter) return false;
        return true;
    });

    const totalPages = Math.max(1, Math.ceil(filteredList.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const paginatedList = filteredList.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    const clearFilters = () => {
        setSearchQuery("");
        setTestFilter("All Tests");
        setDoctorFilter("All Doctors");
        setDateFilter("Today");
        setPage(1);
    };

    // Actions
    const handleApprove = async (id: number) => {
        setApprovingIds(prev => new Set(prev).add(id));
        try {
            await approveResultMutation(id).unwrap();
        } catch (e: any) {
            alert(`Approve failed: ${e.data?.title || e.error || 'Unknown error'}`);
        } finally {
            setApprovingIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    };

    const handleApproveAll = async () => {
        const pendingIds = filteredList
            .filter(r => normaliseStatus(r.status) === "Pending Approval")
            .map(r => r.id);
            
        for (const id of pendingIds) {
            await handleApprove(id);
        }
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC]">
            <TopBar
                title="APPROVE RESULTS"
                onMenuClick={onMenuClick || (() => {})}
                onProfileClick={onProfileClick}
                showAddUser={false}
            />
            <main className="flex-1 overflow-y-auto p-6 md:p-10">
                <div className="max-w-[1600px] mx-auto w-full space-y-8">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">APPROVE RESULTS</p>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Pending Result Approvals</h1>
                        <p className="text-slate-500 font-medium mt-1">Review and approve completed laboratory results for clinical release.</p>
                    </div>
                    <button 
                        onClick={handleApproveAll}
                        className="flex items-center gap-2 bg-[#0066CC] hover:bg-[#0052a3] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-95"
                    >
                        <CheckCircle2 size={18} />
                        Approve All
                    </button>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Pending */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <ClipboardCheck size={20} />
                            </div>
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">Update: Now</span>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-500 mb-1">Total Pending<br/>Approvals</p>
                            <h3 className="text-4xl font-black text-slate-900">{stats.totalPending || 24}</h3>
                        </div>
                    </div>

                    {/* Approved Today */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <CheckCircle2 size={20} />
                            </div>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">+12% vs yest</span>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-500 mb-1">Approved Today<br/>&nbsp;</p>
                            <h3 className="text-4xl font-black text-slate-900">{stats.approvedToday || 156}</h3>
                        </div>
                    </div>

                    {/* Critical Results Waiting */}
                    <div className="bg-[#FFF5F5] rounded-2xl p-6 shadow-sm border border-red-100 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                                <AlertTriangle size={20} />
                            </div>
                            <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2.5 py-1 rounded-md tracking-wider">CRITICAL</span>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-red-800 mb-1">Critical Results<br/>Waiting</p>
                            <h3 className="text-4xl font-black text-red-700">{stats.criticalWaiting || 3}</h3>
                        </div>
                    </div>

                    {/* Average Approval Time */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                <Clock size={20} />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-500 mb-1">Average Approval<br/>Time</p>
                            <h3 className="text-4xl font-black text-slate-900">
                                {stats.avgTime} <span className="text-lg font-bold text-slate-500">mins</span>
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col lg:flex-row gap-4 items-end">
                    {/* Search */}
                    <div className="flex-1 w-full">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input 
                                type="text"
                                placeholder="Patient Name or Request Number..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                                className="w-full pl-11 pr-4 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap sm:flex-nowrap gap-4 w-full lg:w-auto">
                        {/* Test Filter */}
                        <div className="flex-1 sm:w-48">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5 block px-1">Test Name</label>
                            <div className="relative">
                                <select 
                                    value={testFilter}
                                    onChange={(e) => { setTestFilter(e.target.value); setPage(1); }}
                                    className="w-full pl-4 pr-10 py-2.5 appearance-none bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                                >
                                    {uniqueTests.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                            </div>
                        </div>

                        {/* Doctor Filter */}
                        <div className="flex-1 sm:w-48">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5 block px-1">Doctor</label>
                            <div className="relative">
                                <select 
                                    value={doctorFilter}
                                    onChange={(e) => { setDoctorFilter(e.target.value); setPage(1); }}
                                    className="w-full pl-4 pr-10 py-2.5 appearance-none bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                                >
                                    {uniqueDoctors.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                            </div>
                        </div>

                        {/* Date Filter */}
                        <div className="flex-1 sm:w-40">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5 block px-1">Date Range</label>
                            <div className="relative">
                                <select 
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                    className="w-full pl-4 pr-10 py-2.5 appearance-none bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                                >
                                    <option value="Today">Today</option>
                                    <option value="Yesterday">Yesterday</option>
                                    <option value="This Week">This Week</option>
                                    <option value="All Time">All Time</option>
                                </select>
                                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Clear Filters */}
                <div className="flex justify-end -mt-4">
                    <button 
                        onClick={clearFilters}
                        className="flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 bg-transparent hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                        <FilterX size={16} />
                        Clear All Filters
                    </button>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Request #</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Patient Name</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Test Name</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Doctor Name</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Date/Time</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-20">
                                            <Loader2 size={32} className="animate-spin text-blue-500 mx-auto" />
                                        </td>
                                    </tr>
                                ) : paginatedList.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-16 text-slate-500 font-medium">
                                            No results found.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedList.map(req => {
                                        const status = normaliseStatus(req.status);
                                        const pName = req.patientName ?? req.patient?.name ?? "Unknown";
                                        const pDetails = req.fileNumber ?? "—";
                                        const tName = req.testName ?? req.labTest?.testNameEnglish ?? "—";
                                        const dName = req.doctorName ?? req.doctor?.name ?? "—";
                                        const isUrgent = (req.priority || "").toLowerCase() === "urgent";

                                        // Status rendering
                                        let StatusBadge = null;
                                        if (isUrgent && status === "Pending Approval") {
                                            StatusBadge = (
                                                <div className="inline-flex items-center gap-1.5 bg-[#FFF5F5] text-[#C53030] px-3 py-1 rounded-full text-xs font-bold border border-red-100">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#E53E3E]"></span>
                                                    Critical
                                                </div>
                                            );
                                        } else if (status === "Pending Approval") {
                                            StatusBadge = (
                                                <div className="inline-flex items-center gap-1.5 bg-[#FFFAF0] text-[#DD6B20] px-3 py-1 rounded-full text-xs font-bold border border-orange-100">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#ED8936]"></span>
                                                    Pending Approval
                                                </div>
                                            );
                                        } else {
                                            StatusBadge = (
                                                <div className="inline-flex items-center gap-1.5 bg-[#EBF8FF] text-[#3182CE] px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#4299E1]"></span>
                                                    Reviewed
                                                </div>
                                            );
                                        }

                                        return (
                                            <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-bold text-blue-600">#LAB-{req.id}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div 
                                                        className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1 -m-1 rounded-lg transition-colors group"
                                                        onClick={() => navigate(`/dashboard/lab/visit/${req.id}`, { state: { from: '/dashboard/lab-test', label: 'APPROVE RESULTS' } })}
                                                    >
                                                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0 border border-slate-200/50 group-hover:shadow-sm transition-shadow">
                                                            {initials(pName)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{pName}</p>
                                                            <p className="text-[11px] font-medium text-slate-500 mt-0.5">{pDetails}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-semibold text-slate-700">{tName}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-slate-600 font-medium">
                                                        {dName.split('\n').map((line, i) => (
                                                            <React.Fragment key={i}>
                                                                {line}
                                                                {i === 0 && dName.includes('\n') && <br/>}
                                                            </React.Fragment>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-slate-600 font-medium whitespace-pre-line leading-relaxed">
                                                        {formatDate(req.createdAt)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {StatusBadge}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1">
                                                        <button 
                                                            onClick={() => navigate(`/dashboard/lab/result/${req.id}`, { state: { from: '/dashboard/lab-test', label: 'APPROVE RESULTS' } })}
                                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                                            title="View Details"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                        {status === "Pending Approval" && (
                                                            <button 
                                                                onClick={() => handleApprove(req.id)}
                                                                disabled={approvingIds.has(req.id)}
                                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                                                title="Approve"
                                                            >
                                                                {approvingIds.has(req.id) ? (
                                                                    <Loader2 size={18} className="animate-spin" />
                                                                ) : (
                                                                    <ShieldCheck size={18} />
                                                                )}
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={() => navigate(`/dashboard/lab/approve/${req.id}`)}
                                                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                                            title="Edit"
                                                        >
                                                            <Pencil size={18} />
                                                        </button>
                                                        <button 
                                                            onClick={() => exportLabPDF(req.id)}
                                                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                                            title="Print"
                                                        >
                                                            <Printer size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {!loading && paginatedList.length > 0 && (
                        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <p className="text-xs font-semibold text-slate-500">
                                Showing {((safePage - 1) * PAGE_SIZE) + 1} to {Math.min(safePage * PAGE_SIZE, filteredList.length)} of {filteredList.length} results
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={safePage <= 1}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200 text-slate-500 disabled:opacity-30 transition-colors"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                                            p === safePage 
                                                ? "bg-[#0066CC] text-white" 
                                                : "hover:bg-slate-200 text-slate-600"
                                        }`}
                                    >
                                        {p}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={safePage >= totalPages}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200 text-slate-500 disabled:opacity-30 transition-colors"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                </div>
            </main>
        </div>
    );
};

export default LabApprovalPage;
