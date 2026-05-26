import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  User as UserIcon,
  Cake,
  Calendar,
  Microscope,
  Printer,
  Download,
  Stethoscope,
  LayoutGrid,
  List,
  Trash2,
  ClipboardEdit,
  XCircle,
  CheckCircle2,
} from "lucide-react";

/* ─── Scan Placeholder SVG ───────────────────────────────── */

const ScanImage: React.FC<{ variant: "sagittal" | "axial" | "coronal" }> = ({
  variant,
}) => {
  const colors =
    variant === "sagittal"
      ? { a: "#4338CA", b: "#6366F1", c: "#818CF8" }
      : variant === "axial"
      ? { a: "#1E40AF", b: "#3B82F6", c: "#60A5FA" }
      : { a: "#065F46", b: "#10B981", c: "#34D399" };

  return (
    <svg
      viewBox="0 0 200 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <rect width="200" height="260" fill="#0F172A" />
      {/* Brain outline */}
      <ellipse cx="100" cy="110" rx="55" ry="65" fill="#1E293B" />
      <ellipse cx="100" cy="108" rx="48" ry="58" fill="#1E293B" stroke={colors.a} strokeWidth="0.5" opacity="0.6" />
      {/* Internal structures */}
      <ellipse cx="100" cy="100" rx="35" ry="42" fill="none" stroke={colors.b} strokeWidth="0.4" opacity="0.5" />
      <path d="M100 60 Q85 90 100 130 Q115 90 100 60Z" fill={colors.a} opacity="0.15" />
      <ellipse cx="82" cy="95" rx="14" ry="18" fill={colors.b} opacity="0.08" />
      <ellipse cx="118" cy="95" rx="14" ry="18" fill={colors.b} opacity="0.08" />
      {/* Midline */}
      <line x1="100" y1="55" x2="100" y2="165" stroke={colors.c} strokeWidth="0.3" opacity="0.4" />
      {/* Ventricles */}
      <ellipse cx="92" cy="105" rx="6" ry="10" fill={colors.c} opacity="0.12" />
      <ellipse cx="108" cy="105" rx="6" ry="10" fill={colors.c} opacity="0.12" />
      {/* Cortical folds */}
      <path d="M60 85 Q75 78 80 90" stroke={colors.c} strokeWidth="0.3" fill="none" opacity="0.3" />
      <path d="M140 85 Q125 78 120 90" stroke={colors.c} strokeWidth="0.3" fill="none" opacity="0.3" />
      <path d="M65 110 Q78 100 82 115" stroke={colors.c} strokeWidth="0.3" fill="none" opacity="0.3" />
      <path d="M135 110 Q122 100 118 115" stroke={colors.c} strokeWidth="0.3" fill="none" opacity="0.3" />
      {/* Spinal region */}
      <rect x="96" y="150" width="8" height="30" rx="4" fill="#1E293B" stroke={colors.a} strokeWidth="0.4" opacity="0.4" />
      {/* Radial glow */}
      <radialGradient id={`glow-${variant}`}>
        <stop offset="0%" stopColor={colors.b} stopOpacity="0.08" />
        <stop offset="100%" stopColor={colors.b} stopOpacity="0" />
      </radialGradient>
      <circle cx="100" cy="110" r="70" fill={`url(#glow-${variant})`} />
    </svg>
  );
};

/* ─── Component ──────────────────────────────────────────── */

