import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Eye,
    Printer,
    Loader2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ClipboardEdit,
    ClipboardCheck
} from 'lucide-react';
import { exportLabPDF } from '../../../api/labs';
import { useGetLabOrdersQuery } from '../../../store/api/labApiSlice';
import type { LabResult } from '../../../types/labs.types';
import TopBar from '../TopBar';

function normaliseStatus(raw: string | undefined): string {
    if (!raw) return "Pending";
    const s = raw.trim().toLowerCase();
    if (s === "pending") return "Pending";
    if (s === "scheduled") return "Scheduled";
    if (s === "inprogress" || s === "in progress" || s === "in_progress") return "In Progress";
    if (s === "completed" || s === "complete") return "Completed";
    if (s === "approved") return "Completed"; // Or 'Approved' depending on business logic
    return "Pending";
}

function formatDate(dateStr?: string) {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    const day = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return `${day}\n${time}`;
}

const PAGE_SIZE = 10;

const MOCK_LAB_RESULTS: LabResult[] = [
  { id: 9421, patientName: "Emma Lawson", fileNumber: "ID: 482-110-33", testName: "Comprehensive Metabolic Panel", doctorName: "Dr. Sarah Chen", status: "Pending", priority: "Normal", createdAt: "2023-10-24T09:15:00" },
  { id: 9425, patientName: "Mark Thompson", fileNumber: "ID: 102-455-89", testName: "Lipid Profile", doctorName: "Dr. James Wilson", status: "Scheduled", priority: "Normal", createdAt: "2023-10-24T10:45:00" },
  { id: 9428, patientName: "Sophie Bennett", fileNumber: "ID: 882-901-22", testName: "Thyroid Stimulating Hormone (TSH)", doctorName: "Dr. Lisa Gregory", status: "In Progress", priority: "Normal", createdAt: "2023-10-24T11:30:00" },
  { id: 9430, patientName: "Elena Rodriguez", fileNumber: "ID: 552-332-10", testName: "Liver Function Test", doctorName: "Dr. Sarah Chen", status: "Completed", priority: "Normal", createdAt: "2023-10-23T16:15:00" },
];

interface LabOrdersPageProps {
    onMenuClick: () => void;
    onProfileClick: () => void;
}

