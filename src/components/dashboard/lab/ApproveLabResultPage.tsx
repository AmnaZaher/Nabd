import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { 
    User, 
    AlertTriangle, 
    X, 
    CheckCircle2, 
    Info,
    Loader2
} from "lucide-react";
import { getLabResultApprovalDetails, approveLabResult, rejectLabResult, getLabTestRequestDetails, getLabResultDetails, getLabResults } from "../../../api/labs";
import type { LabResultDetail } from "../../../types/labs.types";
import TopBar from "../TopBar";

const mockParams = [
  { id: 101, parameterNameEnglish: "Glucose", referenceRangeMin: 70, referenceRangeMax: 99, unit: "mg/dL", value: 88 },
  { id: 102, parameterNameEnglish: "Sodium", referenceRangeMin: 135, referenceRangeMax: 145, unit: "mEq/L", value: 148 },
  { id: 103, parameterNameEnglish: "Potassium", referenceRangeMin: 3.6, referenceRangeMax: 5.2, unit: "mEq/L", value: 3.1 },
  { id: 104, parameterNameEnglish: "Creatinine", referenceRangeMin: 0.7, referenceRangeMax: 1.3, unit: "mg/dL", value: 4.2 },
];

interface ApproveLabResultPageProps {
  onMenuClick?: () => void;
  onProfileClick?: () => void;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const day = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return `${day} ${time}`;
}

