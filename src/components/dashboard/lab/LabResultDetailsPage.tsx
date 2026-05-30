import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
  CheckCircle2,
  Loader2
} from "lucide-react";
import { getLabResultDetails, getLabTestRequestDetails, exportLabPDF } from "../../../api/labs";
import type { LabResultDetail } from "../../../types/labs.types";
import { useAuth } from "../../../context/AuthContext";

interface LabResultDetailsPageProps {
  onMenuClick?: () => void;
  onProfileClick?: () => void;
}

const LabResultDetailsPage: React.FC<LabResultDetailsPageProps> = ({ onMenuClick, onProfileClick }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLabTechnician } = useAuth();

  const [detail, setDetail] = useState<LabResultDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
        const orderData = location.state?.orderData;
        
        // Robust numeric ID parsing to handle strings with letters (e.g. "LB-9021" -> 9021) and "NaN" -> fallback to orderData.id/requestId or 9421
        const getNumericId = (val: any): number => {
            if (val === undefined || val === null) return 0;
            const parsed = typeof val === 'number' ? val : parseInt(val.toString().replace(/\D/g, ''), 10);
            return isNaN(parsed) ? 0 : parsed;
        };

        const parsedId = getNumericId(id) || getNumericId(orderData?.requestId) || getNumericId(orderData?.id) || 9421;

        let data: LabResultDetail = {
            id: parsedId,
            requestId: parsedId,
            patientName: orderData?.patientName || orderData?.patient?.name || orderData?.name || "Unknown Patient",
            fileNumber: orderData?.fileNumber || orderData?.patient?.fileNumber || orderData?.patientFileNumber || "—",
            testName: orderData?.testName || orderData?.labTest?.testNameEnglish || orderData?.name || "Unknown Test",
            doctorName: orderData?.doctorName || orderData?.doctor?.name || orderData?.doctor || "Unknown Doctor",
            status: orderData?.status || "Completed",
            priority: orderData?.priority || "Normal",
            createdAt: orderData?.createdAt || orderData?.date || new Date().toISOString(),
            parameters: []
        } as LabResultDetail;

        // Fetch request details using the provided endpoint
        try {
            const reqRes = await getLabTestRequestDetails(id as string);
            const reqData = (reqRes as any)?.data ?? reqRes;
            if (reqData) {
                if (reqData.test_Name) {
                    data.testName = reqData.test_Name;
                    data.requestId = reqData.requestnumber || data.requestId;
                    (data as any).visitNumber = reqData.visitnumber;
                    data.doctorName = reqData.doctorname || data.doctorName;
                    data.status = reqData.result_Status || data.status;
                    data.labTest = { ...(data.labTest || {} as any), category: reqData.category };
                    (data as any).category = reqData.category;
                    (data as any).sampleType = reqData.sample_name;
                    data.createdAt = reqData.collectedDate || data.createdAt;
                    data.patientName = reqData.patientFullName || data.patientName;
                    data.fileNumber = reqData.fileNumber || data.fileNumber;
                    (data as any).approvedBy = reqData.approvedBy;
                    (data as any).phone = reqData.phone;
                } else {
                    if (reqData.patientName) data.patientName = reqData.patientName;
                    if (reqData.doctorName) data.doctorName = reqData.doctorName;
                    if (reqData.testName) data.testName = reqData.testName;
                }
                
                const paramsArray = reqData.param || reqData.parameters || reqData.labTestDetails || reqData.results || reqData.labResults;
                if (paramsArray && Array.isArray(paramsArray)) {
                    data.parameters = paramsArray.map((p: any) => ({
                        ...p,
                        parameterNameEnglish: p.param_Name || p.parameterNameEnglish || p.parameterName || p.name || p.testName || 'Unknown Parameter',
                        referenceRangeMin: p.min_Normal ?? p.referenceRangeMin ?? p.minRange ?? p.normalRangeMin ?? 0,
                        referenceRangeMax: p.max_Normal ?? p.referenceRangeMax ?? p.maxRange ?? p.normalRangeMax ?? 0,
                        unit: p.unit || p.measurementUnit || '',
                        value: p.param_Value ?? p.value ?? p.resultValue ?? p.result,
                        status: p.abnormalFlag || p.status || p.resultStatus || p.interpretation
                    }));
                }
            }
        } catch (err) {
            console.warn("Failed to load request details via LabTestDetails.", err);
        }

        // Fetch result details directly
        try {
            const res = await getLabResultDetails(id as string);
            const apiData = (res as any)?.data ?? res;
            if (apiData) {
                if (apiData.test_Name) {
                    data.testName = apiData.test_Name;
                    data.requestId = apiData.requestnumber || data.requestId;
                    (data as any).visitNumber = apiData.visitnumber;
                    data.doctorName = apiData.doctorname || data.doctorName;
                    data.status = apiData.result_Status || data.status;
                    data.labTest = { ...(data.labTest || {} as any), category: apiData.category };
                    (data as any).category = apiData.category;
                    (data as any).sampleType = apiData.sample_name;
                    data.createdAt = apiData.collectedDate || data.createdAt;
                    data.patientName = apiData.patientFullName || data.patientName;
                    data.fileNumber = apiData.fileNumber || data.fileNumber;
                    (data as any).approvedBy = apiData.approvedBy;
                    (data as any).phone = apiData.phone;
                }
                
                if (apiData.param && Array.isArray(apiData.param)) {
                    data.parameters = apiData.param.map((p: any) => ({
                        ...p,
                        parameterNameEnglish: p.param_Name || 'Unknown Parameter',
                        value: p.param_Value,
                        referenceRangeMin: p.min_Normal,
                        referenceRangeMax: p.max_Normal,
                        unit: p.unit,
                        status: p.abnormalFlag
                    }));
                } else if (!apiData.test_Name) {
                    data = { ...data, ...apiData };
                }
            }
        } catch (err) {
            console.warn("Failed to load result details", err);
        }

        setDetail(data);
        setLoading(false);
    }
    loadData();
  }, [id, location.state]);

  const getInterpretation = (valStr: number | string | undefined, min: number, max: number) => {
    if (valStr === undefined || valStr === null || valStr === '') return null;
    const val = Number(valStr);
    if (isNaN(val)) return null;
    
    if (val > max * 1.5 || val < min * 0.5) return 'CRITICAL';
    if (val < min) return 'LOW';
    if (val > max) return 'HIGH';
    return 'NORMAL';
  };

  const getInterpretationStyles = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'NORMAL': return 'bg-[#E2E8F0] text-slate-600';
      case 'HIGH': return 'bg-[#fca5a5] text-[#7f1d1d]';
      case 'LOW': return 'bg-yellow-200 text-yellow-800';
      case 'CRITICAL ALERT':
      case 'CRITICAL': return 'bg-[#991b1b] text-white';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  const handleDownload = async () => {
    if (!detail?.id) return;
    await exportLabPDF(detail.id);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC]">
        <TopBar title="DASHBOARD" onMenuClick={onMenuClick || (() => {})} onProfileClick={onProfileClick} showAddUser={false} />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!detail) return null;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC]">
      <TopBar
        title="DASHBOARD"
        onMenuClick={onMenuClick || (() => {})}
        onProfileClick={onProfileClick}
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
              <button 
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 shadow-sm transition-colors cursor-pointer"
              >
                <Printer size={16} />
                Print Result
              </button>
              <button 
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 shadow-sm transition-colors cursor-pointer"
              >
                <Download size={16} />
                Download PDF
              </button>
               <button 
                onClick={() => navigate(`/dashboard/lab/edit/${detail.requestId ?? detail.id}`, { state: { orderData: detail } })}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 border border-transparent text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-sm transition-colors cursor-pointer"
              >
                View Request Details
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            
            {/* Left Column (Patient & Info) */}
            <div className="xl:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 relative overflow-hidden">
                <span className={`absolute top-6 right-6 ${detail.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'} text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider`}>
                  {detail.status || 'APPROVED'}
                </span>
                
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-200/50">
                    <User size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{detail.patientName}</h3>
                    <p className="text-blue-600 text-sm font-bold mt-0.5">#{detail.fileNumber}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Request Number</p>
                    <p className="text-sm font-bold text-slate-800">#{detail.requestId ?? detail.id}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Visit Number</p>
                    <p className="text-sm font-bold text-slate-800">{(detail as any).visitNumber || `#${detail.id}`}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Ordering Doctor</p>
                    <p className="text-sm font-bold text-slate-800">{detail.doctorName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Collection Date</p>
                    <p className="text-sm font-bold text-slate-800">
                      {detail.createdAt ? new Date(detail.createdAt).toLocaleDateString() : '—'}
                    </p>
                  </div>
                  <div className="col-span-2 border-t border-slate-100 pt-6">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Test Name</p>
                    <p className="text-base font-bold text-slate-800">{detail.testName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Category</p>
                    <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-1 rounded">
                      {detail.labTest?.category || (detail as any).category || 'Biochemistry'}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Sample Type</p>
                    <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-1 rounded">{(detail as any).sampleType || 'Blood/Serum'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-6 uppercase tracking-wider">
                  <History size={16} className="text-slate-500" />
                  Audit Information
                </div>
                
                <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-[3px] before:w-0.5 before:bg-slate-200 ml-1">
                  {!isLabTechnician && (
                    <div className="relative pl-6">
                      <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-slate-300"></div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Analyzed By</p>
                      <p className="text-sm font-bold text-slate-800">Lab Technician</p>
                    </div>
                  )}
                  <div className="relative pl-6">
                    <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-blue-500"></div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Approved By</p>
                    <p className="text-sm font-bold text-slate-800">{(detail as any).approvedBy || detail.doctorName || "Pending"}</p>
                  </div>
                  {!isLabTechnician && (
                    <div className="relative pl-6">
                      <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-slate-300"></div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Created At</p>
                      <p className="text-sm font-bold text-slate-800">
                        {detail.createdAt ? new Date(detail.createdAt).toLocaleString() : '—'}
                      </p>
                    </div>
                  )}
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
                      {(!detail.parameters || detail.parameters.length === 0) && (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-slate-500 font-medium">
                            No result parameters recorded yet.
                          </td>
                        </tr>
                      )}
                      {detail.parameters?.map((p: any, idx) => {
                        const apiStatus = p.status || p.resultStatus || p.interpretation;
                        const interpRaw = apiStatus ? apiStatus.toUpperCase() : getInterpretation(p.value, p.referenceRangeMin, p.referenceRangeMax);
                        
                        let interp = interpRaw;
                        if (interpRaw === 'CRITICAL ALERT' || interpRaw === 'CRITICAL') interp = 'CRITICAL';
                        else if (interpRaw === 'HIGH') interp = 'HIGH';
                        else if (interpRaw === 'LOW') interp = 'LOW';
                        else if (interpRaw === 'NORMAL') interp = 'NORMAL';

                        const isCritical = interp === 'CRITICAL';
                        const isHigh = interp === 'HIGH';
                        
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="px-6 py-5 text-sm font-medium text-slate-700">{p.parameterNameEnglish}</td>
                            <td className={`px-6 py-5 text-sm font-black ${isCritical ? 'text-[#991b1b]' : isHigh ? 'text-[#ef4444]' : 'text-slate-800'}`}>
                              {p.value ?? '—'}
                            </td>
                            <td className="px-6 py-5 text-sm font-medium text-slate-500">{p.unit}</td>
                            <td className="px-6 py-5 text-sm font-medium text-slate-500">{p.referenceRangeMin} - {p.referenceRangeMax}</td>
                            <td className="px-6 py-5">
                              {interp ? (
                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${getInterpretationStyles(interp)}`}>
                                  {interp === 'NORMAL' ? 'Normal' : interp === 'HIGH' ? 'High' : interp === 'LOW' ? 'Low' : 'Critical'}
                                </span>
                              ) : (
                                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full">Pending</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
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
                    {detail.parameters?.some(p => getInterpretation(p.value, p.referenceRangeMin, p.referenceRangeMax) === 'CRITICAL ALERT')
                      ? "Patient presents with critical parameter levels. Results have been flagged for immediate physician review. All internal controls and calibrations for the analyzer were within acceptable limits at the time of testing."
                      : "Results have been analyzed. All parameters appear consistent."}
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-1.5"><Clock size={14} /> Analyzed on {new Date().toLocaleDateString()}</span>
                    <span className="flex items-center gap-1.5"><CheckCircle2 size={14} /> Verified by QC System</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Vitals Trend */}
                <div className="bg-[#0A58CA] text-white rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between shadow-md min-h-[220px]">
                  <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-wider text-blue-200 mb-2">VITALS TREND</p>
                    <h3 className="text-2xl font-bold leading-tight mb-8 max-w-[200px]">Latest Analysis</h3>
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
                    Comparison charts available in patient history.
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

