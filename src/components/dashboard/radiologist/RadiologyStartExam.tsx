import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import TopBar from "../TopBar";
import {
  ChevronRight,
  User,
  ClipboardList,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  Activity
} from "lucide-react";

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

const MOCK_PATIENT_DETAILS: Record<string, Partial<RequestItem>> = {
  "1": {
    patientName: "Johnathan Stevens",
    patientId: "#RAD-99238",
    initials: "JS",
    modality: "MRI - System 01",
    bodyPart: "Spine - Lumbar",
    age: "45 Years",
    gender: "Male",
    nationalId: "992-38-XXXX",
    testType: "MRI Lumbar Spine w/o Contrast",
    referringDr: "Dr. Elena Rossi",
    scheduledTime: "Today, 14:30 PM",
  },
  "2": {
    patientName: "Elena Martinez",
    patientId: "#RAD-88210",
    initials: "EM",
    modality: "X-Ray - Chest System",
    bodyPart: "Chest - PA/Lat",
    age: "38 Years",
    gender: "Female",
    nationalId: "882-10-XXXX",
    testType: "Chest X-Ray PA/Lateral",
    referringDr: "Dr. Sarah Chen",
    scheduledTime: "Today, 15:15 PM",
  }
};

const RadiologyStartExam: React.FC<{
  onMenuClick?: () => void;
  onProfileClick?: () => void;
}> = ({ onMenuClick, onProfileClick }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Resolve dynamic patient details or fallback to default Johnathan Miller
  const details = MOCK_PATIENT_DETAILS[id || "1"] || {
    patientName: "Johnathan Miller",
    patientId: "#HOS-882-90",
    initials: "JM",
    modality: "MRI - System 01",
    bodyPart: "Brain",
    age: "42 Years",
    gender: "Male",
    nationalId: "882-90-XXXX",
    testType: "MRI Brain w/ Contrast",
    referringDr: "Dr. Elena Rossi",
    scheduledTime: "Today, 14:30 PM",
  };

  const breadcrumb = (
    <div className="flex items-center gap-2 text-xs md:text-sm font-extrabold text-slate-400">
      <span>REQUESTS</span>
      <ChevronRight size={14} className="text-slate-300 shrink-0" />
      <span className="text-blue-600 font-black">START EXAM</span>
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
        <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Header Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                Start Radiology Exam
              </h2>
              <p className="text-slate-500 font-semibold text-xs md:text-sm mt-1">
                Initialize imaging session and confirm patient safety protocols.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/dashboard/radiology/requests")}
                className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest cursor-pointer px-3 py-2"
              >
                Cancel Session
              </button>
              <button
                onClick={() => navigate(`/dashboard/radiology/scan/${id || "1"}`)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-md shadow-blue-200 transition-all cursor-pointer hover:translate-x-0.5 active:scale-98"
              >
                <span>Start Exam</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Progress Tracker (Horizontal Pills matching Image 1) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-100/50 p-2.5 rounded-3xl border border-slate-100">
            {/* Step 1 */}
            <div className="bg-white px-5 py-3 rounded-2xl flex items-center justify-center border border-slate-200/40 shadow-sm">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                01. PENDING
              </span>
            </div>

            {/* Step 2 */}
            <div className="bg-blue-600 px-5 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-blue-500/10">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
              <span className="text-xs font-black text-white uppercase tracking-wider">
                03. IN PROGRESS
              </span>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50/50 border border-dashed border-slate-200 px-5 py-3 rounded-2xl flex items-center justify-center">
              <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">
                04. UPLOADED
              </span>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-50/50 border border-dashed border-slate-200 px-5 py-3 rounded-2xl flex items-center justify-center">
              <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">
                05. REPORT
              </span>
            </div>
          </div>

          {/* Core Panels Grid (2 columns: Profile vs Request Details) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Card: Patient Profile (Col span 5) */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between space-y-6">
              
              <div className="flex items-start gap-4">
                {/* Big Avatar Panel */}
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

              {/* Grid Specifications */}
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

              {/* Identity Verified sub-card */}
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

            {/* Right Card: Request Info (Col span 7) */}
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
              
              <div className="flex items-center gap-2 pb-4 border-b border-slate-50 mb-4">
                <ClipboardList size={18} className="text-blue-500" />
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                  Request Information
                </h3>
              </div>

              <div className="space-y-5 flex-1 flex flex-col justify-center">
                {/* Metric 1 */}
                <div className="flex justify-between items-center text-sm">
                  <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[11px]">
                    Test Type
                  </span>
                  <span className="font-extrabold text-slate-800">
                    {details.testType}
                  </span>
                </div>

                {/* Metric 2 */}
                <div className="flex justify-between items-center text-sm">
                  <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[11px]">
                    Modality
                  </span>
                  <span className="px-3 py-1 bg-slate-50 text-slate-600 border border-slate-200 text-xs font-black rounded-lg uppercase tracking-wide">
                    {details.modality}
                  </span>
                </div>

                {/* Metric 3 */}
                <div className="flex justify-between items-center text-sm">
                  <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[11px]">
                    Referring Dr.
                  </span>
                  <span className="font-extrabold text-slate-800">
                    {details.referringDr}
                  </span>
                </div>

                {/* Metric 4 */}
                <div className="flex justify-between items-center text-sm">
                  <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[11px]">
                    Scheduled
                  </span>
                  <span className="font-extrabold text-slate-800">
                    {details.scheduledTime}
                  </span>
                </div>

                {/* Metric 5 */}
                <div className="flex justify-between items-center text-sm">
                  <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[11px]">
                    Request #
                  </span>
                  <span className="font-extrabold text-slate-800">
                    #{id || "2944"}
                  </span>
                </div>
              </div>

            </div>

          </div>

          {/* Bottom Section: Safety Validation Matrix */}
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

            {/* Validation Grid Matrix (Pregnancy, Diabetes, Allergy, Cardiac, Metformin) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              
              {/* Pregnancy */}
              <div className="p-4 bg-emerald-50/20 border border-emerald-100 rounded-2xl flex flex-col justify-between relative overflow-hidden h-[90px]">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Pregnancy
                </span>
                <span className="text-sm font-extrabold text-emerald-700">
                  Negative
                </span>
                <div className="absolute bottom-0 inset-x-0 h-1 bg-emerald-500" />
              </div>

              {/* Diabetes */}
              <div className="p-4 bg-amber-50/20 border border-amber-100 rounded-2xl flex flex-col justify-between relative overflow-hidden h-[90px]">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Diabetes
                </span>
                <span className="text-sm font-extrabold text-amber-700">
                  Negative
                </span>
                <div className="absolute bottom-0 inset-x-0 h-1 bg-amber-500" />
              </div>

              {/* Allergy */}
              <div className="p-4 bg-red-50/20 border border-red-100 rounded-2xl flex flex-col justify-between relative overflow-hidden h-[90px]">
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Contrast Allergy
                  </span>
                  <AlertOctagon size={14} className="text-red-500 shrink-0" />
                </div>
                <span className="text-sm font-extrabold text-red-700">
                  Iodine Sens.
                </span>
                <div className="absolute bottom-0 inset-x-0 h-1 bg-red-500" />
              </div>

              {/* Cardiac */}
              <div className="p-4 bg-emerald-50/20 border border-emerald-100 rounded-2xl flex flex-col justify-between relative overflow-hidden h-[90px]">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Cardiac
                </span>
                <span className="text-sm font-extrabold text-emerald-700">
                  None
                </span>
                <div className="absolute bottom-0 inset-x-0 h-1 bg-emerald-500" />
              </div>

              {/* Metformin */}
              <div className="p-4 bg-amber-50/20 border border-amber-100 rounded-2xl flex flex-col justify-between relative overflow-hidden h-[90px]">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Metformin
                </span>
                <span className="text-sm font-extrabold text-amber-700">
                  Active Use
                </span>
                <div className="absolute bottom-0 inset-x-0 h-1 bg-amber-500" />
              </div>

            </div>

          </div>

        </div>
      </main>
    </div>
  );
};

export default RadiologyStartExam;
