import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import TopBar from "../TopBar";
import { getPatientVisitLabRequestsInfo, getVisitLabRequests } from "../../../api/labs";
import {
  Search,
  Filter,
  Eye,
  FileEdit,
  Printer,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Activity,
  ChevronDown,
  CheckCheck
} from "lucide-react";

// Mock Data matching the UI
const PATIENT_INFO = {
  name: "Emma Lawson",
  id: "#PT-88291",
  gender: "Female",
  age: "32 Years",
  image: "https://i.pravatar.cc/150?u=emma" // placeholder
};

const VISIT_INFO = {
  visitNumber: "#VS-2023-0442",
  date: "Oct 24, 2023",
  doctor: "Dr. Sarah Chen",
  clinic: "Internal Medicine",
  type: "Specialist Consultation"
};

const INITIAL_MOCK_TESTS = [
  {
    id: "#LB-9021",
    name: "Comprehensive Metabolic Panel",
    category: "Biochemistry",
    sample: "Blood/Serum",
    doctor: "Dr. Sarah Chen",
    date: "24 Oct, 09:30 AM",
    status: "In Progress",
  },
  {
    id: "#LB-9022",
    name: "CBC with Differential",
    category: "Hematology",
    sample: "Whole Blood",
    doctor: "Dr. Sarah Chen",
    date: "24 Oct, 09:30 AM",
    status: "Completed",
  },
  {
    id: "#LB-9023",
    name: "Lipid Profile",
    category: "Biochemistry",
    sample: "Blood/Serum",
    doctor: "Dr. Sarah Chen",
    date: "24 Oct, 09:30 AM",
    status: "Pending",
  }
];

interface VisitLabTestsPageProps {
  onMenuClick?: () => void;
  onProfileClick?: () => void;
}

