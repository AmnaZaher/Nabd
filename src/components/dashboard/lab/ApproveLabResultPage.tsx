import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
    User, 
    AlertTriangle, 
    X, 
    CheckCircle2, 
    Info,
    Loader2
} from "lucide-react";
import { getLabResultDetails, approveLabResult } from "../../../api/labs";
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

export default function ApproveLabResultPage({ onMenuClick, onProfileClick }: ApproveLabResultPageProps) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [detail, setDetail] = useState<LabResultDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getLabResultDetails(id as string);
        const data: LabResultDetail = (res as any)?.data ?? res;
        
        // Inject mock parameters if none are returned
        if (!data.parameters || data.parameters.length === 0) {
          data.parameters = mockParams;
        }
        
        setDetail(data);

      } catch (err) {
        console.error("Failed to load result details:", err);
        // Fallback to mock data
        setDetail({
            id: Number(id),
            requestId: Number(id),
            patientName: "Emma Lawson",
            fileNumber: "PT-88291",
            testName: "Comprehensive Metabolic Panel",
            doctorName: "Dr. Sarah Chen",
            status: "Pending Review",
            priority: "Normal",
            createdAt: "2023-10-24T10:00:00Z",
            parameters: mockParams,
        } as LabResultDetail);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

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
    // Implement reject logic if API supports it, otherwise go back
    navigate("/dashboard/lab-test");
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
          <p className="text-xs font-black tracking-widest text-slate-500 uppercase mb-1">APPROVE RESULTS</p>
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
                <p className="text-sm font-bold text-slate-800">Alex Rivers</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">SAMPLE DATE</p>
                <p className="text-sm font-bold text-slate-800">Oct 24, 2023</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">DEPARTMENT</p>
                <p className="text-sm font-bold text-slate-800">Internal Medicine</p>
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
