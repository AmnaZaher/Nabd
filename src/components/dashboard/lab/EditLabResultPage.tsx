import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ChevronRight, User, AlertTriangle, Loader2, Check } from "lucide-react";
import { getLabResultDetails, createLabResult, getLabTestDetails, getLabTestRequestDetails } from "../../../api/labs";
import type { LabResultDetail } from "../../../types/labs.types";
import TopBar from "../TopBar";

const mockParams = [
  { id: 101, parameterNameEnglish: "Glucose", referenceRangeMin: 70, referenceRangeMax: 99, unit: "mg/dL" },
  { id: 102, parameterNameEnglish: "Sodium", referenceRangeMin: 135, referenceRangeMax: 145, unit: "mEq/L" },
  { id: 103, parameterNameEnglish: "Potassium", referenceRangeMin: 3.6, referenceRangeMax: 5.2, unit: "mEq/L" },
  { id: 104, parameterNameEnglish: "Creatinine", referenceRangeMin: 0.7, referenceRangeMax: 1.3, unit: "mg/dL" },
  { id: 105, parameterNameEnglish: "BUN", referenceRangeMin: 7, referenceRangeMax: 20, unit: "mg/dL" },
];

interface EditLabResultPageProps {
  onMenuClick?: () => void;
  onProfileClick?: () => void;
}

