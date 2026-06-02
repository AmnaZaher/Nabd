import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import {
  exportReportPdf,
  getExamDetails,
  type RadiologyExamDetailsDto,
  verifyReport,
} from "../../../api/radiologyResults";

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
      <ellipse cx="100" cy="110" rx="55" ry="65" fill="#1E293B" />
      <ellipse cx="100" cy="108" rx="48" ry="58" fill="#1E293B" stroke={colors.a} strokeWidth="0.5" opacity="0.6" />
      <ellipse cx="100" cy="100" rx="35" ry="42" fill="none" stroke={colors.b} strokeWidth="0.4" opacity="0.5" />
      <path d="M100 60 Q85 90 100 130 Q115 90 100 60Z" fill={colors.a} opacity="0.15" />
      <ellipse cx="82" cy="95" rx="14" ry="18" fill={colors.b} opacity="0.08" />
      <ellipse cx="118" cy="95" rx="14" ry="18" fill={colors.b} opacity="0.08" />
      <line x1="100" y1="55" x2="100" y2="165" stroke={colors.c} strokeWidth="0.3" opacity="0.4" />
      <ellipse cx="92" cy="105" rx="6" ry="10" fill={colors.c} opacity="0.12" />
      <ellipse cx="108" cy="105" rx="6" ry="10" fill={colors.c} opacity="0.12" />
      <path d="M60 85 Q75 78 80 90" stroke={colors.c} strokeWidth="0.3" fill="none" opacity="0.3" />
      <path d="M140 85 Q125 78 120 90" stroke={colors.c} strokeWidth="0.3" fill="none" opacity="0.3" />
      <path d="M65 110 Q78 100 82 115" stroke={colors.c} strokeWidth="0.3" fill="none" opacity="0.3" />
      <path d="M135 110 Q122 100 118 115" stroke={colors.c} strokeWidth="0.3" fill="none" opacity="0.3" />
      <rect x="96" y="150" width="8" height="30" rx="4" fill="#1E293B" stroke={colors.a} strokeWidth="0.4" opacity="0.4" />
      <radialGradient id={`glow-${variant}`}>
        <stop offset="0%" stopColor={colors.b} stopOpacity="0.08" />
        <stop offset="100%" stopColor={colors.b} stopOpacity="0" />
      </radialGradient>
      <circle cx="100" cy="110" r="70" fill={`url(#glow-${variant})`} />
    </svg>
  );
};

