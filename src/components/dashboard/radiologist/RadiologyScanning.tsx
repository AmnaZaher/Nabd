import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TopBar from "../TopBar";
import {
  ChevronRight,
  User,
  Info,
  Clock,
  Upload,
  RefreshCw,
  Check,
  Trash2,
} from "lucide-react";
import {
  removeAllRadiologyImages,
  softDeleteRadiologyImage,
  uploadRadiologyImage,
  getExamDetails,
  type ExamDetails,
} from "../../../api/radiologyScanning";

interface SliceImage {
  id: string;
  sliceNumber: string;
  type: string;
  thickness: string;
  status: "processing" | "completed";
  svgData: string;
  imageId?: string;
  fileName?: string;
}

const RadiologyScanning: React.FC<{
  onMenuClick?: () => void;
  onProfileClick?: () => void;
}> = ({ onMenuClick, onProfileClick }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Exam details state
  const [examDetails, setExamDetails] = useState<ExamDetails | null>(null);
  const [isLoadingExam, setIsLoadingExam] = useState(false);
  const [examError, setExamError] = useState<string>("");

  const [imageQueue, setImageQueue] = useState<SliceImage[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(265);
  const [isScanning, setIsScanning] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [removingAll, setRemovingAll] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);

  // Fetch exam details on mount
  useEffect(() => {
    const loadExamDetails = async () => {
      if (!id) return;

      setIsLoadingExam(true);
      setExamError("");

      try {
        const data = await getExamDetails(id);
        setExamDetails(data);
      } catch (error: any) {
        setExamError(error?.message || "Failed to load exam details.");
      } finally {
        setIsLoadingExam(false);
      }
    };

    loadExamDetails();
  }, [id]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;

    if (isScanning) {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isScanning]);

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, "0")} : ${String(secs).padStart(2, "0")}`;
  };

  const getSliceSvgData = (index: number) => {
    const shapes = [
      "M6,10 A6,6 0 0,0 18,10",
      "M8,8 C12,12 12,6 16,10",
      "M4,12 C12,2 12,18 20,12",
      "M5,9 C10,4 14,14 19,9",
      "M7,12 C10,6 14,6 17,12",
      "M5,11 Q12,4 19,11",
      "M6,13 Q12,6 18,13",
      "M7,9 A5,5 0 0,1 17,9",
      "M5,10 C9,5 15,5 19,10",
      "M6,12 C10,8 14,8 18,12",
      "M5,8 Q12,14 19,8",
      "M4,10 C8,3 16,3 20,10",
    ];

    return shapes[index % shapes.length];
  };

  const buildQueueItem = (file: File, index: number, returnedId?: number): SliceImage => {
    const sliceIndex = index + 1;
    return {
      id: `${returnedId ?? file.name}-${sliceIndex}`,
      imageId: returnedId ? String(returnedId) : undefined,
      fileName: file.name,
      sliceNumber: `Slice ${String(sliceIndex).padStart(2, "0")}/12`,
      type: "T2 Weighted",
      thickness: "0.8mm",
      status: "completed",
      svgData: getSliceSvgData(index),
    };
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const handleUploadImages = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length || !id) return;

    try {
      setUploading(true);

      const nextItems: SliceImage[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const result = await uploadRadiologyImage(id, file, new Date().toISOString(), file.name);

        nextItems.push(buildQueueItem(file, imageQueue.length + i, result.id ?? result.imageId));
      }

      setImageQueue((prev) => [...prev, ...nextItems]);
    } catch (error: any) {
      alert(error?.message || "Failed to upload images.");
    } finally {
      setUploading(false);
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  const handleDeleteImage = async (imageId?: string, localId?: string) => {
    if (!imageId && !localId) return;

    const confirmed = window.confirm("Are you sure you want to delete this image?");
    if (!confirmed) return;

    try {
      setDeletingImageId(imageId || localId || null);

      if (imageId) {
        await softDeleteRadiologyImage(imageId);
      }

      setImageQueue((prev) => prev.filter((item) => item.id !== localId && item.imageId !== imageId));
    } catch (error: any) {
      alert(error?.message || "Failed to delete image.");
    } finally {
      setDeletingImageId(null);
    }
  };

  const handleRetakeAll = async () => {
    if (!id) return;

    const confirmed = window.confirm("Are you sure you want to remove all uploaded images?");
    if (!confirmed) return;

    try {
      setRemovingAll(true);
      await removeAllRadiologyImages(id);
      setImageQueue([]);
    } catch (error: any) {
      alert(error?.message || "Failed to remove all images.");
    } finally {
      setRemovingAll(false);
    }
  };

  // Helper functions to extract patient/exam data
  const getPatientName = () => {
    return examDetails?.patient?.name || examDetails?.patientName || "Elena Richardson";
  };

  const getPatientId = () => {
    return (
      examDetails?.patient?.patientId ||
      examDetails?.patient?.fileNumber ||
      examDetails?.patientFileNumber ||
      examDetails?.patientId ||
      "PR-9920-X"
    );
  };

  const getPatientAge = () => {
    return examDetails?.patient?.age || examDetails?.patientAge || 68;
  };

  const getPatientGender = () => {
    return examDetails?.patient?.gender || examDetails?.patientGender || "Female";
  };

  const getPatientWeight = () => {
    return examDetails?.patient?.weight || examDetails?.patientWeight || 62.5;
  };

  const getVisitNumber = () => {
    return examDetails?.visitNumber || examDetails?.requestNumber || "#VS-2023-0442";
  };

  const getVisitDate = () => {
    const dateStr = examDetails?.visitDate || examDetails?.examDate || examDetails?.createdAt;
    if (dateStr) {
      try {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      } catch {
        return "Oct 24, 2023";
      }
    }
    return "Oct 24, 2023";
  };

  const getDoctorName = () => {
    return examDetails?.doctor || examDetails?.doctorName || "Dr. Sarah Chen";
  };

  const getMedicalNotes = () => {
    return (
      examDetails?.medicalNotes ||
      examDetails?.notes ||
      "Patient reports persistent lower back pain for 3 weeks. History of mild scoliosis. Allergic to iodine-based contrast agents. Requires assistance moving to prone position."
    );
  };

  const getExamTitle = () => {
    return examDetails?.examTitle || examDetails?.examType || "Lumbar Spine MRI";
  };

  const getProtocol = () => {
    return examDetails?.protocol || "L-SPINE_W_O_CONTRAST_T2_SAG";
  };

  const getTechnicianNote = () => {
    return (
      examDetails?.technicianNote ||
      "Ensure patient's spine is aligned with the center mark of the coil. Use leg bolsters for comfort."
    );
  };

  const breadcrumb = (
    <div className="flex items-center gap-2 text-xs md:text-sm font-extrabold text-slate-400">
      <button
        className="hover:text-blue-600 transition-colors cursor-pointer"
        onClick={() => navigate("/dashboard/radiology/requests")}
      >
        REQUESTS
      </button>
      <ChevronRight size={14} className="text-slate-300 shrink-0" />
      <span className="text-blue-600 font-bold uppercase">
        START EXAM
      </span>
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

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleUploadImages}
      />

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-100/50 p-2.5 rounded-3xl border border-slate-200/40 mb-6">
            <div className="bg-white px-5 py-3 rounded-2xl flex items-center justify-center border border-slate-200/40 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">01. PENDING</span>
            </div>
            <div className="bg-white px-5 py-3 rounded-2xl flex items-center justify-center border border-slate-200/40 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">03. IN PROGRESS</span>
            </div>
            <div className="bg-blue-600 px-5 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-blue-500/10">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
              <span className="text-xs font-black text-white uppercase tracking-wider">04. UPLOADED</span>
            </div>
            <div className="bg-slate-50/50 border border-dashed border-slate-200 px-5 py-3 rounded-2xl flex items-center justify-center">
              <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">05. REPORTING</span>
            </div>
          </div>

          {examError && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {examError}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT PANEL - Patient Info */}
            <div className="lg:col-span-3 bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between space-y-6">
              {isLoadingExam ? (
                <div className="space-y-5 animate-pulse">
                  <div className="flex flex-col items-center text-center p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
                    <div className="w-14 h-14 rounded-2xl bg-slate-200 mb-3" />
                    <div className="h-5 w-32 bg-slate-200 rounded mb-2" />
                    <div className="h-3 w-24 bg-slate-200 rounded" />
                  </div>
                  <div className="space-y-3.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex justify-between items-center py-1.5 border-b border-slate-50">
                        <div className="h-3 w-16 bg-slate-200 rounded" />
                        <div className="h-3 w-20 bg-slate-200 rounded" />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-24 bg-slate-200 rounded" />
                    <div className="h-20 w-full bg-slate-200 rounded-xl" />
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex flex-col items-center text-center p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0 mb-3">
                      <User size={24} className="text-blue-500" />
                    </div>
                    <h3 className="text-base font-extrabold text-slate-800 leading-tight">
                      {getPatientName()}
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">
                      ID: {getPatientId()}
                    </span>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                      <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">
                        Age / Gender
                      </span>
                      <span className="font-extrabold text-slate-700">
                        {getPatientAge()}Y / {getPatientGender()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                      <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">
                        Weight
                      </span>
                      <span className="font-extrabold text-slate-700">{getPatientWeight()} kg</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                      <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">
                        Visit Number
                      </span>
                      <span className="font-extrabold text-slate-700">{getVisitNumber()}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                      <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">
                        Visit Date
                      </span>
                      <span className="font-extrabold text-slate-700">{getVisitDate()}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">
                        Doctor
                      </span>
                      <span className="font-extrabold text-slate-700">{getDoctorName()}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                      Medical Notes
                    </span>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[11px] leading-relaxed font-semibold text-slate-500">
                      {getMedicalNotes()}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* CENTER PANEL - Scan Viewport */}
            <div className="lg:col-span-6 bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between space-y-6">
              <div className="flex items-center justify-between bg-slate-50/50 p-4 border border-slate-100 rounded-2xl">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full bg-blue-600 ${isScanning ? "animate-ping" : ""}`} />
                  <span className="text-xs font-black text-blue-600 uppercase tracking-widest">
                    Scanning in Progress
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 font-extrabold text-xs">
                  <Clock size={14} className="text-slate-400 shrink-0" />
                  <span>Time Elapsed:</span>
                  <span className="font-black text-blue-600 tabular-nums">{formatTime(elapsedSeconds)}</span>
                </div>
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span className="w-2 h-2 rounded-full bg-slate-200" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-0.5">
                  {isLoadingExam ? (
                    <>
                      <div className="h-7 w-48 bg-slate-200 rounded animate-pulse" />
                      <div className="h-4 w-64 bg-slate-200 rounded animate-pulse mt-2" />
                    </>
                  ) : (
                    <>
                      <h3 className="text-xl font-extrabold text-slate-800">{getExamTitle()}</h3>
                      <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">
                        Protocol: {getProtocol()}
                      </p>
                    </>
                  )}
                </div>

                <div className="bg-blue-50/30 border border-blue-100/50 p-3.5 rounded-xl flex gap-3 items-start">
                  <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-black text-blue-800 uppercase tracking-wider">
                      Technician Note
                    </p>
                    {isLoadingExam ? (
                      <div className="h-8 w-full bg-blue-100 rounded animate-pulse" />
                    ) : (
                      <p className="text-[11px] text-blue-600 font-bold leading-relaxed">
                        {getTechnicianNote()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="relative aspect-[4/3] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center group">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20 pointer-events-none" />
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-500/50 shadow-md shadow-blue-500/50 pointer-events-none" />
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-blue-500/50 shadow-md shadow-blue-500/50 pointer-events-none" />
                <div className="absolute left-0 right-0 h-1 bg-cyan-400/80 shadow-lg shadow-cyan-400/80 animate-[bounce_5s_infinite] pointer-events-none" />

                <div className="absolute inset-4 pointer-events-none flex flex-col justify-between text-[10px] font-mono text-cyan-400/60 uppercase tracking-wider z-10">
                  <div className="flex justify-between items-start">
                    <span className="bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800">REC [04:22]</span>
                    <span className="bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800">1024 x 1024 | 16-BIT</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800">FOV: 240mm</span>
                    <span className="bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800">SAR: 1.2 W/kg</span>
                  </div>
                </div>

                <div className="w-[30%] opacity-85 hover:scale-105 transition-transform duration-500">
                  <svg viewBox="0 0 100 200" fill="none" className="w-full h-auto text-cyan-500 filter drop-shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                    <path d="M 50 10 Q 55 15 50 20 Q 45 25 50 30 Q 55 35 50 40 Q 45 45 50 50 Q 55 55 50 60 Q 45 65 50 70 Q 55 75 50 80 Q 45 85 50 90 Q 55 95 50 100 Q 45 105 50 110 Q 55 115 50 120 Q 45 125 50 130 Q 55 135 50 140 Q 45 145 50 150 Q 55 155 50 160 Q 45 165 50 170 Q 55 175 50 180" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                    <path d="M 40 20 H 60 M 38 40 H 62 M 35 60 H 65 M 33 80 H 67 M 32 100 H 68 M 30 120 H 70 M 28 140 H 72 M 25 160 H 75 M 25 180 H 75" stroke="currentColor" strokeWidth="2.5" opacity="0.6" />
                    <path d="M 50 10 V 190" stroke="#f43f5e" strokeWidth="2" strokeDasharray="3 3" opacity="0.9" />
                  </svg>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                <button
                  onClick={() => navigate("/dashboard/radiology/requests")}
                  className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest cursor-pointer py-2 px-3"
                >
                  Cancel Session
                </button>
                <button
                  onClick={() => navigate(`/dashboard/radiology/report-draft/${id || "1"}`)}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-md shadow-blue-100 hover:translate-x-0.5 transition-all cursor-pointer"
                >
                  <span>Reporting</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* RIGHT PANEL - Image Queue */}
            <div className="lg:col-span-3 bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between space-y-6">
              <div className="space-y-4 flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      Image Queue
                    </h3>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black">
                      {imageQueue.length} / 12
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 min-h-[300px]">
                  {imageQueue.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-100 rounded-2xl space-y-3">
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-400">
                        <Upload size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-slate-800">
                          Queue is Empty
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 max-w-[140px] leading-relaxed mx-auto">
                          Click upload to start streaming scanner slices.
                        </p>
                      </div>
                    </div>
                  ) : (
                    imageQueue.map((slice) => (
                      <div
                        key={slice.id}
                        className={`p-3 rounded-2xl border transition-all flex items-center gap-3 relative overflow-hidden ${
                          slice.status === "processing"
                            ? "bg-blue-50/20 border-blue-200/50 shadow-sm"
                            : "bg-white border-slate-100 shadow-sm hover:border-slate-200"
                        }`}
                      >
                        <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center shrink-0 overflow-hidden border border-slate-800">
                          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-cyan-500/80">
                            <path d={slice.svgData} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                          </svg>
                        </div>

                        <div className="space-y-0.5 flex-1 min-w-0">
                          <p className="text-xs font-black text-slate-800 truncate">
                            {slice.sliceNumber}
                          </p>
                          <p className="text-[9px] font-bold text-slate-400">
                            {slice.type} • {slice.thickness}
                          </p>
                        </div>

                        <div className="flex flex-col items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleDeleteImage(slice.imageId, slice.id)}
                            disabled={deletingImageId === (slice.imageId || slice.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-50"
                            title="Delete image"
                          >
                            <Trash2 size={13} />
                          </button>

                          {slice.status === "processing" ? (
                            <div className="flex flex-col items-end">
                              <span className="flex h-1.5 w-1.5 relative mb-1">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-600"></span>
                              </span>
                              <span className="text-[9px] font-black text-blue-600 uppercase tracking-wider animate-pulse">
                                Processing...
                              </span>
                            </div>
                          ) : (
                            <span className="p-1 bg-emerald-50 text-emerald-500 rounded-lg block border border-emerald-100">
                              <Check size={11} strokeWidth={3} />
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <button
                  onClick={handleClickUpload}
                  disabled={uploading || !id || imageQueue.length >= 12}
                  className="w-full flex items-center justify-center gap-2 py-3 border border-slate-200 hover:border-blue-600/50 hover:bg-blue-50/10 text-slate-700 hover:text-blue-600 text-xs font-bold rounded-2xl transition-all cursor-pointer shadow-sm group bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload size={14} className="text-slate-400 group-hover:text-blue-500" />
                  <span>{uploading ? "Uploading..." : "Upload Images"}</span>
                </button>
              </div>

              {imageQueue.length > 0 && (
                <div className="grid grid-cols-2 gap-3 border-t border-slate-50 pt-4">
                  <button
                    onClick={handleRetakeAll}
                    disabled={removingAll || !id}
                    className="flex items-center justify-center gap-1 py-2.5 bg-white border border-slate-250 text-slate-600 hover:text-red-500 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw size={11} />
                    <span>{removingAll ? "Removing..." : "Retake All"}</span>
                  </button>
                  <button
                    onClick={() => navigate(`/dashboard/radiology/report-draft/${id || "1"}`)}
                    className="py-2.5 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm transition-all cursor-pointer text-center"
                  >
                    Finalize Batch
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RadiologyScanning;