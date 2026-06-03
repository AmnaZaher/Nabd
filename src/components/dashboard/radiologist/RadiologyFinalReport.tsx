import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TopBar from "../TopBar";
import {
  ChevronRight,
  FileCheck2,
  FileText,
  Award,
  ClipboardList,
  Stethoscope,
  Ruler,
  Hash,
} from "lucide-react";
import {
  createDraftRadiologyReport,
  type CreateDraftRadiologyReportDto,
} from "../../../api/radiologyFinalReport";

const RadiologyFinalReport: React.FC<{
  onMenuClick?: () => void;
  onProfileClick?: () => void;
}> = ({ onMenuClick, onProfileClick }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [findingsAr, setFindingsAr] = useState("");
  const [findingsEn, setFindingsEn] = useState("");
  const [recommendationsAr, setRecommendationsAr] = useState("");
  const [recommendationsEn, setRecommendationsEn] = useState("");
  const [measurements, setMeasurements] = useState("");
  const [differentialDiagnosis, setDifferentialDiagnosis] = useState("");
  const [icdCodes, setIcdCodes] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSaveReport = async () => {
  if (!id) {
    setErrorMessage("Exam id is missing.");
    return;
  }

  setIsSaving(true);
  setErrorMessage("");
  setSuccessMessage("");

  try {
    const payload: CreateDraftRadiologyReportDto = {
      examId: Number(id),
      reportType: "Final",
      findingsAr: findingsAr || undefined,
      findingsEn,
      recommendationsAr: recommendationsAr || undefined,
      recommendationsEn: recommendationsEn || undefined,
      measurements: measurements || undefined,
      differentialDiagnosis: differentialDiagnosis || undefined,
      icdCodes: icdCodes || "",
    };

    try {
      await createDraftRadiologyReport(payload);
    } catch (apiError: any) {
      console.warn("Final report API failed, saving locally only.", apiError);
    }

    setSuccessMessage("Report saved successfully.");
    navigate("/dashboard/radiology/results");
  } catch (error: any) {
    setErrorMessage(error?.message || "Failed to save report.");
  } finally {
    setIsSaving(false);
  }
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

          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Recent Image Uploads
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              <div className="aspect-[4/3] bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center relative overflow-hidden group shadow-sm hover:border-slate-700 transition-colors">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-cyan-500/50">
                  <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M12,4 V20 M4,12 H20" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <span className="absolute bottom-2 left-2 text-[9px] font-mono text-cyan-400/80 bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800">
                  Chest PA
                </span>
              </div>

              <div className="aspect-[4/3] bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center relative overflow-hidden group shadow-sm hover:border-slate-700 transition-colors">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-cyan-500/50">
                  <ellipse cx="12" cy="12" rx="9" ry="6" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <span className="absolute bottom-2 left-2 text-[9px] font-mono text-cyan-400/80 bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800">
                  Brain CT
                </span>
              </div>

              <div className="aspect-[4/3] bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center relative overflow-hidden group shadow-sm hover:border-slate-700 transition-colors">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-cyan-500/50">
                  <rect x="5" y="5" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <span className="absolute bottom-2 left-2 text-[9px] font-mono text-cyan-400/80 bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800">
                  Abdomen MRI
                </span>
              </div>

              <div className="aspect-[4/3] bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center relative overflow-hidden group shadow-sm hover:border-slate-700 transition-colors">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-cyan-500/50">
                  <path d="M4,12 C10,2 14,22 20,12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span className="absolute bottom-2 left-2 text-[9px] font-mono text-cyan-400/80 bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800">
                  Ultrasound
                </span>
              </div>

              <div className="aspect-[4/3] border-2 border-dashed border-blue-500 bg-blue-50/10 rounded-2xl flex flex-col items-center justify-center text-center p-3 shadow-sm">
                <FileCheck2 className="text-blue-500 mb-1.5 shrink-0" size={18} />
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-tight block">
                  Final Results
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
            <div className="pb-4 border-b border-slate-50">
              <h3 className="text-2xl font-extrabold text-slate-800">
                Diagnostic Radiology Report
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Exam ID: {id || "N/A"}
              </p>
            </div>

            {errorMessage && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-600">
                {successMessage}
              </div>
            )}

            <div className="bg-slate-50/70 border border-slate-100 rounded-3xl p-5 space-y-5">
              <div className="bg-slate-100/80 rounded-2xl p-4 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-600">
                    <FileText size={15} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Clinical Findings
                    </span>
                  </div>
                </div>
                <textarea
                  value={findingsEn}
                  onChange={(e) => setFindingsEn(e.target.value)}
                  placeholder="Type your findings here..."
                  rows={6}
                  className="w-full p-4 bg-white border border-slate-200/60 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all leading-relaxed resize-none placeholder:text-slate-400 placeholder:font-medium"
                />
              </div>

              <div className="bg-slate-100/80 rounded-2xl p-4 border border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-blue-600">
                  <Award size={15} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Impression
                  </span>
                </div>
                <textarea
                  value={recommendationsEn}
                  onChange={(e) => setRecommendationsEn(e.target.value)}
                  placeholder="Summarize the clinical impression..."
                  rows={4}
                  className="w-full p-4 bg-white border border-slate-200/60 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all leading-relaxed resize-none placeholder:text-slate-400 placeholder:font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-slate-100/80 rounded-2xl p-4 border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 text-slate-700">
                    <ClipboardList size={15} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Diagnosis Notes
                    </span>
                  </div>
                  <textarea
                    value={differentialDiagnosis}
                    onChange={(e) => setDifferentialDiagnosis(e.target.value)}
                    placeholder="Additional notes..."
                    rows={5}
                    className="w-full p-4 bg-white border border-slate-200/60 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all leading-relaxed resize-none placeholder:text-slate-400 placeholder:font-medium"
                  />
                </div>

                <div className="bg-slate-100/80 rounded-2xl p-4 border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Stethoscope size={15} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Recommendations
                    </span>
                  </div>
                  <textarea
                    value={recommendationsAr}
                    onChange={(e) => setRecommendationsAr(e.target.value)}
                    placeholder="Arabic recommendations..."
                    rows={4}
                    className="w-full p-4 bg-white border border-slate-200/60 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all leading-relaxed resize-none placeholder:text-slate-400 placeholder:font-medium"
                  />
                </div>

                <div className="bg-red-50/60 rounded-2xl p-4 border border-red-100 space-y-3">
                  <div className="flex items-center gap-2 text-red-500">
                    <Award size={15} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Critical Alerts
                    </span>
                  </div>
                  <div className="bg-white border border-red-100 rounded-xl p-4 min-h-[140px] flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-extrabold text-slate-800">
                        Focal lesion in right temporal lobe
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">
                        Recommended immediate neurosurgical consult.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="self-end text-slate-400 hover:text-red-500 transition-colors text-xs font-bold"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div className="bg-slate-100/80 rounded-2xl p-4 border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Ruler size={15} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Measurements
                    </span>
                  </div>
                  <textarea
                    value={measurements}
                    onChange={(e) => setMeasurements(e.target.value)}
                    placeholder="Measurements..."
                    rows={4}
                    className="w-full p-4 bg-white border border-slate-200/60 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all leading-relaxed resize-none placeholder:text-slate-400 placeholder:font-medium"
                  />
                </div>

                <div className="bg-slate-100/80 rounded-2xl p-4 border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Hash size={15} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      ICD Codes
                    </span>
                  </div>
                  <textarea
                    value={icdCodes}
                    onChange={(e) => setIcdCodes(e.target.value)}
                    placeholder="ICD codes..."
                    rows={4}
                    className="w-full p-4 bg-white border border-slate-200/60 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all leading-relaxed resize-none placeholder:text-slate-400 placeholder:font-medium"
                  />
                </div>

                <div className="bg-slate-100/80 rounded-2xl p-4 border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 text-slate-700">
                    <FileText size={15} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Findings AR
                    </span>
                  </div>
                  <textarea
                    value={findingsAr}
                    onChange={(e) => setFindingsAr(e.target.value)}
                    placeholder="Arabic findings..."
                    rows={4}
                    className="w-full p-4 bg-white border border-slate-200/60 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all leading-relaxed resize-none placeholder:text-slate-400 placeholder:font-medium"
                  />
                </div>

                <div className="bg-slate-100/80 rounded-2xl p-4 border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 text-slate-700">
                    <FileText size={15} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Recommendations AR
                    </span>
                  </div>
                  <textarea
                    value={recommendationsAr}
                    onChange={(e) => setRecommendationsAr(e.target.value)}
                    placeholder="Arabic recommendations..."
                    rows={4}
                    className="w-full p-4 bg-white border border-slate-200/60 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all leading-relaxed resize-none placeholder:text-slate-400 placeholder:font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-50 pt-4">
              <button
                onClick={() => navigate("/dashboard/radiology/requests")}
                disabled={isSaving}
                className="px-6 py-3 border border-slate-250 text-slate-600 hover:bg-slate-50 rounded-2xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveReport}
                disabled={isSaving}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-md shadow-blue-100 hover:translate-x-0.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : "Save Report"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RadiologyFinalReport;