const formatDateTime = (value?: string) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString([], {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const mapGalleryVariant = (type?: string): "sagittal" | "axial" | "coronal" => {
  const t = (type || "").toLowerCase();
  if (t.includes("sag")) return "sagittal";
  if (t.includes("cor")) return "coronal";
  return "axial";
};

const RadiologistReviewReport: React.FC<{
  onMenuClick?: () => void;
  onProfileClick?: () => void;
}> = ({ onProfileClick }) => {
  const navigate = useNavigate();
  const { queueId } = useParams<{ queueId: string }>();

  const [galleryView, setGalleryView] = useState<"grid" | "list">("grid");
  const [reviewerNotes, setReviewerNotes] = useState("");
  const [details, setDetails] = useState<RadiologyExamDetailsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      if (!queueId) {
        setError("Missing exam ID.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const data = await getExamDetails(queueId);
        setDetails(data);
      } catch (err: any) {
        setError(err?.message || "Failed to load report details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [queueId]);

  const examHistory = useMemo(
    () =>
      details?.history?.length
        ? details.history.map((h) => ({
            title: h.title || "Exam",
            date: h.date || "—",
            doctor: h.doctor || "—",
            status: ((h.status || "ARCHIVED").toUpperCase() as "CURRENT" | "ARCHIVED"),
          }))
        : [
            {
              title: details?.examType || details?.modality || "Current Exam",
              date: formatDateTime(details?.examDate || details?.scheduledTime),
              doctor: details?.radiologistName || "—",
              status: "CURRENT" as const,
            },
          ],
    [details]
  );

  const galleryImages =
    details?.images?.length
      ? details.images.map((img, index) => ({
          label: (img.type || "AXIAL").toUpperCase(),
          color:
            index % 3 === 0 ? "bg-red-600" : index % 3 === 1 ? "bg-blue-600" : "bg-emerald-600",
          file: img.fileName || `IMG_${index + 1}.DCM`,
          time: formatDateTime(img.createdAt),
          variant: mapGalleryVariant(img.type),
        }))
      : [
          {
            label: "AXIAL",
            color: "bg-blue-600",
            file: "IMG_001.DCM",
            time: "—",
            variant: "axial" as const,
          },
        ];

  const handleDownloadPdf = async () => {
    if (!details?.reportId) return;

    try {
      setActionLoading(true);
      await exportReportPdf(details.reportId);
    } catch (err: any) {
      alert(err?.message || "Failed to download PDF.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!details?.reportId) return;

    try {
      setActionLoading(true);
      await verifyReport(details.reportId);
      navigate("/dashboard/radiology/results");
    } catch (err: any) {
      alert(err?.message || "Failed to approve report.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC]">
      <header className="px-6 md:px-10 py-4 flex items-center justify-between border-b border-slate-100 bg-white sticky top-0 z-30 w-full">
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

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-10 text-sm font-semibold text-slate-500">Loading report...</div>
        ) : error ? (
          <div className="p-10 text-sm font-semibold text-red-500">{error}</div>
        ) : (
          <>
            <div className="px-6 md:px-10 py-6 bg-white border-b border-slate-100">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-start gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                    <UserIcon size={28} className="text-slate-400" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-2xl font-extrabold text-slate-900 uppercase tracking-wide">
                        {details?.patientName || "UNKNOWN PATIENT"}
                      </h2>
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold">
                        ID: {details?.patientFileNumber || details?.fileNumber || details?.patientId || "—"}
                      </span>
                      <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-lg text-xs font-bold">
                        Pending Approval
                      </span>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap text-sm text-slate-500 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Cake size={14} className="text-slate-400" />
                        {details?.age ? `${details.age}y` : "—"}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="flex items-center gap-1.5">
                        <UserIcon size={14} className="text-slate-400" />
                        {details?.gender || "—"}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-slate-400" />
                        {formatDateTime(details?.examDate || details?.scheduledTime)}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="flex items-center gap-1.5 text-blue-600 cursor-pointer hover:text-blue-700 transition-colors">
                        <Microscope size={14} />
                        {details?.examType || details?.modality || "Radiology Exam"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button className="border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer">
                    <Printer size={16} />
                    Print Result
                  </button>
                  <button
                    onClick={handleDownloadPdf}
                    disabled={actionLoading || !details?.reportId}
                    className="border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Download size={16} />
                    Download PDF
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 p-6 md:p-10">
              <div className="w-full lg:w-[40%] space-y-8">
                <div>
                  <div className="flex items-center gap-2 mb-5">
                    <Stethoscope size={20} className="text-blue-600" />
                    <h3 className="text-lg font-extrabold text-slate-900">
                      Exam History
                    </h3>
                  </div>

                  <div className="relative ml-2">
                    <div className="absolute left-[5px] top-2 bottom-2 border-l-2 border-blue-200" />

                    <div className="space-y-6">
                      {examHistory.map((exam, idx) => {
                        const isCurrent = exam.status === "CURRENT";
                        return (
                          <div key={idx} className="relative flex items-start gap-4 pl-6">
                            <div
                              className={`absolute left-0 top-1.5 w-3 h-3 rounded-full ${
                                isCurrent ? "bg-blue-500" : "bg-slate-300"
                              } ring-2 ring-white`}
                            />
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

                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-extrabold text-slate-900">
                        Uploaded Images Gallery
                      </h3>
                      <span className="text-sm text-slate-400 font-medium">
                        ({galleryImages.length} Items)
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
                        <span
                          className={`absolute top-2 left-2 z-10 ${img.color} text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide`}
                        >
                          {img.label}
                        </span>

                        <div className="absolute inset-0">
                          <ScanImage variant={img.variant} />
                        </div>

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

              <div className="w-full lg:w-[60%]">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                  <div className="mb-8">
                    <h3 className="text-xl font-extrabold text-slate-900">
                      Diagnostic Radiology Report
                    </h3>
                    <p className="text-sm text-slate-400 font-medium mt-1">
                      Exam ID: {details?.examId || queueId}
                    </p>
                  </div>

                  <div className="space-y-7">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.15em] text-blue-600 mb-2">
                        CLINICAL INDICATION
                      </p>
                      <p className="text-sm text-slate-600 font-medium leading-relaxed">
                        {details?.clinicalIndication || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.15em] text-blue-600 mb-2">
                        TECHNIQUE
                      </p>
                      <p className="text-sm text-slate-600 font-medium leading-relaxed">
                        {details?.technique || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.15em] text-blue-600 mb-2">
                        FINDINGS
                      </p>
                      <p className="text-sm text-slate-600 font-medium leading-relaxed">
                        {details?.findings || details?.reportContent || "—"}
                      </p>
                    </div>

                    <div className="bg-blue-50/50 border-l-4 border-blue-500 rounded-r-xl p-5">
                      <p className="text-[11px] font-black uppercase tracking-[0.15em] text-blue-600 mb-2">
                        IMPRESSION
                      </p>
                      <p className="text-sm text-slate-600 font-medium leading-relaxed italic">
                        {details?.impression || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 md:px-10 pb-10">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                <div className="flex items-center gap-2 mb-6">
                  <ClipboardEdit size={20} className="text-blue-600" />
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Reviewer Decision &amp; Notes
                  </h3>
                </div>

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

                <div className="flex justify-end gap-4 mt-6">
                  <button className="border border-red-200 text-red-600 bg-white hover:bg-red-50 px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer">
                    <XCircle size={18} />
                    Reject &amp; Return
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading || !details?.reportId}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-sm flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 size={18} />
                    Approve Report
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RadiologistReviewReport;