import { ArrowLeft, Edit3, FileText, Info, FlaskConical, Thermometer, List, AlertCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const TestDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // استقبال الكود من الـ URL (مثل CBC-001)

    return (
        <div className="h-full overflow-y-auto bg-slate-50/30">
            <div className="p-4 md:p-8 space-y-6 w-full max-w-full mx-auto animate-in fade-in duration-500">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => navigate(-1)}
                                className="flex items-center gap-2 text-blue-600 font-bold text-sm hover:gap-3 transition-all"
                            >
                                <ArrowLeft size={18} /> Back to List
                            </button>
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                {id || 'TEST-CODE'}
                            </span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                            Comprehensive Metabolic Panel
                        </h1>
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                Active Catalog
                            </div>
                            <div className="flex items-center gap-4 ml-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                                <span className="flex items-center gap-1.5"><FlaskConical size={14}/> Biochemistry</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => navigate(`/dashboard/lab-catalog/edit/${id}`)}
                            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
                        >
                            <Edit3 size={18} /> Edit Test
                        </button>
                        <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 shadow-sm">
                            <FileText size={18} /> Export PDF
                        </button>
                    </div>
                </div>

                {/* Info Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative">
                        <h3 className="text-lg font-black text-slate-800 mb-6 border-b border-slate-50 pb-4">General Info</h3>
                        <div className="space-y-6">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Methodology</p>
                                <p className="text-sm font-bold text-slate-600">Spectrophotometry, Ion-selective electrode</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Primary Equipment</p>
                                <p className="text-sm font-black text-blue-600">Roche Cobas 8000 Analyzer</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative">
                        <h3 className="text-lg font-black text-slate-800 mb-6 border-b border-slate-50 pb-4">Sample Protocol</h3>
                        <div className="space-y-6">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sample Type</p>
                                <p className="text-sm font-black text-slate-700">Serum (Red Top / SST)</p>
                            </div>
                            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center">🍱</div>
                                <div>
                                    <p className="text-[10px] font-black text-blue-400 uppercase">Requirement</p>
                                    <p className="text-sm font-black text-blue-700">8-12 Hours Fasting</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative">
                        <h3 className="text-lg font-black text-slate-800 mb-6 border-b border-slate-50 pb-4">Stability Info</h3>
                        <div className="space-y-4">
                            {[
                                { label: 'Room Temp (20-25°C)', value: '8 Hours' },
                                { label: 'Refrigerated (2-8°C)', value: '48 Hours' },
                                { label: 'Frozen (-20°C)', value: '1 Year' },
                            ].map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <span className="text-[11px] font-bold text-slate-500">{item.label}</span>
                                    <span className="text-sm font-black text-slate-800">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Parameters Table */}
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-8 flex justify-between items-center border-b border-slate-50">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                                <List size={18} />
                            </div>
                            <h3 className="text-xl font-black text-slate-800">Test Parameters</h3>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">Parameter</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase text-center">Unit</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase text-center">Ref. Range</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase text-right">Critical</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {[
                                    { name: 'Glucose, Serum', code: 'GLU-70', unit: 'mg/dL', range: '65 - 99', critical: '< 40 or > 400' },
                                    { name: 'Creatinine, Serum', code: 'CREA-12', unit: 'mg/dL', range: '0.70 - 1.30', critical: '> 4.0' },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="text-sm font-black text-slate-700">{row.name}</div>
                                            <div className="text-[10px] font-bold text-slate-300">{row.code}</div>
                                        </td>
                                        <td className="px-8 py-5 text-sm font-bold text-slate-400 text-center">{row.unit}</td>
                                        <td className="px-8 py-5 text-center text-xs font-black text-slate-600">{row.range}</td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="inline-flex items-center gap-1.5 text-red-500 font-black text-xs px-3 py-1 bg-red-50 rounded-lg border border-red-100">
                                                <AlertCircle size={14} /> {row.critical}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestDetails;