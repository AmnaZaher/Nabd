import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopBar from "../TopBar";
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  CheckCircle2,
  Hourglass,
  Eye,
  Download,
  FileText,
  Scan,
  Layers,
  Activity,
  User,
} from "lucide-react";

interface PatientData {
  name: string;
  mrn: string;
  caseId: string;
  ageGender: string;
  bloodType: string;
  contact: string;
  lastVisit: string;
  totalExams: number;
  pendingReports: number;
}

const PATIENTS_MOCK: Record<string, PatientData> = {
  "1": {
    name: "Eleanor P. Vance",
    mrn: "992834-X",
    caseId: "RIS-2023-4412",
    ageGender: "64 / Female",
    bloodType: "A+",
    contact: "+1 (555) 012-9983",
    lastVisit: "Oct 24, 2023",
    totalExams: 14,
    pendingReports: 1,
  },
  "2": {
    name: "Arthur Gordon",
    mrn: "992835-Y",
    caseId: "RIS-2023-4413",
    ageGender: "52 / Male",
    bloodType: "O-",
    contact: "+1 (555) 012-8874",
    lastVisit: "Oct 12, 2023",
    totalExams: 12,
    pendingReports: 2,
  },
  "3": {
    name: "Lydia Chen",
    mrn: "992836-Z",
    caseId: "RIS-2023-4414",
    ageGender: "29 / Female",
    bloodType: "B+",
    contact: "+1 (555) 012-7763",
    lastVisit: "Sep 28, 2023",
    totalExams: 8,
    pendingReports: 0,
  },
  default: {
    name: "Jonathan Harker",
    mrn: "992834-X",
    caseId: "RIS-2023-4412",
    ageGender: "42 / Male",
    bloodType: "O+",
    contact: "+1 (555) 012-9983",
    lastVisit: "Oct 24, 2023",
    totalExams: 14,
    pendingReports: 1,
  },
};

interface TimelineItem {
  id: string;
  date: string;
  time: string;
  type: string;
  bodyPart: string;
  icon: any;
  iconColor: string;
  radiologist: string;
  status: "FINALIZED" | "DRAFT";
  statusColor: string;
  approval: "Approved" | "Pending";
  approvalColor: string;
  hasActions: boolean;
}

const TIMELINE_EXAMS: TimelineItem[] = [
  {
    id: "t1",
    date: "Oct 24, 2023",
    time: "09:42 AM",
    type: "MRI",
    bodyPart: "Cranial with Contrast",
    icon: Scan,
    iconColor: "bg-blue-50 text-blue-500",
    radiologist: "Dr. Sarah Jenkins",
    status: "FINALIZED",
    statusColor: "bg-blue-50 text-blue-650",
    approval: "Approved",
    approvalColor: "text-blue-600",
    hasActions: true,
  },
  {
    id: "t2",
    date: "Oct 12, 2023",
    time: "02:15 PM",
    type: "CT Scan",
    bodyPart: "Abdomen / Pelvis",
    icon: Layers,
    iconColor: "bg-purple-50 text-purple-500",
    radiologist: "Dr. Julian Vance",
    status: "DRAFT",
    statusColor: "bg-red-50 text-red-650",
    approval: "Pending",
    approvalColor: "text-red-550",
    hasActions: false,
  },
  {
    id: "t3",
    date: "Sep 28, 2023",
    time: "11:00 AM",
    type: "X-Ray",
    bodyPart: "Chest PA/Lateral",
    icon: Activity,
    iconColor: "bg-emerald-50 text-emerald-500",
    radiologist: "Dr. Emily Chen",
    status: "FINALIZED",
    statusColor: "bg-blue-50 text-blue-650",
    approval: "Approved",
    approvalColor: "text-blue-600",
    hasActions: true,
  },
];