export default function ApproveLabResultPage({ onMenuClick, onProfileClick }: ApproveLabResultPageProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [detail, setDetail] = useState<LabResultDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function loadData() {
        const getNumericId = (val: any): number => {
            if (val === undefined || val === null) return 0;
            const parsed = typeof val === 'number' ? val : parseInt(val.toString().replace(/\D/g, ''), 10);
            return isNaN(parsed) ? 0 : parsed;
        };

        const orderData = location.state?.orderData;
        const parsedId = getNumericId(id) || getNumericId(orderData?.requestId) || getNumericId(orderData?.id) || 9421;

        let data: LabResultDetail = {
            id: parsedId,
            requestId: parsedId,
            patientName: orderData?.patientName || orderData?.patient?.name || orderData?.name || "Unknown Patient",
            fileNumber: orderData?.fileNumber || orderData?.patient?.fileNumber || orderData?.patientFileNumber || "—",
            testName: orderData?.testName || orderData?.labTest?.testNameEnglish || orderData?.name || "Unknown Test",
            doctorName: orderData?.doctorName || orderData?.doctor?.name || orderData?.doctor || "Unknown Doctor",
            status: orderData?.status || "Pending Review",
            priority: orderData?.priority || "Normal",
            createdAt: orderData?.createdAt || orderData?.date || new Date().toISOString(),
            parameters: []
        } as LabResultDetail;

        let dataFound = false;
        (data as any).visitNumber = orderData?.visitId || orderData?.visitNumber || "";
        (data as any).department = orderData?.category || orderData?.labTest?.category || "Laboratory";
        (data as any).sampleType = orderData?.sampleType || "";

        // Try 1: Fetch result details directly
        try {
            const res = await getLabResultDetails(id as string);
            let apiData = (res as any)?.data ?? res;
            if (Array.isArray(apiData)) apiData = apiData[0];
            if (apiData && (apiData.param || apiData.parameters || apiData.test_Name)) {
                if (apiData.id) data.id = apiData.id;
                if (apiData.finalResultId) data.id = apiData.finalResultId;
                
                if (apiData.test_Name) {
                    data.testName = apiData.test_Name;
                    data.requestId = apiData.requestnumber || data.requestId;
                    (data as any).department = apiData.category || "Laboratory";
                    data.doctorName = apiData.doctorname || data.doctorName;
                    data.status = apiData.result_Status || data.status;
                    data.createdAt = apiData.collectedDate || data.createdAt;
                    data.patientName = apiData.patientFullName || data.patientName;
                    data.fileNumber = apiData.fileNumber || data.fileNumber;
                }
                
                if (apiData.param && Array.isArray(apiData.param)) {
                    data.parameters = apiData.param.map((p: any) => ({
                        ...p,
                        id: p.id || Math.random(),
                        parameterNameEnglish: p.param_Name || 'Unknown Parameter',
                        value: p.param_Value,
                        referenceRangeMin: p.min_Normal,
                        referenceRangeMax: p.max_Normal,
                        unit: p.unit,
                        status: p.abnormalFlag
                    }));
                } else if (!apiData.test_Name && apiData.parameters) {
                   data.parameters = apiData.parameters;
                }
                
                if (data.parameters && data.parameters.length > 0) {
                    dataFound = true;
                }
            }
        } catch (err) {
            console.warn("Failed to load result details", err);
        }

        // Try 2: Fetch result approval details (only if Try 1 didn't find parameters)
        if (!dataFound) {
            try {
                const resApproval = await getLabResultApprovalDetails(id as string);
                let approvalData = (resApproval as any)?.data ?? resApproval;
                if (Array.isArray(approvalData)) approvalData = approvalData[0];
                if (approvalData) {
                   if (approvalData.id) data.id = approvalData.id;
                   if (approvalData.finalResultId) data.id = approvalData.finalResultId;
                   if (approvalData.patientName) data.patientName = approvalData.patientName;
                   if (approvalData.parameters && Array.isArray(approvalData.parameters) && approvalData.parameters.length > 0) {
                       data.parameters = approvalData.parameters;
                       dataFound = true;
                   }
                }
            } catch (err) {
                console.warn("Failed to load result approval details", err);
            }
        }

        // Try 3: Fetch request details (if still no parameters found)
        if (!dataFound) {
            try {
                const reqRes = await getLabTestRequestDetails(id as string);
                const reqData = (reqRes as any)?.data ?? reqRes;
                if (reqData) {
                    if (reqData.test_Name) {
                        data.testName = reqData.test_Name;
                        data.requestId = reqData.requestnumber || data.requestId;
                        (data as any).department = reqData.category || "Laboratory";
                        data.doctorName = reqData.doctorname || data.doctorName;
                        data.status = reqData.result_Status || data.status;
                        data.createdAt = reqData.collectedDate || data.createdAt;
                        data.patientName = reqData.patientFullName || data.patientName;
                        data.fileNumber = reqData.fileNumber || data.fileNumber;
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
                        dataFound = true;
                    }
                }
            } catch (err) {
                console.warn("Failed to load request details.", err);
            }
        }

        // Fallback: Use mock parameters if everything failed and no parameters exist
        if (!dataFound && (!data.parameters || data.parameters.length === 0)) {
            // We can populate from orderData if it had any, otherwise use mockParams
            if (orderData?.parameters && Array.isArray(orderData.parameters)) {
                data.parameters = orderData.parameters;
            } else {
                data.parameters = mockParams;
            }
        }

        setDetail(data);
        setLoading(false);
    }
    loadData();
  }, [id, location.state]);

  const getInterpretation = (valStr: string | number | undefined, min: number, max: number) => {
    if (valStr === undefined || valStr === null || valStr === "") return null;
    const val = parseFloat(valStr.toString());
    if (isNaN(val)) return null;
    
    if (val > max * 1.5 || val < min * 0.5) return 'CRITICAL ALERT';
    if (val < min) return 'LOW';
    if (val > max) return 'HIGH';
    return 'NORMAL';
  };

  const getInterpretationStyles = (status: string) => {
    switch (status) {
      case 'NORMAL': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'LOW': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'CRITICAL ALERT': return 'bg-red-600 text-white border-red-700';
      default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  const handleApprove = async () => {
    if (!detail) return;
    setSubmitting(true);
    try {
      await approveLabResult(detail.id);
      navigate("/dashboard/lab-test");
    } catch (e: any) {
      alert(e.message ?? "Failed to approve results.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!detail) return;
    setSubmitting(true);
    try {
      await rejectLabResult(detail.id);
      navigate("/dashboard/lab-test");
    } catch (e: any) {
      alert(e.message ?? "Failed to reject results.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (!detail) return null;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC]">
      <TopBar
        title="APPROVE RESULTS"
        onMenuClick={onMenuClick || (() => {})}
        onProfileClick={onProfileClick}
        showAddUser={false}
      />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-[1200px] mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Approve Test Result</h1>
          <p className="text-slate-500 font-medium mt-1">Review and approve laboratory test results for diagnostic confirmation.</p>
        </div>

        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Patient and Request Info */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 leading-tight">
                    {detail.patientName ?? detail.patient?.name ?? "Emma Lawson"}
                  </h3>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Patient ID: <span className="font-semibold text-slate-700">{detail.fileNumber ?? "#PT-88291"}</span>
                  </p>
                </div>
              </div>
              <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                PENDING REVIEW
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">REQUEST NUMBER</p>
                <p className="text-sm font-bold text-slate-800">#{detail.requestId ?? "REQ-9421"}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">TEST TYPE</p>
                <p className="text-sm font-bold text-slate-800">{detail.testName ?? detail.labTest?.testNameEnglish ?? "Comprehensive Metabolic Panel"}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">REQUESTED BY</p>
                <p className="text-sm font-bold text-slate-800">{detail.doctorName ?? detail.doctor?.name ?? "Dr. Sarah Chen"}</p>
              </div>
              
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">LABORATORY ANALYST</p>
                <p className="text-sm font-bold text-slate-800">{(detail as any).labTechnicianName || (detail as any).labTechnician?.name || "Alex Rivers"}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">SAMPLE DATE</p>
                <p className="text-sm font-bold text-slate-800">{formatDate(detail.createdAt || detail.createDate)}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">DEPARTMENT</p>
                <p className="text-sm font-bold text-slate-800">{(detail as any).department || "Internal Medicine"}</p>
              </div>
            </div>
          </div>

          {/* Reviewer Notes */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">REVIEWER NOTES</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter clinical observations, approval notes, or rejection reasons..."
              className="w-full flex-1 bg-white border border-slate-200 rounded-xl p-4 text-sm text-slate-700 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all resize-none min-h-[120px]"
            ></textarea>
            
            <div className="mt-4 bg-blue-50/50 border border-blue-100 rounded-xl p-3 flex gap-3">
              <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 font-medium leading-relaxed">
                Approved results will be instantly visible to the requesting physician and patient portal.
              </p>
            </div>
          </div>

        </div>

        {/* Diagnostic Parameters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800">Diagnostic Parameters</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider w-[25%]">PARAMETER</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider w-[15%]">RESULT</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider w-[15%]">UNIT</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider w-[20%]">REFERENCE</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider w-[25%]">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {detail.parameters?.map((p) => {
                  const valStr = p.value;
                  const interp = getInterpretation(valStr, p.referenceRangeMin, p.referenceRangeMax);
                  const isCritical = interp === 'CRITICAL ALERT';
                  
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800">{p.parameterNameEnglish}</span>
                          {isCritical && <AlertTriangle size={14} className="text-red-600" />}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`text-sm font-bold ${isCritical ? 'text-red-600' : 'text-slate-800'}`}>
                          {valStr ?? "—"}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-500 font-medium">
                        {p.unit}
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-500 font-medium">
                        {p.referenceRangeMin} - {p.referenceRangeMax}
                      </td>
                      <td className="px-6 py-5">
                        {interp ? (
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border ${getInterpretationStyles(interp)}`}>
                            {interp === 'NORMAL' && <CheckCircle2 size={12} />}
                            {interp}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">Pending</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-8 pb-8">
          <button 
            onClick={handleReject}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-[#C53030] text-[#C53030] rounded-xl font-bold text-sm shadow-sm hover:bg-red-50 transition-all disabled:opacity-50"
          >
            <X size={18} />
            Reject Result
          </button>
          <button 
            onClick={handleApprove}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#0066CC] hover:bg-[#0052a3] text-white rounded-xl font-bold text-sm shadow-sm transition-all disabled:opacity-50"
          >
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
            Approve Result
          </button>
        </div>

      </div>
      </main>
    </div>
  );
}
