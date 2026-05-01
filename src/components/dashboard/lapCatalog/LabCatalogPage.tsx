import { useState, useEffect } from "react";
import {
  Edit2,
  Trash2,
  Plus,
  Download,
  ChevronLeft,
  ChevronRight,
  Search,
  RefreshCcw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getLabCatalog } from "../../../api/labs";
import type { LabTest } from "../../../types/labs.types";

const LabCatalogPage = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState<LabTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCatalog = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getLabCatalog();
      setTests(response.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load catalog");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const filteredTests = tests.filter(test => 
    test.testNameEnglish.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.testNameArabic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.testCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Lab Tests Catalog
          </h1>
          <p className="text-slate-500">
            Manage and update the comprehensive directory of available clinical
            laboratory tests.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm font-medium">
            <Download size={18} />
            Export Catalog
          </button>
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200 font-bold" 
            onClick={() => navigate("/dashboard/lab-catalog/add")}
          >
            <Plus size={20} />
            Add Test
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10"
          />
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchCatalog}
            className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
            title="Refresh Catalog"
          >
            <RefreshCcw size={20} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchCatalog} className="underline hover:no-underline">Retry</button>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Test Code</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Test Name (EN/AR)</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Sample Type</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Fasting</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-sm font-bold text-slate-400">Loading catalog...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredTests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center text-slate-400 font-bold">
                    No tests found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredTests.map((test) => (
                  <tr
                    key={test.id}
                    onClick={() => navigate(`/dashboard/lab-catalog/details/${test.id}`)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-bold tracking-wider">
                        {test.testCode}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {test.testNameEnglish}
                      </div>
                      <div className="text-xs text-slate-400 font-medium">
                        {test.testNameArabic}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-600">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        {test.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">
                      {test.sampleType}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-700 text-center">
                      {test.fasting_required ? "Yes" : "No"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${test.fasting_required ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-300'}`}>
                        <Plus size={14} className="rotate-45" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold tracking-widest bg-blue-50 text-blue-600`}>
                        ACTIVE
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/lab-catalog/edit/${test.id}`); }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); console.log('Delete', test.id); }}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-sm text-slate-500 font-medium">Showing 5 of 124 tests</span>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:bg-white rounded-lg border border-transparent hover:border-slate-200">
              <ChevronLeft size={18} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-lg text-sm font-bold">1</button>
            <button className="p-2 text-slate-400 hover:bg-white rounded-lg border border-transparent hover:border-slate-200">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Info Card & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-blue-50 p-6 rounded-3xl border border-blue-100 relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-blue-900 font-bold text-lg mb-1">Recent Catalog Updates</h3>
            <p className="text-blue-600/80 text-sm mb-4">4 new specialized tests were added to the Immunology category this week.</p>
            <button className="text-blue-700 font-bold text-sm hover:underline">Review Additions</button>
          </div>
          <div className="absolute right-[-20px] bottom-[-20px] text-blue-100/50 group-hover:scale-110 transition-transform duration-700">
            <svg width="160" height="160" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 2v8h8c0-4.42-3.58-8-8-8zM11 2c-4.42 0-8 3.58-8 8v12h12c4.42 0 8-3.58 8-8v-2h-8v-8h-4z" />
            </svg>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="text-3xl font-black text-slate-900 mt-4">2,412</div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Tests Performed (MTD)</div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-blue-600 h-full w-[70%]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabCatalogPage;