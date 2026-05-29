import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TopBar from "../TopBar";
import {
  ChevronRight,
  FileCheck2,
  FileText,
  Activity,
  Award,
  Settings,
  HelpCircle,
  FileSpreadsheet
} from "lucide-react";

const RadiologyFinalReport: React.FC<{
  onMenuClick?: () => void;
  onProfileClick?: () => void;
}> = ({ onMenuClick, onProfileClick }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Diagnostic Report Text States
  const [findings, setFindings] = useState("");
  const [indication, setIndication] = useState("");
  const [technique, setTechnique] = useState("");
  const [impression, setImpression] = useState("");

  const handleSaveReport = () => {
    // Navigate back to the existing RadiologistResults page
    navigate("/dashboard/radiology/results");
  };

  const breadcrumb = (
    <div className="flex items-center gap-2 text-xs md:text-sm font-extrabold text-slate-400">
      <span>REQUESTS</span>
      <ChevronRight size={14} className="text-slate-300 shrink-0" />
      <span className="text-slate-400 font-bold uppercase">START EXAM</span>
      <ChevronRight size={14} className="text-slate-300 shrink-0" />
      <span className="text-blue-600 font-black">FINAL REPORT</span>
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
          
          {/* Progress Tracker (Matching Screen 4) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-100/50 p-2.5 rounded-3xl border border-slate-200/40">
            <div className="bg-white px-5 py-3 rounded-2xl flex items-center justify-center border border-slate-200/40 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">01. PENDING</span>
            </div>
            <div className="bg-white px-5 py-3 rounded-2xl flex items-center justify-center border border-slate-200/40 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">03. IN PROGRESS</span>
            </div>
            <div className="bg-white px-5 py-3 rounded-2xl flex items-center justify-center border border-slate-200/40 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">04. UPLOADED</span>
            </div>
            <div className="bg-blue-600 px-5 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-blue-500/10">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
              <span className="text-xs font-black text-white uppercase tracking-wider">05. REPORTING</span>
            </div>
          </div>

          {/* Top Row: Recent Image Uploads */}
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Recent Image Uploads
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {/* Scan 1 */}
              <div className="aspect-[4/3] bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center relative overflow-hidden group shadow-sm hover:border-slate-700 transition-colors">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-cyan-500/50">
                  <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M12,4 V20 M4,12 H20" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <span className="absolute bottom-2 left-2 text-[9px] font-mono text-cyan-400/80 bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800">
                  Chest PA
                </span>
              </div>

              {/* Scan 2 */}
              <div className="aspect-[4/3] bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center relative overflow-hidden group shadow-sm hover:border-slate-700 transition-colors">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-cyan-500/50">
                  <ellipse cx="12" cy="12" rx="9" ry="6" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <span className="absolute bottom-2 left-2 text-[9px] font-mono text-cyan-400/80 bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800">
                  Brain CT
                </span>
              </div>

              {/* Scan 3 */}
              <div className="aspect-[4/3] bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center relative overflow-hidden group shadow-sm hover:border-slate-700 transition-colors">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-cyan-500/50">
                  <rect x="5" y="5" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <span className="absolute bottom-2 left-2 text-[9px] font-mono text-cyan-400/80 bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800">
                  Abdomen MRI
                </span>
              </div>

              {/* Scan 4 */}
              <div className="aspect-[4/3] bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center relative overflow-hidden group shadow-sm hover:border-slate-700 transition-colors">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-cyan-500/50">
                  <path d="M4,12 C10,2 14,22 20,12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span className="absolute bottom-2 left-2 text-[9px] font-mono text-cyan-400/80 bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800">
                  Ultrasound
                </span>
              </div>

              {/* Final Results box */}
              <div className="aspect-[4/3] border-2 border-dashed border-blue-500 bg-blue-50/10 rounded-2xl flex flex-col items-center justify-center text-center p-3 shadow-sm">
                <FileCheck2 className="text-blue-500 mb-1.5 shrink-0" size={18} />
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-tight block">
                  Final Results
                </span>
              </div>
            </div>
          </div>

          {/* Form Editor Card */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
            
            <div className="pb-4 border-b border-slate-50">
              <h3 className="text-2xl font-extrabold text-slate-800">
                Diagnostic Radiology Report
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Exam ID: RAD-9928-MRI
              </p>
            </div>

            {/* 2x2 Grid Form Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Findings */}
              <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-2xl space-y-2 flex flex-col">
                <div className="flex items-center gap-2 text-blue-600">
                  <FileText size={15} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Findings
                  </span>
                </div>
                <textarea
                  value={findings}
                  onChange={(e) => setFindings(e.target.value)}
                  placeholder="Start typing detailed clinical observations here..."
                  rows={6}
                  className="w-full flex-1 p-4 bg-white border border-slate-200/60 rounded-xl text-xs font-semibold text-slate-650 focus:outline-none focus:ring-2 focus:ring-blue-500/10 outline-none transition-all leading-relaxed resize-none placeholder:text-slate-400 placeholder:font-medium"
                />
              </div>

              {/* Clinical Indication */}
              <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-2xl space-y-2 flex flex-col">
                <div className="flex items-center gap-2 text-blue-600">
                  <Activity size={15} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Clinical Indication
                  </span>
                </div>
                <textarea
                  value={indication}
                  onChange={(e) => setIndication(e.target.value)}
                  placeholder="Start typing detailed clinical observations here..."
                  rows={6}
                  className="w-full flex-1 p-4 bg-white border border-slate-200/60 rounded-xl text-xs font-semibold text-slate-650 focus:outline-none focus:ring-2 focus:ring-blue-500/10 outline-none transition-all leading-relaxed resize-none placeholder:text-slate-400 placeholder:font-medium"
                />
              </div>

              {/* Technique */}
              <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-2xl space-y-2 flex flex-col">
                <div className="flex items-center gap-2 text-blue-600">
                  <Settings size={15} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Technique
                  </span>
                </div>
                <textarea
                  value={technique}
                  onChange={(e) => setTechnique(e.target.value)}
                  placeholder="Start typing detailed clinical observations here..."
                  rows={6}
                  className="w-full flex-1 p-4 bg-white border border-slate-200/60 rounded-xl text-xs font-semibold text-slate-650 focus:outline-none focus:ring-2 focus:ring-blue-500/10 outline-none transition-all leading-relaxed resize-none placeholder:text-slate-400 placeholder:font-medium"
                />
              </div>

              {/* Impression */}
              <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-2xl space-y-2 flex flex-col">
                <div className="flex items-center gap-2 text-blue-600">
                  <Award size={15} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Impression
                  </span>
                </div>
                <textarea
                  value={impression}
                  onChange={(e) => setImpression(e.target.value)}
                  placeholder="Start typing detailed clinical observations here..."
                  rows={6}
                  className="w-full flex-1 p-4 bg-white border border-slate-200/60 rounded-xl text-xs font-semibold text-slate-650 focus:outline-none focus:ring-2 focus:ring-blue-500/10 outline-none transition-all leading-relaxed resize-none placeholder:text-slate-400 placeholder:font-medium"
                />
              </div>

            </div>

            {/* Bottom Actions footer */}
            <div className="flex justify-end gap-3 border-t border-slate-50 pt-4">
              <button
                onClick={() => navigate("/dashboard/radiology/requests")}
                className="px-6 py-3 border border-slate-250 text-slate-600 hover:bg-slate-50 rounded-2xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveReport}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-md shadow-blue-100 hover:translate-x-0.5 transition-all cursor-pointer"
              >
                Save Report
              </button>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
};

export default RadiologyFinalReport;