const VisitLabTestsPage: React.FC<VisitLabTestsPageProps> = ({ onMenuClick, onProfileClick }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter] = useState("All");
  const [categoryFilter] = useState("All");

  const [patientInfo, setPatientInfo] = useState(PATIENT_INFO);
  const [visitInfo, setVisitInfo] = useState(VISIT_INFO);
  const [tests, setTests] = useState(INITIAL_MOCK_TESTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisitData = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const infoRes = await getPatientVisitLabRequestsInfo(id);
        const actualInfo = infoRes?.data || infoRes;
        
        let actualRequests: any = [];
        
        if (actualInfo && Object.keys(actualInfo).length > 0) {
          const demoKey = Object.keys(actualInfo).find(k => k.toLowerCase().includes('demo'));
          const patientDemoKey = actualInfo.patient ? Object.keys(actualInfo.patient).find(k => k.toLowerCase().includes('demo')) : null;
          let extractedDemographics = (demoKey ? actualInfo[demoKey] : null) || 
                                      (patientDemoKey ? actualInfo.patient[patientDemoKey] : null) || 
                                      actualInfo.demographics || "";
          
          if (typeof extractedDemographics === 'object' && extractedDemographics !== null) {
            extractedDemographics = Object.values(extractedDemographics).filter(Boolean).join(', ');
          }

          setPatientInfo({
            name: actualInfo.patientName || actualInfo.patient?.name || actualInfo.name || actualInfo.patientNameEnglish || "Unknown Patient",
            id: actualInfo.fileNumber || actualInfo.patient?.fileNumber || "Unknown ID",
            gender: actualInfo.gender || actualInfo.patient?.gender || "Unknown",
            age: actualInfo.age ? `${actualInfo.age} Years` : "Unknown Age",
            demographics: extractedDemographics,
            image: actualInfo.image || "https://i.pravatar.cc/150?u=placeholder"
          });
          setVisitInfo({
            visitNumber: actualInfo.visitNumber || "N/A",
            date: actualInfo.visitDate || "N/A",
            doctor: actualInfo.doctorName || "N/A",
            clinic: actualInfo.clinicName || "N/A",
            type: actualInfo.visitType || "N/A"
          });
          
          // Extract requests array directly from the PatientVisitLabRequestsInfo response
          // Look for common property names or any array property
          const embeddedRequests = actualInfo.labRequests || actualInfo.requests || actualInfo.tests || actualInfo.labTestRequests || Object.values(actualInfo).find(val => Array.isArray(val));
          
          if (embeddedRequests && Array.isArray(embeddedRequests)) {
            actualRequests = embeddedRequests;
          } else {
            // Fallback in case it's not embedded
            const requestsId = actualInfo.id || actualInfo.visitId || actualInfo.requestId || id;
            const requestsRes = await getVisitLabRequests(requestsId);
            actualRequests = requestsRes?.data || requestsRes;
          }
        } else {
          // Fallback if actualInfo is empty or not an object
          const requestsRes = await getVisitLabRequests(id);
          actualRequests = requestsRes?.data || requestsRes;
        }
        
        if (Array.isArray(actualRequests)) {
          setTests(actualRequests.map((req: any) => ({
            id: `#${req.id || req.requestId || Math.floor(Math.random() * 10000)}`,
            name: req.testNameEnglish || req.testName || req.labTest?.testNameEnglish || "Unknown Test",
            category: req.category || req.labTest?.category || "General",
<<<<<<< Updated upstream
            sample: req.smaple || req.sample || req.sampleType || "Blood",
            doctor: req.requestByName || req.doctorName || req.doctor?.name || "Unknown",
            date: req.requestDate || req.createdAt || "N/A",
=======
            sample: req.sampleType || req.sample || req.smaple || req.labTest?.sampleType || "Blood",
            doctor: req.requestByName || req.requestedBy || req.doctorName || req.doctor?.name || actualInfo?.doctorName || actualInfo?.doctor?.name || "Unknown",
            date: req.requestDate || req.createdAt || req.date || actualInfo?.visitDate || "N/A",
>>>>>>> Stashed changes
            status: req.status || "Pending",
          })));
        } else if (actualRequests && actualRequests.length !== undefined) {
           // fallback if it's somehow not an array but has length
           setTests(Array.from(actualRequests).map((req: any) => ({
            id: `#${req.id || req.requestId || Math.floor(Math.random() * 10000)}`,
            name: req.testNameEnglish || req.testName || req.labTest?.testNameEnglish || "Unknown Test",
            category: req.category || req.labTest?.category || "General",
<<<<<<< Updated upstream
            sample: req.smaple || req.sample || req.sampleType || "Blood",
            doctor: req.requestByName || req.doctorName || req.doctor?.name || "Unknown",
            date: req.requestDate || req.createdAt || "N/A",
=======
            sample: req.sampleType || req.sample || req.smaple || req.labTest?.sampleType || "Blood",
            doctor: req.requestByName || req.requestedBy || req.doctorName || req.doctor?.name || actualInfo?.doctorName || actualInfo?.doctor?.name || "Unknown",
            date: req.requestDate || req.createdAt || req.date || actualInfo?.visitDate || "N/A",
>>>>>>> Stashed changes
            status: req.status || "Pending",
          })));
        }
      } catch (err) {
        console.error("Failed to fetch visit data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVisitData();
  }, [id]);

  const filteredTests = tests.filter((test) => {
    const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase()) || test.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || test.status === statusFilter;
    const matchesCategory = categoryFilter === "All" || test.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "In Progress":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            In Progress
          </span>
        );
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
            <CheckCircle2 size={12} className="text-slate-600" />
            Completed
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
            <Clock size={12} className="text-purple-600" />
            Pending
          </span>
        );
      default:
        return null;
    }
  };

  const handleApprove = (testId: string) => {
    setTests(prev => prev.map(t => 
      t.id === testId ? { ...t, status: "Completed" } : t
    ));
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC]">
      <TopBar
        title="DASHBOARD"
        onMenuClick={onMenuClick || (() => {})}
        onProfileClick={onProfileClick}
        showAddUser={false}
      />

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {loading ? (
          <div className="flex justify-center items-center h-full min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
        <div className="max-w-[1600px] mx-auto space-y-6">
          {/* Header & Breadcrumbs */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              <span 
                className="text-slate-800 cursor-pointer hover:underline" 
                onClick={() => navigate(-1)}
              >
                {location.state?.label || 'DASHBOARD'}
              </span>
              <ChevronRight size={14} />
              <span className="text-blue-600">PATIENT VISITS</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Visit Lab Tests</h2>
            <p className="text-slate-500 font-medium mt-1">View laboratory tests related to the selected patient visit</p>
          </div>

          {/* Info Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
            {/* Patient Info */}
            <div className="flex items-center gap-5 min-w-[300px]">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{patientInfo.name}</h3>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs font-bold">
                    {patientInfo.id}
                  </span>
                  <span className="text-sm font-medium text-slate-500">
                    {(patientInfo as any).demographics || `${patientInfo.gender}, ${patientInfo.age}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Visit Info Grid */}
            <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-8">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">VISIT NUMBER</p>
                <p className="text-sm font-bold text-slate-800">{visitInfo.visitNumber}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">VISIT DATE</p>
                <p className="text-sm font-bold text-slate-800">{visitInfo.date}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">DOCTOR</p>
                <p className="text-sm font-bold text-slate-800">{visitInfo.doctor}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">CLINIC</p>
                <p className="text-sm font-bold text-slate-800">{visitInfo.clinic}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">VISIT TYPE</p>
                <p className="text-sm font-bold text-slate-800">{visitInfo.type}</p>
              </div>
            </div>

            {/* Clinical Priority Card */}
            <div className="bg-[#0A58CA] text-white rounded-2xl p-6 w-full lg:w-[320px] shrink-0 relative overflow-hidden shadow-md">
              <div className="flex justify-between items-start mb-4 relative z-10">
                <Activity size={24} className="text-blue-200" />
                <span className="bg-white/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">LAB SCORE</span>
              </div>
              <div className="relative z-10">
                <h4 className="text-lg font-bold mb-1">Clinical Priority</h4>
                <p className="text-blue-100 text-sm font-medium leading-relaxed mb-6">
                  High attention required for upcoming results.
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">03</span>
                  <span className="text-sm text-blue-200 font-semibold">Tests Active</span>
                </div>
              </div>
              {/* Decorative circle */}
              <div className="absolute -right-12 -bottom-12 w-40 h-40 bg-white/5 rounded-full pointer-events-none"></div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Search by test name, request ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
              />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative bg-white border border-slate-100 rounded-xl flex items-center px-4 py-3 shadow-sm cursor-pointer hover:bg-slate-50 min-w-[140px]">
                <span className="text-sm font-semibold text-slate-700 mr-2 flex-1">Status: {statusFilter}</span>
                <ChevronDown size={16} className="text-slate-400" />
                {/* A real implementation would have a dropdown menu here */}
              </div>
              <div className="relative bg-white border border-slate-100 rounded-xl flex items-center px-4 py-3 shadow-sm cursor-pointer hover:bg-slate-50 min-w-[140px]">
                <span className="text-sm font-semibold text-slate-700 mr-2 flex-1">Category: {categoryFilter}</span>
                <ChevronDown size={16} className="text-slate-400" />
              </div>
              <button className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors">
                <Filter size={18} />
              </button>
            </div>
          </div>

          {/* Tests Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">TEST DETAILS</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">CATEGORY</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">SAMPLE</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">REQUESTED BY</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">STATUS</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredTests.map((test, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-slate-800">{test.name}</p>
                        <p className="text-[10px] font-semibold text-slate-400 mt-1">ID: {test.id}</p>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-semibold text-slate-600">{test.category}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="m14.5 4-5 5"></path><path d="m10.5 8 5-5"></path><path d="m5 13 4 4"></path><path d="m19 9-4-4"></path><path d="M21 21 9 9"></path><path d="m3 21 6-6"></path></svg>
                          {test.sample}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-slate-800">{test.doctor}</p>
                        <p className="text-[10px] font-semibold text-slate-400 mt-1">{test.date}</p>
                      </td>
                      <td className="px-6 py-5">
                        {getStatusBadge(test.status)}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <button 
                            className="text-blue-600 hover:text-blue-800 transition-colors p-1 cursor-pointer" 
                            title="View"
                            onClick={() => navigate(`/dashboard/lab/result/${test.id.replace('#', '')}`, { 
                              state: { 
                                from: location.pathname, 
                                base: location.state?.base || location.state?.from, 
                                label: 'PATIENT VISITS',
                                orderData: {
                                  ...test,
                                  patientName: patientInfo.name,
                                  fileNumber: patientInfo.id
                                }
                              } 
                            })}
                          >
                            <Eye size={16} />
                          </button>
                          {test.status !== "Completed" && (
                            <button 
                              className="text-slate-500 hover:text-slate-700 transition-colors p-1 cursor-pointer" 
                              title="Edit"
                              onClick={() => navigate(`/dashboard/lab/edit/${test.id.replace('#', '')}`, { 
                                state: { 
                                  from: location.pathname, 
                                  base: location.state?.base || location.state?.from, 
                                  label: 'PATIENT VISITS', 
                                  orderData: {
                                    ...test,
                                    patientName: patientInfo.name,
                                    fileNumber: patientInfo.id
                                  } 
                                } 
                              })}
                            >
                              <FileEdit size={16} />
                            </button>
                          )}
                          {test.status === "In Progress" && (
                            <button 
                              className="text-slate-600 hover:text-emerald-600 transition-colors p-1 cursor-pointer" 
                              title="Approve"
                              onClick={() => handleApprove(test.id)}
                            >
                              <CheckCheck size={16} />
                            </button>
                          )}
                          {test.status === "Completed" && (
                            <button className="text-slate-500 hover:text-slate-700 transition-colors p-1 cursor-pointer" title="Print">
                              <Printer size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredTests.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-slate-500 font-medium text-sm">
                        No lab tests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Footer */}
            <div className="px-6 py-4 bg-slate-50/50 flex items-center justify-between border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-500">
                Showing 1-{filteredTests.length} of {tests.length} results
              </span>
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 flex items-center justify-center rounded text-slate-400 hover:bg-slate-200 transition-colors">
                  <ChevronLeft size={16} />
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded bg-white text-blue-600 font-bold border border-slate-200 shadow-sm">
                  1
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded text-slate-600 font-bold hover:bg-slate-200 transition-colors">
                  2
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded text-slate-600 font-bold hover:bg-slate-200 transition-colors">
                  3
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded text-slate-400 hover:bg-slate-200 transition-colors">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
        )}
      </main>
    </div>
  );
};

export default VisitLabTestsPage;