const RadiologistPatientProfile: React.FC<{
  onMenuClick?: () => void;
}> = ({ onMenuClick }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const patient = PATIENTS_MOCK[id || ""] || PATIENTS_MOCK.default;

  const breadcrumb = (
    <div className="flex items-center gap-2 text-sm font-semibold tracking-wide">
      <span
        onClick={() => navigate("/dashboard")}
        className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer uppercase"
      >
        Dashboard
      </span>
      <span className="text-slate-300 font-bold">&rsaquo;</span>
      <span className="text-blue-600 uppercase font-extrabold">Patient Profile</span>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC]">
      <TopBar
        title={breadcrumb}
        onMenuClick={onMenuClick || (() => {})}
        showAddUser={false}
      />

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Back Navigation & Top Info Card */}
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Left Box: Main Patient Details */}
            <div className="flex-1 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100/80 flex flex-col md:flex-row gap-8 items-start md:items-center">
              
              {/* Profile Avatar Container */}
              <div className="w-24 h-24 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 border border-slate-200">
                <User size={40} strokeWidth={1.5} />
              </div>

              {/* Data Layout */}
              <div className="flex-1 space-y-6 w-full">
                
                {/* Header Information */}
                <div>
                  <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
                    {patient.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs font-bold text-slate-400 tracking-wider">
                    <span>MRN: {patient.mrn}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    <span>Case ID: {patient.caseId}</span>
                  </div>
                </div>

                {/* Grid stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-slate-50">
                  
                  {/* Age/Gender */}
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                      Age / Gender
                    </span>
                    <span className="text-sm font-extrabold text-slate-700">
                      {patient.ageGender}
                    </span>
                  </div>

                  {/* Blood Type */}
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                      Blood Type
                    </span>
                    <span className="text-sm font-extrabold text-red-500">
                      {patient.bloodType}
                    </span>
                  </div>

                  {/* Contact */}
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                      Contact
                    </span>
                    <span className="text-sm font-extrabold text-slate-700">
                      {patient.contact}
                    </span>
                  </div>

                  {/* Last Visit */}
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                      Last Visit
                    </span>
                    <span className="text-sm font-extrabold text-slate-700">
                      {patient.lastVisit}
                    </span>
                  </div>

                </div>

              </div>

            </div>

            {/* Right Box: Total & Pending Mini Cards */}
            <div className="w-full lg:w-[320px] grid grid-cols-2 gap-4 shrink-0">
              
              {/* Total Exams */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100/80 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                    Total Exams
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                    <Scan size={16} />
                  </div>
                </div>
                <h3 className="text-3xl font-black text-slate-800 mt-4 tracking-tight">
                  {patient.totalExams}
                </h3>
              </div>

              {/* Pending Reports */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100/80 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                    Pending Reports
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-red-50 text-red-400 flex items-center justify-center shrink-0">
                    <FileText size={16} />
                  </div>
                </div>
                <h3 className="text-3xl font-black text-slate-800 mt-4 tracking-tight">
                  {String(patient.pendingReports).padStart(2, "0")}
                </h3>
              </div>

            </div>

          </div>

          {/* Search, Filter bar */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search imaging history..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-sm font-semibold focus:ring-2 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400"
              />
            </div>
            <button className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:bg-slate-50 transition-all text-slate-500 cursor-pointer">
              <SlidersHorizontal size={18} />
            </button>
          </div>

          {/* Core Content Grid: Imaging Timeline (8 Cols) + Recent Reports (4 Cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Imaging Timeline Table Box */}
            <div className="lg:col-span-8 bg-white rounded-3xl shadow-sm border border-slate-100/80 overflow-hidden flex flex-col">
              <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-800 tracking-wide uppercase">
                  Imaging Timeline
                </h3>
                <span className="text-xs font-bold text-slate-400 tracking-wider">
                  Viewing 1-14 of {patient.totalExams} Exams
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[160px]">
                        Exam Date
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Type / Body Part
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Radiologist
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Status
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Approval
                      </th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-[120px]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {TIMELINE_EXAMS.map((item) => {
                      const isDraft = item.status === "DRAFT";
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/20 transition-colors">
                          
                          {/* Exam Date */}
                          <td className="px-8 py-6">
                            <div className="space-y-1">
                              <span className="text-sm font-extrabold text-slate-800 block">
                                {item.date}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 tracking-wider block">
                                {item.time}
                              </span>
                            </div>
                          </td>

                          {/* Type / Body Part */}
                          <td className="px-6 py-6">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${item.iconColor}`}>
                                <item.icon size={15} />
                              </div>
                              <div>
                                <span className="text-sm font-extrabold text-slate-800 block">
                                  {item.type}
                                </span>
                                <span className="text-[11px] font-medium text-slate-400 block">
                                  {item.bodyPart}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Radiologist */}
                          <td className="px-6 py-6 text-sm font-bold text-slate-650">
                            {item.radiologist}
                          </td>

                          {/* Status */}
                          <td className="px-6 py-6">
                            <span className={`inline-block px-2.5 py-1 rounded-xl text-[9px] font-black tracking-widest uppercase ${item.statusColor}`}>
                              {item.status}
                            </span>
                          </td>

                          {/* Approval */}
                          <td className="px-6 py-6">
                            <div className="flex items-center gap-1.5">
                              {item.approval === "Approved" ? (
                                <CheckCircle2 size={14} className="text-blue-600" />
                              ) : (
                                <Hourglass size={14} className="text-red-450 animate-pulse" />
                              )}
                              <span className={`text-xs font-bold ${item.approvalColor}`}>
                                {item.approval}
                              </span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-8 py-6">
                            <div className="flex items-center justify-center gap-2">
                              {item.hasActions ? (
                                <>
                                  <button
                                    title="View Scan"
                                    className="p-2 text-slate-400 hover:text-blue-650 hover:bg-slate-50 border border-slate-150 rounded-xl transition-all cursor-pointer"
                                  >
                                    <Eye size={15} />
                                  </button>
                                  <button
                                    title="Download Report"
                                    className="p-2 text-slate-400 hover:text-blue-655 hover:bg-slate-50 border border-slate-150 rounded-xl transition-all cursor-pointer"
                                  >
                                    <Download size={15} />
                                  </button>
                                </>
                              ) : (
                                <button className="px-4 py-1.5 text-xs font-black uppercase bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm shadow-blue-50 transition-all cursor-pointer">
                                  Open
                                </button>
                              )}
                            </div>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Reports Box (4 Cols) */}
            <div className="lg:col-span-4 space-y-6">
              
              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100/80 space-y-6">
                
                {/* Section Header */}
                <h3 className="text-sm font-extrabold text-slate-800 tracking-tight pb-1 uppercase">
                  Recent Reports
                </h3>

                {/* Report cards stack */}
                <div className="space-y-4">
                  
                  {/* MRI Brain Report */}
                  <div className="p-5 bg-slate-50/50 hover:bg-blue-50/20 rounded-2xl border border-slate-100 transition-all relative group">
                    <FileText size={16} className="absolute top-5 right-5 text-slate-350" />
                    <h4 className="text-sm font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors pr-6">
                      MRI Brain Report
                    </h4>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed mt-2.5 max-w-[280px]">
                      No acute intracranial hemorrhage or large mass effect identified. Ventricles are within standard limits.
                    </p>
                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100/60">
                      <span className="text-[10px] font-black text-slate-400 tracking-wider">
                        OCT 24, 2023
                      </span>
                      <button className="text-[10px] font-black tracking-wider uppercase text-blue-600 hover:text-blue-800 hover:underline cursor-pointer">
                        Download
                      </button>
                    </div>
                  </div>

                  {/* Chest X-Ray Final */}
                  <div className="p-5 bg-slate-50/50 hover:bg-blue-50/20 rounded-2xl border border-slate-100 transition-all relative group">
                    <FileText size={16} className="absolute top-5 right-5 text-slate-350" />
                    <h4 className="text-sm font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors pr-6">
                      Chest X-Ray Final
                    </h4>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed mt-2.5 max-w-[280px]">
                      Lungs are clear. Heart size is within normal limits. No effusion or consolidations identified.
                    </p>
                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100/60">
                      <span className="text-[10px] font-black text-slate-400 tracking-wider">
                        SEP 28, 2023
                      </span>
                      <button className="text-[10px] font-black tracking-wider uppercase text-blue-600 hover:text-blue-800 hover:underline cursor-pointer">
                        Download
                      </button>
                    </div>
                  </div>

                </div>

                {/* View all button */}
                <button className="w-full py-3 bg-white hover:bg-slate-50 text-slate-600 text-xs font-black uppercase tracking-wider rounded-2xl border border-slate-200 transition-all cursor-pointer text-center">
                  View All Reports ({patient.totalExams})
                </button>

              </div>

            </div>

          </div>

        </div>
      </main>
    </div>
  );
};

export default RadiologistPatientProfile;
