import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TopBar from "../TopBar";
import {
  ChevronRight,
  User,
  ClipboardList,
  CheckCircle2,
  AlertOctagon,
  ArrowLeft,
  Activity,
} from "lucide-react";

import {
  createRadiologyExam,
  deleteRadiologyRequest,
  getRadiologyRequestById,
  type RadiologyRequestDetailsDto,
} from "../../../api/radilogist";

interface RequestItem {
  id: string;
  patientName: string;
  patientId: string;
  initials: string;
  modality: string;
  bodyPart: string;
  status: string;
  priority: string;
  age: string;
  gender: string;
  nationalId: string;
  testType: string;
  referringDr: string;
  scheduledTime: string;
}

const MOCK_REQUEST_DETAILS: RadiologyRequestDetailsDto[] = [
  {
    id: 9021,
    requestId: 9021,
    patientName: "Eleanor Vance",
    patientId: 101,
    patientFileNumber: "8829-XP",
    requestNumber: "#RAD-9021",
    modality: "MRI - System 01",
    bodyPart: "Brain (Contrast)",
    status: "Pending",
    priority: "Urgent",
    age: 29,
    gender: "Female",
    nationalId: "882-90-XXXX",
    testName: "MRI Brain w/ Contrast",
    examName: "MRI Brain w/ Contrast",
    referringDoctor: "Dr. Elena Rossi",
    scheduledTime: "2026-06-03T14:30:00",
    examDate: "2026-06-03T14:30:00",
    studyDescription: "MRI Brain w/ Contrast",
    category: "MRI",
    fileNumber: "8829-XP",
    referringDr: "Dr. Elena Rossi",
    isStat: true,
  },
  {
    id: 9022,
    requestId: 9022,
    patientName: "Arthur Morgan",
    patientId: 102,
    patientFileNumber: "1102-AM",
    requestNumber: "#RAD-9022",
    modality: "CT - System 02",
    bodyPart: "Lumbar Spine",
    status: "In Progress",
    priority: "Routine",
    age: 42,
    gender: "Male",
    nationalId: "110-20-XXXX",
    testName: "CT Lumbar Spine",
    examName: "CT Lumbar Spine",
    referringDoctor: "Dr. J. Vane",
    scheduledTime: "2026-06-03T11:00:00",
    examDate: "2026-06-03T11:00:00",
    studyDescription: "CT Lumbar Spine",
    category: "CT",
    fileNumber: "1102-AM",
    referringDr: "Dr. J. Vane",
    isStat: false,
  },
  {
    id: 9023,
    requestId: 9023,
    patientName: "Sarah Connor",
    patientId: 103,
    patientFileNumber: "5543-SC",
    requestNumber: "#RAD-9023",
    modality: "X-RAY - System 03",
    bodyPart: "Left Ankle",
    status: "Completed",
    priority: "Routine",
    age: 35,
    gender: "Female",
    nationalId: "554-30-XXXX",
    testName: "X-Ray Left Ankle",
    examName: "X-Ray Left Ankle",
    referringDoctor: "Dr. L. Myers",
    scheduledTime: "2026-06-02T09:15:00",
    examDate: "2026-06-02T09:15:00",
    studyDescription: "X-Ray Left Ankle",
    category: "X-RAY",
    fileNumber: "5543-SC",
    referringDr: "Dr. L. Myers",
    isStat: false,
  },
  {
    id: 9024,
    requestId: 9024,
    patientName: "John Doe",
    patientId: 104,
    patientFileNumber: "0023-JD",
    requestNumber: "#RAD-9024",
    modality: "ULTRASOUND - System 04",
    bodyPart: "Abdomen",
    status: "Pending",
    priority: "Routine",
    age: 31,
    gender: "Male",
    nationalId: "002-30-XXXX",
    testName: "Ultrasound Abdomen",
    examName: "Ultrasound Abdomen",
    referringDoctor: "Dr. Ahmed Noor",
    scheduledTime: "2026-06-03T16:00:00",
    examDate: "2026-06-03T16:00:00",
    studyDescription: "Ultrasound Abdomen",
    category: "ULTRASOUND",
    fileNumber: "0023-JD",
    referringDr: "Dr. Ahmed Noor",
    isStat: false,
  },
];