export default function EditLabResultPage({ onMenuClick, onProfileClick }: EditLabResultPageProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [detail, setDetail] = useState<LabResultDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState<Record<number, string>>({});
  const [notes, setNotes] = useState("");

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

        // Initialize with fallback data based on orderData
        let data: LabResultDetail = {
            id: parsedId,
            requestId: parsedId,
            patientName: orderData?.patientName || orderData?.patient?.name || orderData?.name || "Unknown Patient",
            fileNumber: orderData?.fileNumber || orderData?.patient?.fileNumber || "—",
            testName: orderData?.testName || orderData?.labTest?.testNameEnglish || orderData?.name || "Unknown Test",
            doctorName: orderData?.doctorName || orderData?.doctor?.name || orderData?.doctor || "Unknown Doctor",
            status: orderData?.status || "In Progress",
            priority: orderData?.priority || "Normal",
            createdAt: orderData?.createdAt || orderData?.date || new Date().toISOString(),
            parameters: []
        } as LabResultDetail;

        (data as any).visitNumber = orderData?.visitId || orderData?.visitNumber || "";
        (data as any).category = orderData?.category || orderData?.labTest?.category || "";
        (data as any).sampleType = orderData?.sampleType || "";

        // 1. Try to fetch the full request details using the new endpoint
        let requestDetailsData: any = null;
        try {
            const reqRes = await getLabTestRequestDetails(id as string);
            requestDetailsData = (reqRes as any)?.data ?? reqRes;
            if (Array.isArray(requestDetailsData)) requestDetailsData = requestDetailsData[0];
            if (requestDetailsData) {
                // If it returns patient details, merge them
                if (requestDetailsData.patientName) data.patientName = requestDetailsData.patientName;
                if (requestDetailsData.doctorName) data.doctorName = requestDetailsData.doctorName;
                if (requestDetailsData.testName) data.testName = requestDetailsData.testName;
                
                // If it contains parameters directly
                const paramsList = requestDetailsData.parameters || requestDetailsData.labParameters || requestDetailsData.testParameters || requestDetailsData.labTest?.parameters;
                if (paramsList && Array.isArray(paramsList)) {
                    data.parameters = paramsList.map((p: any) => ({
                        ...p,
                        id: p.id || p.parameterId || p.paramterId || p.labParameterId || p.testParameterId,
                        parameterNameEnglish: p.parameterNameEnglish || p.parameterName || p.name || 'Unknown Parameter',
                        referenceRangeMin: p.referenceRangeMin ?? p.minRange ?? 0,
                        referenceRangeMax: p.referenceRangeMax ?? p.maxRange ?? 0,
                        unit: p.unit || p.measurementUnit || ''
                    }));
                }
            }
        } catch (err) {
            console.warn("Failed to load request details via LabTestDetails.", err);
        }

        // 2. If we still don't have parameters, try to get them from GetResultDetails (if it was already partially created)
        if (!data.parameters || data.parameters.length === 0) {
            try {
                const res = await getLabResultDetails(id as string);
                let apiData = (res as any)?.data ?? res;
                if (Array.isArray(apiData)) apiData = apiData[0];
                if (apiData) {
                    data = { ...data, ...apiData };
                }
            } catch (err) {
                console.warn("Failed to load result details (might not exist yet).", err);
            }
        }

        // 3. If we STILL don't have parameters, try fetching by TestId or Name
        if (!data.parameters || data.parameters.length === 0) {
            const testId = (data as any).testId || (data as any).labTestId || (data as any).labTest?.id || requestDetailsData?.testId || requestDetailsData?.labTestId || requestDetailsData?.labTest?.id || orderData?.testId || orderData?.labTestId || orderData?.labTest?.id;
            let testParams = null;

            if (testId) {
                try {
                    const testRes = await getLabTestDetails(testId);
                    const testData = (testRes as any)?.data ?? testRes;
                    const testDataParams = testData?.parameters || testData?.labParameters || testData?.testParameters || testData?.labTestParameters;
                    if (testDataParams && testDataParams.length > 0) {
                        testParams = testDataParams.map((p: any) => ({
                            ...p,
                            id: p.id || p.parameterId || p.paramterId || p.labParameterId || p.testParameterId,
                            parameterNameEnglish: p.parameterNameEnglish || p.parameterName || p.name || 'Unknown Parameter',
                            referenceRangeMin: p.referenceRangeMin ?? p.minRange ?? 0,
                            referenceRangeMax: p.referenceRangeMax ?? p.maxRange ?? 0,
                            unit: p.unit || p.measurementUnit || ''
                        }));
                    }
                } catch (err) {
                    console.error("Failed to load test parameters by testId:", testId, err);
                }
            }

            // Fallback: match by name using the full catalog
            if (!testParams) {
                try {
                    const { getLabCatalogFull } = await import('../../../api/labs');
                    const catalogRes = await getLabCatalogFull();
                    const catalogList = Array.isArray(catalogRes) ? catalogRes : ((catalogRes as any)?.data || []);
                    
                    const testName = data.testName || data.testNameEnglish || data.labTest?.testNameEnglish;
                    const matchedTest = catalogList.find((t: any) => 
                        (testName && (t.testNameEnglish === testName || t.testName === testName || t.testNameArabic === testName)) ||
                        (testId && t.id === testId)
                    );
                    
                    if (matchedTest?.parameters && matchedTest.parameters.length > 0) {
                        testParams = matchedTest.parameters.map((p: any) => ({
                            ...p,
                            id: p.id || p.parameterId || p.paramterId || p.labParameterId || p.testParameterId,
                            parameterNameEnglish: p.parameterNameEnglish || p.parameterName || p.name || 'Unknown Parameter',
                            referenceRangeMin: p.referenceRangeMin ?? p.minRange ?? 0,
                            referenceRangeMax: p.referenceRangeMax ?? p.maxRange ?? 0,
                            unit: p.unit || p.measurementUnit || ''
                        }));
                    }
                } catch (err) {
                    console.error("Failed to load test parameters via catalog fallback:", err);
                }
            }

            if (testParams) {
                data.parameters = testParams;
            } else {
                data.parameters = mockParams;
            }
        }

        setDetail(data);

        // Pre-fill existing values if any
        if (data.parameters) {
            const initialValues: Record<number, string> = {};
            data.parameters.forEach(p => {
                if (p.value !== undefined && p.value !== null) {
                    initialValues[p.id] = p.value.toString();
                }
            });
            setValues(initialValues);
        }

        setLoading(false);
    }
    loadData();
  }, [id]);

  const getInterpretation = (valStr: string, min: number, max: number) => {
    if (!valStr) return null;
    const val = parseFloat(valStr);
    if (isNaN(val)) return null;
    
    // Logic roughly matching screenshot
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

  const handleSubmit = async () => {
    if (!detail) return;
    
    const results = (detail.parameters ?? [])
      .filter((p) => values[p.id] !== undefined && values[p.id] !== "")
      .map((p) => {
        const pId = p.id || (p as any).parameterId || (p as any).paramterId || 0;
        return {
          paramterId: pId,
          paramterValue: parseFloat(values[p.id] ?? "0"),
          comment: notes,
        };
      });

    if (results.length === 0) {
      alert("Please enter at least one result value.");
      return;
    }

    setSubmitting(true);
    try {
      // Ensure requestId is strictly a number to satisfy C# backend validation
      const rawId = detail.requestId ?? detail.id;
      const parsedRequestId = typeof rawId === 'number' ? rawId : parseInt(String(rawId).replace(/\D/g, ''), 10);
      
      await createLabResult({ requestId: parsedRequestId || 0, results });
      navigate("/dashboard");
    } catch (e: any) {
      alert(e.message ?? "Failed to submit results.");
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
        title="DASHBOARD"
        onMenuClick={onMenuClick || (() => {})}
        onProfileClick={onProfileClick}
        showAddUser={false}
      />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-[1200px] mx-auto space-y-6">
        
        {/* Breadcrumb Header */}
        <div className="flex items-center gap-2 text-xs font-black tracking-wider uppercase">
          <span 
            className="text-slate-900 cursor-pointer hover:text-blue-600 transition-colors"
            onClick={() => navigate(-1)}
          >
            {location.state?.label || 'DASHBOARD'}
          </span>
          <ChevronRight size={14} className="text-slate-400" />
          <span className="text-blue-600">EDIT TEST</span>
        </div>

        {/* Title and Action */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Test Result</h1>
            <p className="text-slate-500 font-medium mt-1">Record and manage laboratory test results.</p>
          </div>
          <button 
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-[#0f4c81] hover:bg-[#0c3e6a] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            Mark as Completed
          </button>
        </div>

        {/* Top Information Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Patient Info Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
              <User size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-wider mb-1">PATIENT INFORMATION</p>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                {detail.patientName ?? detail.patient?.name ?? "Emma Lawson"}
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                ID: {detail.fileNumber ?? "#PT-88291"} • Female, 32y
              </p>
            </div>
          </div>

          {/* Details Grid Card */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-6">
            
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">REQUEST STATUS</p>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  <span className="text-sm font-bold text-slate-800">{detail.status || "In Progress"}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">#{detail.requestId ?? "REQ-9421"}</p>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
                <div className="h-full bg-blue-600 w-[65%] rounded-full"></div>
                <div className="ml-auto text-[10px] font-bold text-blue-600 pt-3">65%</div>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">TEST NAME</p>
              <p className="text-sm font-bold text-slate-800">{detail.testName ?? detail.labTest?.testNameEnglish ?? "Comprehensive Metabolic Panel"}</p>
            </div>

            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">SAMPLE TYPE</p>
              <p className="text-sm font-bold text-slate-800">Blood/Serum</p>
              
              <div className="mt-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">SAMPLE DATE</p>
                <p className="text-sm font-bold text-slate-800">Oct 24, 2023</p>
              </div>
            </div>

            <div className="flex flex-col">
               <span className="self-end px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-600 mb-2">Standard Priority</span>
               <div className="mt-auto">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">REQUESTED BY</p>
                 <p className="text-sm font-bold text-slate-800">{detail.doctorName ?? detail.doctor?.name ?? "Dr. Sarah Chen"}</p>
               </div>
            </div>

          </div>
        </div>

        {/* Detailed Parameters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800">Detailed Parameters</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider w-[25%]">PARAMETER NAME</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider w-[20%]">REFERENCE RANGE</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider w-[15%]">UNIT</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider w-[20%]">RESULT VALUE</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider w-[20%]">INTERPRETATION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {detail.parameters?.map((p) => {
                  const val = values[p.id];
                  const interp = getInterpretation(val, p.referenceRangeMin, p.referenceRangeMax);
                  const isCritical = interp === 'CRITICAL ALERT';
                  
                  return (
                    <tr key={p.id} className={`${isCritical ? 'bg-red-50/20' : 'hover:bg-slate-50/30'} transition-colors`}>
                      <td className={`px-6 py-5 text-sm font-bold ${isCritical ? 'text-red-600' : 'text-slate-800'}`}>
                        {p.parameterNameEnglish}
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-500 font-medium">
                        {p.referenceRangeMin} - {p.referenceRangeMax}
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-500 font-medium">
                        {p.unit}
                      </td>
                      <td className="px-6 py-5">
                        <div className="relative">
                          <input
                            type="number"
                            value={val ?? ""}
                            onChange={(e) => setValues(prev => ({ ...prev, [p.id]: e.target.value }))}
                            placeholder="Enter value"
                            className={`w-full ${isCritical ? 'bg-white border-red-600 text-red-700 font-bold focus:ring-red-500/20' : 'bg-slate-100 border-transparent text-slate-800 focus:bg-white focus:border-blue-400 focus:ring-blue-500/20'} border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-all`}
                          />
                          {isCritical && (
                            <AlertTriangle size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {interp ? (
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border ${getInterpretationStyles(interp)}`}>
                            {interp === 'NORMAL' && <Check size={12} />}
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

        {/* Notes */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Technician Notes & Observations</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any clinical observations or sample quality notes here..."
            className="w-full h-32 bg-[#F8FAFC] border border-slate-200 rounded-xl p-4 text-sm text-slate-700 focus:outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all resize-none"
          ></textarea>
        </div>

        </div>
      </main>
    </div>
  );
}