const LabOrdersPage: React.FC<LabOrdersPageProps> = ({ onMenuClick, onProfileClick }) => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("All");

    const queryParams = useMemo(() => {
        const params: Record<string, any> = {};
        if (searchQuery) params.search = searchQuery;
        if (fromDate) params.FromDate = fromDate;
        if (toDate) params.ToDate = toDate;
        
        if (statusFilter === "Pending") params.Status = 1;
        if (statusFilter === "Scheduled") params.Status = 2;
        if (statusFilter === "In Progress") params.Status = 3;
        if (statusFilter === "Completed") params.Status = 4;
        
        return params;
    }, [searchQuery, fromDate, toDate, statusFilter]);

    const { data: apiData, error: apiError, isLoading: loading, refetch } = useGetLabOrdersQuery(queryParams);

    const { results, hasError } = useMemo(() => {
        let finalData = apiData;

        // Handle case where backend wraps response in a 'data' property
        if (finalData && (finalData as any).data) {
            finalData = (finalData as any).data;
            if (finalData && (finalData as any).data) {
                finalData = (finalData as any).data;
            }
        }

        let isError = !!apiError;
        let fallback = false;

        if (!finalData || !Array.isArray(finalData) || isError) {
            finalData = [];
            fallback = true;
            if (apiError) {
                console.warn("Failed to load lab results.", apiError);
            }
        }

        return {
            results: finalData as LabResult[],
            hasError: fallback,
        };
    }, [apiData, apiError]);

    const error = hasError ? "API unavailable or returned empty data. Showing mock data." : null;

    const [testFilter, setTestFilter] = useState("Test Name");
    const [doctorFilter, setDoctorFilter] = useState("Doctor");
    const [page, setPage] = useState(1);

    // Stats
    const stats = useMemo(() => {
        let pending = 0;
        let scheduled = 0;
        let inProgress = 0;
        let completed = 0;

        results.forEach(r => {
            const s = normaliseStatus(r.status);
            if (s === "Pending") pending++;
            else if (s === "Scheduled") scheduled++;
            else if (s === "In Progress") inProgress++;
            else if (s === "Completed") completed++;
        });

        return { pending, scheduled, inProgress, completed };
    }, [results]);

    // Filtering
    const uniqueTests = ["Test Name", ...Array.from(new Set(results.map(r => r.testName ?? r.labTest?.testNameEnglish ?? "Unknown"))).filter(Boolean)];
    const uniqueDoctors = ["Doctor", ...Array.from(new Set(results.map(r => r.doctorName ?? r.doctor?.name ?? "Unknown"))).filter(Boolean)];

    const filteredList = results.filter(r => {
        const pName = (r.patientName ?? r.patient?.name ?? "").toLowerCase();
        const tName = (r.testName ?? r.labTest?.testNameEnglish ?? "Unknown");
        const dName = (r.doctorName ?? r.doctor?.name ?? "Unknown");
        const s = normaliseStatus(r.status);
        
        if (statusFilter !== "All" && s !== statusFilter) return false;
        if (searchQuery && !pName.includes(searchQuery.toLowerCase()) && !r.id.toString().includes(searchQuery) && !(r.requestNumber?.toString() || "").includes(searchQuery) && !(r.patientFileNumber || "").includes(searchQuery)) return false;
        if (testFilter !== "Test Name" && tName !== testFilter) return false;
        if (doctorFilter !== "Doctor" && dName !== doctorFilter) return false;
        return true;
    });

    const totalPages = Math.max(1, Math.ceil(filteredList.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const paginatedList = filteredList.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC]">
            <TopBar
                title="LAB ORDERS"
                onMenuClick={onMenuClick}
                onProfileClick={onProfileClick}
                showAddUser={false}
            />
            <main className="flex-1 overflow-y-auto p-6 md:p-8">
                <div className="max-w-[1600px] mx-auto w-full space-y-6">
                
                {/* Header Section */}
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Lab Orders</h1>
                    <div className="flex items-center justify-between mt-1">
                        <p className="text-slate-500 font-medium">View and manage pending and active laboratory requests</p>
                        <button
                            onClick={() => refetch()}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
                        >
                            <Loader2 size={14} className={loading ? "animate-spin" : "hidden"} />
                            {!loading && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Global error banner */}
                {error && (
                    <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-5 py-4 text-red-700 text-sm font-medium">
                        <span className="shrink-0 font-bold">!</span>
                        <span>{error}</span>
                        <button
                            onClick={() => refetch()}
                            className="ml-auto text-red-600 font-bold hover:underline text-xs"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Status Cards / Filters */}
                <div className="flex flex-wrap gap-4">
                    {/* Pending */}
                    <button 
                        onClick={() => setStatusFilter(statusFilter === "Pending" ? "All" : "Pending")}
                        className={`flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all ${statusFilter === "Pending" ? 'border-yellow-400 bg-yellow-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                    >
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                        <span className="font-semibold text-slate-700">Pending</span>
                        <span className="ml-2 bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">{stats.pending || '00'}</span>
                    </button>

                    {/* Scheduled */}
                    <button 
                        onClick={() => setStatusFilter(statusFilter === "Scheduled" ? "All" : "Scheduled")}
                        className={`flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all ${statusFilter === "Scheduled" ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                    >
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-400"></div>
                        <span className="font-semibold text-slate-700">Scheduled</span>
                        <span className="ml-2 bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">{stats.scheduled || '00'}</span>
                    </button>

                    {/* In Progress */}
                    <button 
                        onClick={() => setStatusFilter(statusFilter === "In Progress" ? "All" : "In Progress")}
                        className={`flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all ${statusFilter === "In Progress" ? 'border-orange-400 bg-orange-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                    >
                        <div className="w-2.5 h-2.5 rounded-full border-[3px] border-orange-400 !border-t-transparent animate-spin-slow"></div>
                        <span className="font-semibold text-slate-700">In Progress</span>
                        <span className="ml-2 bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">{stats.inProgress || '00'}</span>
                    </button>

                    {/* Completed */}
                    <button 
                        onClick={() => setStatusFilter(statusFilter === "Completed" ? "All" : "Completed")}
                        className={`flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all ${statusFilter === "Completed" ? 'border-green-400 bg-green-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                    >
                        <div className="w-3 h-3 rounded-full bg-green-400 flex items-center justify-center">
                            <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <span className="font-semibold text-slate-700">Completed</span>
                        <span className="ml-2 bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">{stats.completed || '00'}</span>
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                    {/* Filters Bar */}
                    <div className="flex flex-col lg:flex-row gap-4 mb-6">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="text"
                                placeholder="Search Patient or Request ID..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                                className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400"
                            />
                        </div>

                        {/* Dropdowns */}
                        <div className="flex gap-4 w-full lg:w-auto">
                            <div className="relative min-w-[140px]">
                                <select 
                                    value={testFilter}
                                    onChange={(e) => { setTestFilter(e.target.value); setPage(1); }}
                                    className="w-full pl-4 pr-10 py-2.5 appearance-none bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                >
                                    {uniqueTests.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                            </div>

                            <div className="relative min-w-[140px]">
                                <select 
                                    value={doctorFilter}
                                    onChange={(e) => { setDoctorFilter(e.target.value); setPage(1); }}
                                    className="w-full pl-4 pr-10 py-2.5 appearance-none bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                >
                                    {uniqueDoctors.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="relative min-w-[130px]">
                                    <input 
                                        type="date"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        title="From Date"
                                    />
                                </div>
                                <span className="text-slate-400 font-medium">-</span>
                                <div className="relative min-w-[130px]">
                                    <input 
                                        type="date"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        title="To Date"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-2 border-slate-100">
                                    <th className="px-4 py-4 text-sm font-bold text-slate-500">Request Number</th>
                                    <th className="px-4 py-4 text-sm font-bold text-slate-500">Patient Name</th>
                                    <th className="px-4 py-4 text-sm font-bold text-slate-500">Requested Test</th>
                                    <th className="px-4 py-4 text-sm font-bold text-slate-500">Doctor Name</th>
                                    <th className="px-4 py-4 text-sm font-bold text-slate-500">Date & Time</th>
                                    <th className="px-4 py-4 text-sm font-bold text-slate-500">Status</th>
                                    <th className="px-4 py-4 text-sm font-bold text-slate-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
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
                                        const pDetails = req.patientFileNumber ?? req.fileNumber ?? "—";
                                        const tName = req.testName ?? req.labTest?.testNameEnglish ?? "—";
                                        const dName = (req.doctorName || req.doctor?.name) || "—";

                                        // Status rendering
                                        let StatusBadge = null;
                                        if (status === "Pending") {
                                            StatusBadge = <span className="inline-flex px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">Pending</span>;
                                        } else if (status === "Scheduled") {
                                            StatusBadge = <span className="inline-flex px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">Scheduled</span>;
                                        } else if (status === "In Progress") {
                                            StatusBadge = <span className="inline-flex px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">In Progress</span>;
                                        } else if (status === "Completed") {
                                            StatusBadge = <span className="inline-flex px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Completed</span>;
                                        } else {
                                            StatusBadge = <span className="inline-flex px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">{status}</span>;
                                        }

                                        const dateStr = req.createDate || req.createdAt || (req as any).requestDate || (req as any).date || (req as any).orderDate || (req as any).created || (req as any).recordDate;

                                        return (
                                            <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-4 py-5">
                                                    <span className="text-sm font-bold text-blue-600">#REQ-<br/>{req.requestNumber ?? req.id}</span>
                                                </td>
                                                <td className="px-4 py-5">
                                                    <div 
                                                        className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1 -m-1 rounded-lg transition-colors group"
                                                        onClick={() => navigate(`/dashboard/lab/visit/${req.visitId || req.id}`, { state: { from: '/dashboard/lab-test-request', label: 'LAB ORDERS' } })}
                                                    >
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{pName}</p>
                                                            <p className="text-[11px] font-medium text-slate-500 mt-0.5">{pDetails}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-5">
                                                    <p className="text-sm font-semibold text-slate-700">{tName}</p>
                                                </td>
                                                <td className="px-4 py-5">
                                                    <div className="text-sm text-slate-600 font-medium">
                                                        {dName.split(' ').map((word, i) => (
                                                            <React.Fragment key={i}>
                                                                {word}{' '}
                                                                {i === 0 && <br/>}
                                                            </React.Fragment>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-5">
                                                    <div className="text-sm text-slate-600 font-medium whitespace-pre-line leading-relaxed">
                                                        {formatDate(dateStr)}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-5">
                                                    {StatusBadge}
                                                </td>
                                                <td className="px-4 py-5">
                                                    <div className="flex items-center gap-3 text-slate-400">
                                                        <button 
                                                            onClick={() => navigate(`/dashboard/lab/result/${req.id}`, { state: { from: '/dashboard/lab-test-request', label: 'LAB ORDERS', orderData: req } })}
                                                            className="hover:text-blue-600 transition-colors"
                                                            title="View"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                        {status === "Completed" ? (
                                                            <button 
                                                                onClick={() => navigate(`/dashboard/lab/approve/${req.id}`, { state: { from: '/dashboard/lab-test-request', label: 'LAB ORDERS', orderData: req } })}
                                                                className="text-blue-500 hover:text-blue-700 transition-colors"
                                                                title="Approve"
                                                            >
                                                                <ClipboardCheck size={18} />
                                                            </button>
                                                        ) : (
                                                            <button 
                                                                onClick={() => navigate(`/dashboard/lab/edit/${req.id}`, { state: { from: '/dashboard/lab-test-request', label: 'LAB ORDERS', orderData: req } })}
                                                                className="text-slate-400 hover:text-slate-600 transition-colors"
                                                                title="Edit"
                                                            >
                                                                <ClipboardEdit size={18} />
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={() => exportLabPDF(req.id)}
                                                            className="hover:text-slate-600 transition-colors"
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
                        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <p className="text-sm font-semibold text-slate-500">
                                Showing {((safePage - 1) * PAGE_SIZE) + 1} to {Math.min(safePage * PAGE_SIZE, filteredList.length)} of {filteredList.length} results
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={safePage <= 1}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-30 border border-transparent hover:border-slate-200 transition-colors"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                                            p === safePage 
                                                ? "bg-[#0066CC] text-white" 
                                                : "hover:bg-slate-100 text-slate-600"
                                        }`}
                                    >
                                        {p}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={safePage >= totalPages}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-30 border border-transparent hover:border-slate-200 transition-colors"
                                >
                                    <ChevronRight size={16} />
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

export default LabOrdersPage;
