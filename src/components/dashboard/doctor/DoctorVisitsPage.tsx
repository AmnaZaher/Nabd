import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { visitApi } from '../../../api/visit';
import { Search, ChevronDown, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import TopBar from '../TopBar';

interface DoctorVisitsPageProps {
    onMenuClick?: () => void;
    onProfileClick?: () => void;
}

const DoctorVisitsPage: React.FC<DoctorVisitsPageProps> = ({ onMenuClick, onProfileClick }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);

    const [activeTab, setActiveTab] = useState<'open' | 'closed'>('open');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('Time');
    const [currentPage, setCurrentPage] = useState(1);

    const [visits, setVisits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);

    const pageSize = 10;

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user?.id) return;
            try {
                const { profileApi } = await import('../../../api/profile');
                const data = await profileApi.getDoctorProfile(user.id);
                if (data) setProfile(data);
            } catch (error) {
                console.error('Failed to fetch doctor profile:', error);
            }
        };
        fetchProfile();
    }, [user?.id]);

    const fetchVisits = async () => {
        setLoading(true);
        try {


            const res = await visitApi.listVisits({
                DoctorId: profile?.id,

                PageIndex: currentPage,
                PageSize: pageSize,
                Search: searchQuery // Assuming backend handles this or we can drop it if it doesn't, but let's pass it
            });

            const list = (res?.data as any)?.items || (res?.data as any)?.data || (Array.isArray(res?.data) ? res.data : []) || [];

            // Client side filter (if backend doesn't filter Open correctly)
            const filteredList = list.filter((v: any) =>
                activeTab === 'open'
                    ? v.visitStatus?.toLowerCase() === 'open'
                    : v.visitStatus?.toLowerCase() === 'closed'
            );
            // Client side pagination
            setTotalItems(filteredList.length);
            const paginated = filteredList.slice((currentPage - 1) * pageSize, currentPage * pageSize);

            setVisits(paginated);
        } catch (error) {
            console.error("Failed to fetch visits:", error);

        }
        finally{
            setLoading(false);
        };
    };

    useEffect(() => {
        if (profile?.id) fetchVisits();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profile?.id, activeTab, currentPage]);

    // Handle search debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (profile?.id) fetchVisits();
        }, 500);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

    const totalPages = Math.ceil(totalItems / pageSize) || 1;

    const getTypeDetails = (typeStr: string | number) => {
        const type = String(typeStr).toLowerCase();
        if (type.includes('follow') || type === '2') return { label: 'Follow-up', color: 'text-[#8b5cf6] bg-[#f5f3ff]' };
        if (type.includes('exam') || type === '1') return { label: 'Examination', color: 'text-blue-600 bg-blue-50' };
        return { label: 'Consultation', color: 'text-slate-600 bg-slate-100' };
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-[#f8fafc]">
            <TopBar
                title="VISITS"
                onMenuClick={onMenuClick || (() => { })}
                onProfileClick={onProfileClick}
                showAddUser={false}
                isNurse={false}
            />

            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-[1400px] mx-auto space-y-8">

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Today's Visits</h2>
                            <p className="text-slate-500 font-medium text-lg">Manage your daily patient visits</p>
                        </div>

                        {/* Tabs */}
                        <div className="bg-slate-100/80 backdrop-blur p-1.5 rounded-2xl inline-flex shadow-inner">
                            <button
                                onClick={() => { setActiveTab('open'); setCurrentPage(1); }}
                                className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'open'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Open Visits
                            </button>
                            <button
                                onClick={() => { setActiveTab('closed'); setCurrentPage(1); }}
                                className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'closed'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Closed Visits
                            </button>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search patient by name or ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 ring-blue-50 transition-all font-medium text-slate-700 shadow-sm placeholder:text-slate-400"
                            />
                        </div>
                        <div className="relative w-full sm:w-[200px] shrink-0">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full pl-4 pr-10 py-4 bg-white border border-slate-100 rounded-2xl appearance-none outline-none focus:ring-4 ring-slate-50 transition-all font-bold text-slate-600 shadow-sm cursor-pointer"
                            >
                                <option value="Time">Sort by: Time</option>
                                <option value="Name">Sort by: Name</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                        </div>
                    </div>

                    {/* Table Container */}
                    <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden flex flex-col">
                        <div className="overflow-x-auto min-h-[400px] relative">
                            {loading ? (
                                <div className="absolute inset-0 flex justify-center items-center z-10 bg-white/50">
                                    <Loader2 className="animate-spin text-blue-600" size={32} />
                                </div>
                            ) : null}
                            <table className="w-full text-left border-collapse min-w-[900px]">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="py-5 pl-8 text-xs font-black text-slate-500 uppercase tracking-widest">Patient Name</th>
                                        <th className="py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Visit Type</th>
                                        <th className="py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Appointment Time</th>
                                        <th className="py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Chief Complaint</th>
                                        <th className="py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
                                        <th className="py-5 pr-8 text-right text-xs font-black text-slate-500 uppercase tracking-widest">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visits.map((visit, i) => {
                                        const initials = (visit.patientName || 'P N').split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
                                        const typeObj = getTypeDetails(visit.visitType || '');
                                        const timeString = new Date(visit.visitDate || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                        const fileNum = visit.patientFileNumber || visit.visitNumber || 'N/A';

                                        return (
                                            <tr key={visit.id || i} className="group border-b border-slate-50 hover:bg-slate-50/80 transition-all">
                                                <td className="py-6 pl-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm shrink-0">
                                                            {initials}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-800 text-[15px]">{visit.patientName}</div>
                                                            <div className="text-slate-400 text-sm font-medium mt-0.5">ID: {fileNum}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-6">
                                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${typeObj.color}`}>
                                                        {typeObj.label}
                                                    </span>
                                                </td>
                                                <td className="py-6">
                                                    <div className="flex items-center gap-2 text-slate-600 font-medium">
                                                        <div className="w-5 h-5 rounded-full border border-slate-200 flex justify-center items-center">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                                        </div>
                                                        {timeString}
                                                    </div>
                                                </td>
                                                <td className="py-6">
                                                    <span className="text-slate-500 font-medium">
                                                        {visit.chiefComplaint || visit.notes || 'No notes provided'}
                                                    </span>
                                                </td>
                                                <td className="py-6">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-2 h-2 rounded-full ${visit.visitStatus?.toLowerCase() === 'open' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-slate-400'}`}></span>
                                                        <span className="font-bold text-slate-700 text-xs tracking-wider">
                                                            {visit.visitStatus?.toUpperCase() || 'UNKNOWN'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-6 pr-8 text-right">
                                                    <button
                                                        onClick={() => navigate(
                                                            visit.visitStatus?.toLowerCase() === 'open'
                                                                ? `/dashboard/patient-visit?appointmentId=${visit.visitId}`
                                                                : `/dashboard/visit-details?appointmentId=${visit.visitId}`
                                                        )}
                                                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${visit.visitStatus?.toLowerCase() === 'open'
                                                            ? 'bg-[#0f62fe] text-white hover:bg-blue-700 shadow-md shadow-blue-600/20'
                                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                            }`}
                                                    >
                                                        {visit.visitStatus?.toLowerCase() === 'open' ? 'Start Visit' : 'View Details'}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {!loading && visits.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-16 text-center text-slate-500 font-medium text-lg">
                                                No {activeTab} visits found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-8 py-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <span className="text-slate-500 font-medium text-sm">
                                Showing {visits.length} of {totalItems} scheduled visits
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${currentPage === page
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'text-slate-500 hover:bg-slate-100'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default DoctorVisitsPage;