const RadiologistReviewReport: React.FC<{
  onMenuClick?: () => void;
  onProfileClick?: () => void;
}> = ({ onProfileClick }) => {
  const navigate = useNavigate();
  const [galleryView, setGalleryView] = useState<"grid" | "list">("grid");
  const [reviewerNotes, setReviewerNotes] = useState("");

  /* ── Timeline data ── */
  const examHistory = [
    {
      title: "Chest MRI w/ Contrast",
      date: "Oct 12, 2023",
      doctor: "Dr. Aris Thorne",
      status: "CURRENT" as const,
    },
    {
      title: "Abdominal Ultrasound",
      date: "May 24, 2023",
      doctor: "Dr. Julia Kim",
      status: "ARCHIVED" as const,
    },
    {
      title: "Standard M-Ray Chest",
      date: "Jan 12, 2023",
      doctor: "Dr. Marcus Chen",
      status: "ARCHIVED" as const,
    },
  ];

  /* ── Image gallery data ── */
  const galleryImages: {
    label: string;
    color: string;
    file: string;
    time: string;
    variant: "sagittal" | "axial" | "coronal";
  }[] = [
    {
      label: "SAGITTAL",
      color: "bg-red-600",
      file: "IMG_001.DCM",
      time: "10:45 AM",
      variant: "sagittal",
    },
    {
      label: "AXIAL",
      color: "bg-blue-600",
      file: "IMG_002.DCM",
      time: "10:46 AM",
      variant: "axial",
    },
    {
      label: "CORONAL",
      color: "bg-emerald-600",
      file: "IMG_003.DCM",
      time: "10:47 AM",
      variant: "coronal",
    },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC]">
      {/* ══════════ 1. Custom Header Bar ══════════ */}
      <header className="px-6 md:px-10 py-4 flex items-center justify-between border-b border-slate-100 bg-white sticky top-0 z-30 w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2">
          <button
            onClick={() => navigate("/dashboard/radiology/results")}
            className="text-slate-400 font-bold uppercase tracking-wider text-xs hover:text-slate-600 transition-colors cursor-pointer"
          >
            RESULTS
          </button>
          <ChevronRight size={14} className="text-slate-300" />
          <span className="text-blue-600 font-bold uppercase tracking-wider text-xs">
            REVIEW REPORT
          </span>
        </nav>

        {/* Profile */}
        <div
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={onProfileClick}
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900 leading-tight">
              Dr. Alex Rivers
            </p>
            <p className="text-[10px] text-slate-500 font-medium">
              Senior Technician
            </p>
          </div>
          <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl overflow-hidden border-2 border-white shadow-sm bg-slate-50 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-500">
              <UserIcon size={20} />
            </div>
          </div>
        </div>
      </header>

      {/* ══════════ Scrollable Content ══════════ */}
      <div className="flex-1 overflow-y-auto">
        {/* ══════════ 2. Patient Info Banner ══════════ */}
        <div className="px-6 md:px-10 py-6 bg-white border-b border-slate-100">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left */}
            <div className="flex items-start gap-5">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                <UserIcon size={28} className="text-slate-400" />
              </div>

              <div className="space-y-2">
                {/* Name + badges */}
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl font-extrabold text-slate-900 uppercase tracking-wide">
                    ELIAS VANCE
                  </h2>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold">
                    ID: 9823-RX
                  </span>
                  <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-lg text-xs font-bold">
                    Pending Approval
                  </span>
                </div>

                {/* Demographic pills */}
                <div className="flex items-center gap-3 flex-wrap text-sm text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Cake size={14} className="text-slate-400" />
                    42y 5m
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="flex items-center gap-1.5">
                    <UserIcon size={14} className="text-slate-400" />
                    Male
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-slate-400" />
                    Oct 24, 2023 · 14:30
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="flex items-center gap-1.5 text-blue-600 cursor-pointer hover:text-blue-700 transition-colors">
                    <Microscope size={14} />
                    Chest CT with Contrast
                  </span>
                </div>
              </div>
            </div>

            {/* Right — action buttons */}
            <div className="flex items-center gap-3 shrink-0">
              <button className="border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer">
                <Printer size={16} />
                Print Result
              </button>
              <button className="border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer">
                <Download size={16} />
                Download PDF
              </button>
            </div>
          </div>
        </div>

        {/* ══════════ 3. Main Content Area ══════════ */}
        <div className="flex flex-col lg:flex-row gap-8 p-6 md:p-10">
          {/* ── Left Column (~40%) ── */}
          <div className="w-full lg:w-[40%] space-y-8">
            {/* Exam History */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <Stethoscope size={20} className="text-blue-600" />
                <h3 className="text-lg font-extrabold text-slate-900">
                  Exam History
                </h3>
              </div>

              <div className="relative ml-2">
                {/* Vertical line */}
                <div className="absolute left-[5px] top-2 bottom-2 border-l-2 border-blue-200" />

                <div className="space-y-6">
                  {examHistory.map((exam, idx) => {
                    const isCurrent = exam.status === "CURRENT";
                    return (
                      <div key={idx} className="relative flex items-start gap-4 pl-6">
                        {/* Dot */}
                        <div
                          className={`absolute left-0 top-1.5 w-3 h-3 rounded-full ${
                            isCurrent ? "bg-blue-500" : "bg-slate-300"
                          } ring-2 ring-white`}
                        />
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-extrabold text-slate-800">
                              {exam.title}
                            </span>
                            <span
                              className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase ${
                                isCurrent
                                  ? "bg-blue-600 text-white"
                                  : "bg-slate-200 text-slate-500"
                              }`}
                            >
                              {exam.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">
                            {exam.date} • {exam.doctor}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Uploaded Images Gallery */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Uploaded Images Gallery
                  </h3>
                  <span className="text-sm text-slate-400 font-medium">
                    (12 Items)
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setGalleryView("grid")}
                    className={`p-2 rounded-lg transition-colors cursor-pointer ${
                      galleryView === "grid"
                        ? "bg-blue-50 text-blue-600"
                        : "text-slate-400 hover:bg-slate-100"
                    }`}
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button
                    onClick={() => setGalleryView("list")}
                    className={`p-2 rounded-lg transition-colors cursor-pointer ${
                      galleryView === "list"
                        ? "bg-blue-50 text-blue-600"
                        : "text-slate-400 hover:bg-slate-100"
                    }`}
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {galleryImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-xl overflow-hidden bg-slate-900 aspect-[4/5] group"
                  >
                    {/* Label badge */}
                    <span
                      className={`absolute top-2 left-2 z-10 ${img.color} text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide`}
                    >
                      {img.label}
                    </span>

                    {/* Scan image */}
                    <div className="absolute inset-0">
                      <ScanImage variant={img.variant} />
                    </div>

                    {/* Bottom overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-10 pb-3 px-3">
                      <p className="text-[11px] font-bold text-white truncate">
                        {img.file}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {img.time}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <button className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer">
                          Edit Notes
                        </button>
                        <button className="p-1 text-red-400 hover:text-red-300 transition-colors cursor-pointer">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right Column (~60%) ── */}
          <div className="w-full lg:w-[60%]">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
              {/* Report header */}
              <div className="mb-8">
                <h3 className="text-xl font-extrabold text-slate-900">
                  Diagnostic Radiology Report
                </h3>
                <p className="text-sm text-slate-400 font-medium mt-1">
                  Exam ID: RAD-9928-MRI
                </p>
              </div>

              {/* Report body */}
              <div className="space-y-7">
                {/* CLINICAL INDICATION */}
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.15em] text-blue-600 mb-2">
                    CLINICAL INDICATION
                  </p>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">
                    Persistent cough and chest discomfort for three weeks.
                    History of moderate hypertension. Previous imaging (Jan
                    2023) showed clear pulmonary fields.
                  </p>
                </div>

                {/* TECHNIQUE */}
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.15em] text-blue-600 mb-2">
                    TECHNIQUE
                  </p>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">
                    Multi-planar, multi-sequence MRI of the thorax was performed
                    before and after the administration of intravenous
                    Gadolinium. Coronal and axial T1 and T2 weighted images were
                    obtained.
                  </p>
                </div>

                {/* FINDINGS */}
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.15em] text-blue-600 mb-2">
                    FINDINGS
                  </p>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">
                    Lungs: No focal consolidate or suspicious pulmonary mass.
                    Trace bilateral pleural effusions, unchanged from baseline.
                    Mild interstitial prominence in the lower lobes bilaterally.
                  </p>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed mt-3">
                    Mediastinum: Heart size is within normal limits. No evidence
                    of hilar or mediastinal lymphadenopathy. The aorta and major
                    vessels demonstrate normal caliber.
                  </p>
                </div>

                {/* IMPRESSION */}
                <div className="bg-blue-50/50 border-l-4 border-blue-500 rounded-r-xl p-5">
                  <p className="text-[11px] font-black uppercase tracking-[0.15em] text-blue-600 mb-2">
                    IMPRESSION
                  </p>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed italic">
                    &ldquo;1. No evidence of acute pulmonary process. 2. Stable
                    cardiovascular configuration. 3. Minor non-specific
                    interstitial changes, likely inflammatory. Clinical
                    correlation suggested.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════ 4. Reviewer Decision & Notes ══════════ */}
        <div className="px-6 md:px-10 pb-10">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6">
              <ClipboardEdit size={20} className="text-blue-600" />
              <h3 className="text-lg font-extrabold text-slate-900">
                Reviewer Decision &amp; Notes
              </h3>
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-bold text-slate-700 mb-2 block">
                Internal Reviewer Notes
              </label>
              <textarea
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
                placeholder="Add confidential notes for the team or feedback for the radiologist..."
                className="w-full min-h-[120px] border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all resize-y"
              />
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-4 mt-6">
              <button className="border border-red-200 text-red-600 bg-white hover:bg-red-50 px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer">
                <XCircle size={18} />
                Reject &amp; Return
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-sm flex items-center gap-2 transition-colors cursor-pointer">
                <CheckCircle2 size={18} />
                Approve Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadiologistReviewReport;
