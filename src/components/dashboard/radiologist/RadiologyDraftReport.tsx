import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TopBar from "../TopBar";
import {
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Hand,
  RotateCcw,
  FileCheck2,
  Eye,
} from "lucide-react";
import {
  getImagesByExam,
  softDeleteRadiologyImage,
  type RadiologyImageDto,
  updateRadiologyImageNotes,
} from "../../../api/radiologyReport";

interface SeriesThumbnail {
  id: string;
  label: string;
  svgPath: string;
}

const MOCK_SERIES: SeriesThumbnail[] = [
  { id: "1", label: "PA Chest", svgPath: "M6,4 Q12,18 18,4 M12,4 V20 M8,8 H16" },
  { id: "2", label: "Lat Chest", svgPath: "M8,4 C14,10 6,14 12,20" },
  { id: "3", label: "Lungs Focus", svgPath: "M6,10 A6,6 0 0,1 18,10 Z" },
  { id: "4", label: "Hilar View", svgPath: "M12,4 A4,4 0 0,0 12,12 A4,4 0 0,0 12,20" },
  { id: "5", label: "Bone Window", svgPath: "M4,12 H20 M8,4 V20 M16,4 V20" },
];

const RadiologyDraftReport: React.FC<{
  onMenuClick?: () => void;
  onProfileClick?: () => void;
}> = ({ onMenuClick, onProfileClick }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const examId = id || "";

  const [activeSeries, setActiveSeries] = useState("1");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [brightness, setBrightness] = useState(45);
  const [contrast, setContrast] = useState(82);

  const [images, setImages] = useState<RadiologyImageDto[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);

  const [findingsText, setFindingsText] = useState(
    "The lungs are clear and expanded. No focal consolidations, pleural effusions or pneumothorax are seen. The cardiomedastinal silhouette and hila are within normal limits for age. No acute osseous abnormalities identified. The visualized soft tissues are unremarkable."
  );

  const [isImagesLoading, setIsImagesLoading] = useState(false);
  const [isSavingFindings, setIsSavingFindings] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [pageError, setPageError] = useState<string>("");
  const [saveError, setSaveError] = useState<string>("");
  const [deleteError, setDeleteError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const selectedImage = useMemo(
    () =>
      images.find(
        (img) => Number(img.id ?? img.imageId) === Number(selectedImageId)
      ) || null,
    [images, selectedImageId]
  );

  useEffect(() => {
    const loadImages = async () => {
      if (!examId) return;

      setIsImagesLoading(true);
      setPageError("");
      setSuccessMessage("");

      try {
        const data = await getImagesByExam(examId);
        setImages(data);

        if (data.length > 0) {
          const firstImageId = Number(data[0].id ?? data[0].imageId);
          setSelectedImageId(Number.isNaN(firstImageId) ? null : firstImageId);

          const initialText =
            data[0]?.reportTextForImage ||
            data[0]?.ReportTextForImage ||
            data[0]?.notes ||
            "";

          setFindingsText(initialText);
        } else {
          setSelectedImageId(null);
          setFindingsText("");
        }
      } catch (error: any) {
        setPageError(error?.message || "Failed to load radiology images.");
      } finally {
        setIsImagesLoading(false);
      }
    };

    loadImages();
  }, [examId]);

  useEffect(() => {
    if (selectedImage) {
      const selectedText =
        selectedImage?.reportTextForImage ||
        selectedImage?.ReportTextForImage ||
        selectedImage?.notes ||
        "";

      setFindingsText(selectedText);
    }
  }, [selectedImage]);

  const handleZoomIn = () => setZoomLevel((z) => Math.min(200, z + 10));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(50, z - 10));

  const handleResetViewport = () => {
    setZoomLevel(100);
    setBrightness(45);
    setContrast(82);
  };

  const handleSelectImage = (image: RadiologyImageDto, index: number) => {
    const imageId = Number(image.id ?? image.imageId);
    const imageText =
      image?.reportTextForImage ||
      image?.ReportTextForImage ||
      image?.notes ||
      "";

    setSelectedImageId(Number.isNaN(imageId) ? null : imageId);
    setFindingsText(imageText);
    setActiveSeries(String((index % 5) + 1));
    setSuccessMessage("");
    setSaveError("");
    setDeleteError("");
  };

  const handleSaveFindings = async () => {
  if (!selectedImageId) {
    setSaveError("No image selected.");
    return;
  }

  setIsSavingFindings(true);
  setSaveError("");
  setDeleteError("");
  setSuccessMessage("");

  try {
    await updateRadiologyImageNotes(selectedImageId, {
      reportTextForImage: findingsText,
    });

    setImages((prev) =>
      prev.map((img) => {
        const currentId = Number(img.id ?? img.imageId);
        if (currentId === selectedImageId) {
          return {
            ...img,
            notes: findingsText,
            reportTextForImage: findingsText,
          };
        }
        return img;
      })
    );

    navigate(`/dashboard/radiology/final-report/${id}`);
  } catch (error: any) {
    setSaveError(error?.message || "Failed to save findings.");
  } finally {
    setIsSavingFindings(false);
  }
};

  const handleDeleteImage = async () => {
    if (!selectedImageId) {
      setDeleteError("No image selected.");
      return;
    }

    setIsDeletingImage(true);
    setDeleteError("");
    setSaveError("");
    setSuccessMessage("");

    try {
      await softDeleteRadiologyImage(selectedImageId);

      const updatedImages = images.filter((img) => {
        const currentId = Number(img.id ?? img.imageId);
        return currentId !== selectedImageId;
      });

      setImages(updatedImages);

      if (updatedImages.length > 0) {
        const nextImageId = Number(updatedImages[0].id ?? updatedImages[0].imageId);
        const nextText =
          updatedImages[0]?.reportTextForImage ||
          updatedImages[0]?.ReportTextForImage ||
          updatedImages[0]?.notes ||
          "";

        setSelectedImageId(Number.isNaN(nextImageId) ? null : nextImageId);
        setFindingsText(nextText);
      } else {
        setSelectedImageId(null);
        setFindingsText("");
      }

      setSuccessMessage("Image deleted successfully.");
    } catch (error: any) {
      setDeleteError(error?.message || "Failed to delete image.");
    } finally {
      setIsDeletingImage(false);
    }
  };

  const breadcrumb = (
    <div className="flex items-center gap-2 text-xs md:text-sm font-extrabold text-slate-400">
      <button
        onClick={() => navigate(`/dashboard/radiology/requests`)}
        className="text-slate-400 font-bold uppercase hover:text-blue-600 transition-all duration-200 hover:cursor-pointer"
      >
        REQUESTS
      </button>
      <ChevronRight size={14} className="text-slate-300 shrink-0" />
      <button
        onClick={() => navigate(`/dashboard/radiology/scan/${id}`)}
        className="text-slate-400 font-bold uppercase hover:text-blue-600 transition-all duration-200 hover:cursor-pointer"
      >
        START EXAM
      </button>
      <ChevronRight size={14} className="text-slate-300 shrink-0" />
      <span className="text-blue-600 font-black">REPORTING</span>
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

            {pageError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {pageError}
              </div>
            )}

            {successMessage && (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {successMessage}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {isImagesLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="aspect-[4/3] rounded-2xl bg-slate-100 animate-pulse border border-slate-200"
                  />
                ))
              ) : images.length > 0 ? (
                images.slice(0, 4).map((image, index) => {
                  const imageId = Number(image.id ?? image.imageId);
                  const isActive = selectedImageId === imageId;

                  return (
                    <div
                      key={imageId || index}
                      onClick={() => handleSelectImage(image, index)}
                      className={`aspect-[4/3] border rounded-2xl flex items-center justify-center relative overflow-hidden group shadow-sm transition-colors cursor-pointer ${
                        isActive
                          ? "border-blue-500 bg-slate-950"
                          : "bg-slate-900 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {image.imageUrl || image.url ? (
                        <img
                          src={image.imageUrl || image.url}
                          alt={image.fileName || `Radiology image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg viewBox="0 0 24 24" className="w-8 h-8 text-cyan-500/50">
                          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M12,4 V20 M4,12 H20" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                      )}

                      <span className="absolute bottom-2 left-2 text-[9px] font-mono text-cyan-400/80 bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800 max-w-[90%] truncate">
                        {image.fileName || `Image ${index + 1}`}
                      </span>
                    </div>
                  );
                })
              ) : (
                <>
                  <div className="aspect-[4/3] bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center relative overflow-hidden group shadow-sm hover:border-slate-700 transition-colors" />
                  <div className="aspect-[4/3] bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center relative overflow-hidden group shadow-sm hover:border-slate-700 transition-colors" />
                  <div className="aspect-[4/3] bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center relative overflow-hidden group shadow-sm hover:border-slate-700 transition-colors" />
                  <div className="aspect-[4/3] bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center relative overflow-hidden group shadow-sm hover:border-slate-700 transition-colors" />
                </>
              )}

              <div className="aspect-[4/3] border-2 border-dashed border-blue-500 bg-blue-50/10 rounded-2xl flex flex-col items-center justify-center text-center p-3 cursor-pointer hover:bg-blue-50/20 transition-all shadow-sm">
                <FileCheck2 className="text-blue-500 mb-1.5 shrink-0" size={18} />
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-tight block">
                  Final Results
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 px-4 py-2.5 border border-slate-100 rounded-2xl">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleZoomIn}
                    title="Zoom In"
                    className="p-1.5 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all cursor-pointer text-slate-500 hover:text-blue-600"
                  >
                    <ZoomIn size={16} />
                  </button>
                  <button
                    onClick={handleZoomOut}
                    title="Zoom Out"
                    className="p-1.5 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all cursor-pointer text-slate-500 hover:text-blue-600"
                  >
                    <ZoomOut size={16} />
                  </button>
                  <button
                    title="Pan/Move"
                    className="p-1.5 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all cursor-pointer text-slate-500 hover:text-blue-600"
                  >
                    <Hand size={16} />
                  </button>
                  <button
                    onClick={handleResetViewport}
                    title="Reset Viewport"
                    className="p-1.5 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all cursor-pointer text-slate-500 hover:text-blue-600"
                  >
                    <RotateCcw size={16} />
                  </button>
                  <span className="w-px h-5 bg-slate-200 mx-1" />
                  <button
                    onClick={() => setBrightness((b) => Math.min(100, b + 5))}
                    title="Increase Brightness"
                    className="p-1.5 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all cursor-pointer text-slate-500 hover:text-blue-600 text-[10px] font-bold"
                  >
                    BRI+
                  </button>
                  <button
                    onClick={() => setContrast((c) => Math.min(100, c + 5))}
                    title="Increase Contrast"
                    className="p-1.5 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all cursor-pointer text-slate-500 hover:text-blue-600 text-[10px] font-bold"
                  >
                    CON+
                  </button>
                </div>

                <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500 font-extrabold uppercase">
                  <span>
                    Bri: <strong className="text-blue-600">{brightness}%</strong>
                  </span>
                  <span>
                    Con: <strong className="text-blue-600">{contrast}%</strong>
                  </span>
                </div>
              </div>

              <div className="relative aspect-[4/3] bg-slate-950 rounded-2xl overflow-hidden border border-slate-900 shadow-inner flex flex-col justify-between p-4 group">
                <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-25 pointer-events-none" />

                <div className="pointer-events-none flex justify-between text-[9px] font-mono text-cyan-400/50 uppercase tracking-wider z-10">
                  <span>Series: Chest_PA_Sag</span>
                  <span>Window: Lung_High</span>
                </div>

                <div
                  className="flex-1 flex items-center justify-center transition-all duration-300"
                  style={{
                    transform: `scale(${zoomLevel / 100})`,
                    filter: `brightness(${brightness / 45}) contrast(${contrast / 82})`,
                  }}
                >
                  {selectedImage?.imageUrl || selectedImage?.url ? (
                    <img
                      src={selectedImage.imageUrl || selectedImage.url}
                      alt={selectedImage.fileName || "Radiology preview"}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-700">
                      No image preview
                    </div>
                  )}
                </div>

                <div className="z-10 space-y-4">
                  <div className="pointer-events-none flex justify-between items-end text-[9px] font-mono text-cyan-400/50 uppercase tracking-wider">
                    <div className="space-y-0.5">
                      <p>SLICE: 12 / 48</p>
                      <p>W: 2400 L: 450</p>
                    </div>
                    <div>
                      <p>Kv: 120 MA: 250</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-2 border-t border-slate-800/80 pt-3">
                    {MOCK_SERIES.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setActiveSeries(item.id)}
                        className={`aspect-[4/3] rounded-xl flex items-center justify-center cursor-pointer transition-all border overflow-hidden bg-slate-900 ${
                          activeSeries === item.id
                            ? "border-blue-500 shadow-md shadow-blue-500/20"
                            : "border-slate-800/80 hover:border-slate-700"
                        }`}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          className={`w-5 h-5 ${
                            activeSeries === item.id ? "text-blue-400" : "text-slate-500/60"
                          }`}
                        >
                          <path d={item.svgPath} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between space-y-5">
              <div className="space-y-4 flex-1">
                <div className="pb-3.5 border-b border-slate-50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-extrabold text-slate-800">
                      Radiological Report
                    </h3>
                    <span className="inline-block px-2.5 py-1 text-[9px] font-black uppercase bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-700 tracking-wider">
                      In Progress
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 leading-relaxed">
                    Study Date: Oct 24, 2023 | Chest PA/Lateral
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Eye size={13} className="text-blue-500" />
                    <label className="text-[15px] font-bold text-slate-800 uppercase tracking-widest">
                      Findings
                    </label>
                  </div>
                  <textarea
                    value={findingsText}
                    onChange={(e) => setFindingsText(e.target.value)}
                    rows={8}
                    disabled={!selectedImageId || isSavingFindings || isDeletingImage}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-650 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white outline-none transition-all leading-relaxed resize-none disabled:opacity-60"
                  />
                </div>

                {saveError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {saveError}
                  </div>
                )}

                {deleteError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {deleteError}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-4">
                <button
                  onClick={handleDeleteImage}
                  disabled={!selectedImageId || isDeletingImage || isSavingFindings}
                  className="py-3 bg-white border border-slate-250 text-slate-600 hover:text-red-500 rounded-2xl text-xs font-black uppercase tracking-wider shadow-sm transition-colors cursor-pointer text-center disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isDeletingImage ? "Deleting..." : "Delete Image"}
                </button>
                <button
                  onClick={handleSaveFindings}
                  disabled={!selectedImageId || isSavingFindings || isDeletingImage}
                  className="py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-md shadow-blue-100 hover:translate-x-0.5 transition-all cursor-pointer text-center disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSavingFindings ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RadiologyDraftReport;