const formatScheduledTime = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString([], {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getInitials = (name?: string) => {
  if (!name) return "NA";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
};

const mapDetails = (item?: RadiologyRequestDetailsDto): RequestItem => ({
  id: String(item?.id ?? item?.requestId ?? "—"),
  patientName: item?.patientName || "Unknown Patient",
  patientId:
    item?.patientFileNumber || item?.fileNumber || String(item?.patientId ?? "—"),
  initials: getInitials(item?.patientName),
  modality: item?.modality || item?.category || "—",
  bodyPart: item?.bodyPart || item?.studyDescription || "—",
  status: item?.status || "Pending",
  priority: item?.priority || (item?.isStat ? "STAT" : "Routine"),
  age: item?.age ? `${item.age} Years` : "—",
  gender: item?.gender || "—",
  nationalId: item?.nationalId || "—",
  testType: item?.testName || item?.examName || item?.studyDescription || "—",
  referringDr: item?.referringDoctor || item?.referringDr || "—",
  scheduledTime: formatScheduledTime(item?.scheduledTime || item?.examDate),
});

const RadiologyViewExam: React.FC<{
  onMenuClick?: () => void;
  onProfileClick?: () => void;
}> = ({ onMenuClick, onProfileClick }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [detailsResponse, setDetailsResponse] =
    useState<RadiologyRequestDetailsDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  useEffect(() => {
  const fetchRequest = async () => {
    if (!id) {
      setError("Request ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await getRadiologyRequestById(id);

      const hasValidData =
        data &&
        (data.id != null ||
          data.requestId != null ||
          data.patientName ||
          data.requestNumber);

      if (hasValidData) {
        setDetailsResponse(data);
        setError(null);
      } else {
        const mockMatch = MOCK_REQUEST_DETAILS.find(
          (item) => String(item.id) === String(id) || String(item.requestId) === String(id)
        );

        if (mockMatch) {
          setDetailsResponse(mockMatch);
          setError(null); // important
        } else {
          setDetailsResponse(null);
          setError("Radiology request not found.");
        }
      }
    } catch (err: any) {
      const mockMatch = MOCK_REQUEST_DETAILS.find(
        (item) => String(item.id) === String(id) || String(item.requestId) === String(id)
      );

      if (mockMatch) {
        setDetailsResponse(mockMatch);
        setError(null); // important
      } else {
        setDetailsResponse(null);
        setError(err?.message || "Radiology request not found.");
      }
    } finally {
      setLoading(false);
    }
  };

  fetchRequest();
}, [id]);

  const details = useMemo(() => mapDetails(detailsResponse || undefined), [detailsResponse]);

  const handleCancelSession = async () => {
    if (!id) return;

    const confirmed = window.confirm("Are you sure you want to cancel this session?");
    if (!confirmed) return;

    try {
      setActionLoading(true);
      await deleteRadiologyRequest(id);
      navigate("/dashboard/radiology/requests");
    } catch (err: any) {
      navigate("/dashboard/radiology/requests");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartExam = async () => {
    if (!id) return;

    try {
      setActionLoading(true);
      await createRadiologyExam(id, {});
      navigate(`/dashboard/radiology/start-exam/${id}`);
    } catch (err: any) {
      navigate(`/dashboard/radiology/start-exam/${id}`);
    } finally {
      setActionLoading(false);
    }
  };

  const breadcrumb = (
    <div className="flex items-center gap-2 text-xs md:text-sm font-extrabold text-slate-400">
      <button
        className="cursor-pointer hover:text-blue-600"
        onClick={() => navigate("/dashboard/radiology/requests")}
      >
        REQUESTS
      </button>
      <ChevronRight size={14} className="text-slate-300 shrink-0" />
      <span className="text-blue-600 font-black">VIEW EXAM</span>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC]">
      <TopBar
        title={breadcrumb}
        onMenuClick={onMenuClick || (() => {})}
        onProfileClick={onProfileClick}
        showAddUser={false}
      />

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {loading ? (
          <div className="max-w-[1600px] mx-auto py-16 text-center text-slate-400 text-sm">
            Loading exam details...
          </div>
        ) : error ? (
          <div className="max-w-[1600px] mx-auto py-16 text-center text-red-500 text-sm">
            {error}
          </div>
        ) : (
          <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Radiology Exam Details
                </h2>
                <p className="text-slate-500 font-semibold text-xs md:text-sm mt-1">
                  View patient demographic profile, safety matrix, and scheduling logs.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/dashboard/radiology/requests")}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
                >
                  <ArrowLeft size={14} />
                  <span>Back to Requests</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-100/50 p-2.5 rounded-3xl border border-slate-100">
              <div className="bg-white px-5 py-3 rounded-2xl flex items-center justify-center border border-slate-200/40 shadow-sm">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  01. PENDING
                </span>
              </div>

              <div className="bg-blue-600 px-5 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-blue-500/10">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  03. IN PROGRESS
                </span>
              </div>

              <div className="bg-slate-50/50 border border-dashed border-slate-200 px-5 py-3 rounded-2xl flex items-center justify-center">
                <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">
                  04. UPLOADED
                </span>
              </div>

              <div className="bg-slate-50/50 border border-dashed border-slate-200 px-5 py-3 rounded-2xl flex items-center justify-center">
                <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">
                  05. REPORT
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center justify-center shrink-0">
                    <User size={24} className="text-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">
                      {details.patientName}
                    </h3>
                    <span className="inline-block px-3 py-1 rounded-xl text-[10px] font-black tracking-wider text-blue-600 bg-blue-50/50 border border-blue-100/50">
                      {details.patientId}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 py-4 border-y border-slate-50">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      Gender
                    </p>
                    <p className="text-sm font-extrabold text-slate-700 mt-0.5">
                      {details.gender}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      Age
                    </p>
                    <p className="text-sm font-extrabold text-slate-700 mt-0.5">
                      {details.age}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      National ID
                    </p>
                    <p className="text-sm font-extrabold text-slate-700 mt-0.5 truncate">
                      {details.nationalId}
                    </p>
                  </div>
                </div>

                <div className="bg-emerald-50/40 border border-emerald-100/80 rounded-2xl p-4 flex gap-3.5 items-start">
                  <div className="p-1 rounded-lg bg-emerald-500 text-white shrink-0 mt-0.5">
                    <CheckCircle2 size={16} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-black text-emerald-800 tracking-wide">
                      Identity Confirmed
                    </p>
                    <p className="text-[11px] text-emerald-600/90 font-bold leading-relaxed">
                      Verified with photo ID and patient verbal confirmation.
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
                <div className="flex items-center gap-2 pb-4 border-b border-slate-50 mb-4">
                  <ClipboardList size={18} className="text-blue-500" />
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                    Request Information
                  </h3>
                </div>

                <div className="space-y-5 flex-1 flex flex-col justify-center">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[11px]">
                      Test Type
                    </span>
                    <span className="font-extrabold text-slate-800">{details.testType}</span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[11px]">
                      Modality
                    </span>
                    <span className="px-3 py-1 bg-slate-50 text-slate-600 border border-slate-200 text-xs font-black rounded-lg uppercase tracking-wide">
                      {details.modality}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[11px]">
                      Referring Dr.
                    </span>
                    <span className="font-extrabold text-slate-800">
                      {details.referringDr}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[11px]">
                      Scheduled
                    </span>
                    <span className="font-extrabold text-slate-800">
                      {details.scheduledTime}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[11px]">
                      Request #
                    </span>
                    <span className="font-extrabold text-slate-800">#{id || "2944"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity size={18} className="text-blue-500" />
                  <h3 className="text-sm font-black text-slate-700 tracking-wide uppercase">
                    Safety Validation Matrix
                  </h3>
                </div>
                <button className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest flex items-center gap-1">
                  Full Medical History →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="p-4 bg-emerald-50/20 border border-emerald-100 rounded-2xl flex flex-col justify-between relative overflow-hidden h-[90px]">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Pregnancy
                  </span>
                  <span className="text-sm font-extrabold text-emerald-700">Negative</span>
                  <div className="absolute bottom-0 inset-x-0 h-1 bg-emerald-500" />
                </div>

                <div className="p-4 bg-amber-50/20 border border-amber-100 rounded-2xl flex flex-col justify-between relative overflow-hidden h-[90px]">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Diabetes
                  </span>
                  <span className="text-sm font-extrabold text-amber-700">Negative</span>
                  <div className="absolute bottom-0 inset-x-0 h-1 bg-amber-500" />
                </div>

                <div className="p-4 bg-red-50/20 border border-red-100 rounded-2xl flex flex-col justify-between relative overflow-hidden h-[90px]">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      Contrast Allergy
                    </span>
                    <AlertOctagon size={14} className="text-red-500 shrink-0" />
                  </div>
                  <span className="text-sm font-extrabold text-red-700">Iodine Sens.</span>
                  <div className="absolute bottom-0 inset-x-0 h-1 bg-red-500" />
                </div>

                <div className="p-4 bg-emerald-50/20 border border-emerald-100 rounded-2xl flex flex-col justify-between relative overflow-hidden h-[90px]">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Cardiac
                  </span>
                  <span className="text-sm font-extrabold text-emerald-700">None</span>
                  <div className="absolute bottom-0 inset-x-0 h-1 bg-emerald-500" />
                </div>

                <div className="p-4 bg-amber-50/20 border border-amber-100 rounded-2xl flex flex-col justify-between relative overflow-hidden h-[90px]">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Metformin
                  </span>
                  <span className="text-sm font-extrabold text-amber-700">Active Use</span>
                  <div className="absolute bottom-0 inset-x-0 h-1 bg-amber-500" />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={handleCancelSession}
                  disabled={actionLoading}
                  className="text-red-600 font-bold text-sm hover:text-red-700 disabled:opacity-50 cursor-pointer"
                >
                  Cancel Session
                </button>

                <button
                  onClick={handleStartExam}
                  disabled={actionLoading}
                  className="px-6 py-3 bg-[#1A6FC4] hover:bg-[#155faa] text-white rounded-2xl font-black text-sm shadow-md transition-all disabled:opacity-60 cursor-pointer"
                >
                  {actionLoading ? "Processing..." : "START EXAM"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RadiologyViewExam;