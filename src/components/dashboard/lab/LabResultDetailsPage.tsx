import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import TopBar from "../TopBar";
import {
  Printer,
  Download,
  ChevronRight,
  User,
  History,
  Activity,
  Send,
  Calendar,
  BarChart2,
  Clock,
  CheckCircle2
} from "lucide-react";

const LabResultDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC]">
      <TopBar
        title="DASHBOARD"
        onMenuClick={() => {}}
        showAddUser={false}
      />

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-[1600px] mx-auto space-y-6">
          
          {/* Header & Breadcrumbs */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                <span className="text-slate-800 cursor-pointer hover:underline" onClick={() => navigate('/dashboard')}>DASHBOARD</span>
                <ChevronRight size={14} />
                <span className="text-slate-800 cursor-pointer hover:underline" onClick={() => navigate(-1)}>
                  {location.state?.label || 'PATIENT VISITS'}
                </span>
                <ChevronRight size={14} />
                <span className="text-blue-600">LAB RESULT</span>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Lab Result Details</h2>
              <p className="text-slate-500 font-medium mt-1">View complete laboratory test result information</p>
            </div>
            
            {/* Header Actions */}
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 shadow-sm transition-colors cursor-pointer">
                <Printer size={16} />
                Print Result
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 shadow-sm transition-colors cursor-pointer">
                <Download size={16} />
                Download PDF
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 border border-transparent text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-sm transition-colors cursor-pointer">
                View Request Details
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            
            {/* Left Column (Patient & Info) */}
            <div className="xl:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 relative overflow-hidden">
                <span className="absolute top-6 right-6 bg-blue-100 text-blue-700 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  APPROVED
                </span>
                
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-200/50">
                    <User size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Emma Lawson</h3>
                    <p className="text-blue-600 text-sm font-bold mt-0.5">#PT-88291</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Request ID</p>
                    <p className="text-sm font-bold text-slate-800">#REQ-9421</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Visit ID</p>
                    <p className="text-sm font-bold text-slate-800">#VS-2023-0442</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Ordering Doctor</p>
                    <p className="text-sm font-bold text-slate-800">Dr. Sarah Chen</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Collection Date</p>
                    <p className="text-sm font-bold text-slate-800">Oct 24, 2023</p>
                  </div>
                  <div className="col-span-2 border-t border-slate-100 pt-6">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Test Name</p>
                    <p className="text-base font-bold text-slate-800">Comprehensive Metabolic Panel</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Category</p>
                    <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-1 rounded">Biochemistry</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Sample Type</p>
                    <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-1 rounded">Blood/Serum</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-6 uppercase tracking-wider">
                  <History size={16} className="text-slate-500" />
                  Audit Information
                </div>
                
                <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-[3px] before:w-0.5 before:bg-slate-200 ml-1">
                  <div className="relative pl-6">
                    <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-slate-300"></div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Analyzed By</p>
                    <p className="text-sm font-bold text-slate-800">Alex Rivers (Technician)</p>
                  </div>
                  <div className="relative pl-6">
                    <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-blue-500"></div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Approved By</p>
                    <p className="text-sm font-bold text-slate-800">Dr. Robert Vance</p>
                  </div>
                  <div className="relative pl-6">
                    <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-slate-300"></div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Created At</p>
                    <p className="text-sm font-bold text-slate-800">Oct 24, 2023 • 09:15 AM</p>
                  </div>
                  <div className="relative pl-6">
                    <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-slate-300"></div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Last Updated</p>
                    <p className="text-sm font-bold text-slate-800">Oct 25, 2023 • 11:42 AM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (Results) */}
            <div className="xl:col-span-8 space-y-6">
              
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="text-lg font-bold text-slate-800">Main Result Details</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-100">
                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">PARAMETER NAME</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">RESULT VALUE</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">UNIT</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">REF. RANGE</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr className="hover:bg-slate-50/50">
                        <td className="px-6 py-5 text-sm font-medium text-slate-700">Glucose, Serum</td>
                        <td className="px-6 py-5 text-sm font-black text-red-600">115</td>
                        <td className="px-6 py-5 text-sm font-medium text-slate-500">mg/dL</td>
                        <td className="px-6 py-5 text-sm font-medium text-slate-500">65 - 99</td>
                        <td className="px-6 py-5">
                          <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full">High</span>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="px-6 py-5 text-sm font-medium text-slate-700">Creatinine, Serum</td>
                        <td className="px-6 py-5 text-sm font-black text-slate-800">0.92</td>
                        <td className="px-6 py-5 text-sm font-medium text-slate-500">mg/dL</td>
                        <td className="px-6 py-5 text-sm font-medium text-slate-500">0.57 - 1.00</td>
                        <td className="px-6 py-5">
                          <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-full">Normal</span>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="px-6 py-5 text-sm font-medium text-slate-700">Sodium, Serum</td>
                        <td className="px-6 py-5 text-sm font-black text-slate-800">140</td>
                        <td className="px-6 py-5 text-sm font-medium text-slate-500">mmol/L</td>
                        <td className="px-6 py-5 text-sm font-medium text-slate-500">134 - 144</td>
                        <td className="px-6 py-5">
                          <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-full">Normal</span>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="px-6 py-5 text-sm font-medium text-slate-700">Potassium, Serum</td>
                        <td className="px-6 py-5 text-sm font-black text-red-700">6.2</td>
                        <td className="px-6 py-5 text-sm font-medium text-slate-500">mmol/L</td>
                        <td className="px-6 py-5 text-sm font-medium text-slate-500">3.5 - 5.2</td>
                        <td className="px-6 py-5">
                          <span className="bg-[#991b1b] text-white text-xs font-bold px-2.5 py-1 rounded-full">Critical</span>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="px-6 py-5 text-sm font-medium text-slate-700">Albumin, Serum</td>
                        <td className="px-6 py-5 text-sm font-black text-slate-800">4.4</td>
                        <td className="px-6 py-5 text-sm font-medium text-slate-500">g/dL</td>
                        <td className="px-6 py-5 text-sm font-medium text-slate-500">3.5 - 5.5</td>
                        <td className="px-6 py-5">
                          <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-full">Normal</span>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="px-6 py-5 text-sm font-medium text-slate-700">Bilirubin, Total</td>
                        <td className="px-6 py-5 text-sm font-black text-red-600">1.5</td>
                        <td className="px-6 py-5 text-sm font-medium text-slate-500">mg/dL</td>
                        <td className="px-6 py-5 text-sm font-medium text-slate-500">0.0 - 1.2</td>
                        <td className="px-6 py-5">
                          <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full">High</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Activity size={18} className="text-blue-600" />
                  <h3 className="text-lg font-bold text-slate-800">Technician Notes & Clinical Analysis</h3>
                </div>
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                  <p className="text-sm font-medium text-slate-700 leading-relaxed mb-4">
                    Patient presents with elevated potassium and glucose levels. The potassium level of 6.2 mmol/L is within the critical range and has been flagged for immediate physician review. All internal controls and calibrations for the biochemistry analyzer were within acceptable limits at the time of testing.
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-1.5"><Clock size={14} /> Analyzed on Oct 25, 2023 - 09:12 AM</span>
                    <span className="flex items-center gap-1.5"><CheckCircle2 size={14} /> Verified by Automated System QC</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Vitals Trend */}
                <div className="bg-[#0A58CA] text-white rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between shadow-md min-h-[220px]">
                  <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-wider text-blue-200 mb-2">VITALS TREND</p>
                    <h3 className="text-2xl font-bold leading-tight mb-8 max-w-[200px]">Potassium Critical Spike</h3>
                  </div>
                  
                  {/* Mock Chart */}
                  <div className="flex items-end gap-1.5 h-12 relative z-10 opacity-90 mb-4">
                    <div className="w-12 h-[30%] bg-white/20 rounded-t-sm"></div>
                    <div className="w-12 h-[35%] bg-white/20 rounded-t-sm"></div>
                    <div className="w-12 h-[30%] bg-white/20 rounded-t-sm"></div>
                    <div className="w-12 h-[45%] bg-white/20 rounded-t-sm"></div>
                    <div className="w-12 h-[40%] bg-white/20 rounded-t-sm"></div>
                    <div className="w-12 h-full bg-white rounded-t-sm"></div>
                  </div>

                  <p className="text-xs font-medium text-blue-100 relative z-10">
                    Significant increase compared to last visit (4.1 mmol/L on Sep 12)
                  </p>
                  
                  {/* Decorative */}
                  <BarChart2 size={120} className="absolute -bottom-8 -right-8 text-white/5 pointer-events-none" />
                </div>

                {/* Quick Actions */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-4">QUICK ACTIONS</p>
                  <div className="space-y-3 flex-1 flex flex-col justify-center">
                    <button className="flex items-center justify-between w-full p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all group cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Send size={18} className="text-blue-600" />
                        <span className="text-sm font-bold text-slate-800 group-hover:text-blue-700">Forward to Specialist</span>
                      </div>
                      <ChevronRight size={18} className="text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-1" />
                    </button>
                    <button className="flex items-center justify-between w-full p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all group cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Calendar size={18} className="text-blue-600" />
                        <span className="text-sm font-bold text-slate-800 group-hover:text-blue-700">Schedule Re-test</span>
                      </div>
                      <ChevronRight size={18} className="text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LabResultDetailsPage;
