import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TopBar from "../TopBar";
import {
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Hand,
  RotateCcw,
  Sliders,
  Type,
  FileCheck2,
  ChevronDown,
  Eye,
  FileText,
  Bookmark,
  RotateCw
} from "lucide-react";

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
  { id: "5", label: "Bone Window", svgPath: "M4,12 H20 M8,4 V20 M16,4 V20" }
];

const RadiologyDraftReport: React.FC<{
  onMenuClick?: () => void;
  onProfileClick?: () => void;
}> = ({ onMenuClick, onProfileClick }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Interactive viewport state
  const [activeSeries, setActiveSeries] = useState("1");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [brightness, setBrightness] = useState(45);
  const [contrast, setContrast] = useState(82);

  // Editable report fields
  const [findingsText, setFindingsText] = useState(
    "The lungs are clear and expanded. No focal consolidations, pleural effusions or pneumothorax are seen. The cardiomedastinal silhouette and hila are within normal limits for age. No acute osseous abnormalities identified. The visualized soft tissues are unremarkable."
  );
  const [impressionText, setImpressionText] = useState(
    "No acute cardiopulmonary process. Normal chest radiograph."
  );

  const handleZoomIn = () => setZoomLevel((z) => Math.min(200, z + 10));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(50, z - 10));
  const handleResetViewport = () => {
    setZoomLevel(100);
    setBrightness(45);
    setContrast(82);
  };

  const breadcrumb = (
    <div className="flex items-center gap-2 text-xs md:text-sm font-extrabold text-slate-400">
      <span>REQUESTS</span>
      <ChevronRight size={14} className="text-slate-300 shrink-0" />
      <span className="text-slate-400 font-bold uppercase">START EXAM</span>
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
          
          {/* Progress Tracker */}
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

              {/* Final Results box (Highlighting active stage) */}
              <div className="aspect-[4/3] border-2 border-dashed border-blue-500 bg-blue-50/10 rounded-2xl flex flex-col items-center justify-center text-center p-3 cursor-pointer hover:bg-blue-50/20 transition-all shadow-sm">
                <FileCheck2 className="text-blue-500 mb-1.5 shrink-0" size={18} />
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-tight block">
                  Final Results
                </span>
              </div>
            </div>
          </div>

          {/* Two Panel Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT PANEL: Interactive Viewport (Col span 7) */}
            <div className="lg:col-span-7 bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col space-y-4">
              
              {/* Interactive Toolbar */}
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
                
                {/* Stats */}
                <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500 font-extrabold uppercase">
                  <span>Bri: <strong className="text-blue-600">{brightness}%</strong></span>
                  <span>Con: <strong className="text-blue-600">{contrast}%</strong></span>
                </div>
              </div>

              {/* Viewport View (Black X-ray card) */}
              <div className="relative aspect-[4/3] bg-slate-950 rounded-2xl overflow-hidden border border-slate-900 shadow-inner flex flex-col justify-between p-4 group">
                
                {/* Simulated X-ray grid pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-25 pointer-events-none" />

                {/* Overlaid parameters */}
                <div className="pointer-events-none flex justify-between text-[9px] font-mono text-cyan-400/50 uppercase tracking-wider z-10">
                  <span>Series: Chest_PA_Sag</span>
                  <span>Window: Lung_High</span>
                </div>

                {/* Large high-tech X-ray illustration */}
                <div 
                  className="flex-1 flex items-center justify-center transition-all duration-300"
                  style={{ transform: `scale(${zoomLevel / 100})`, filter: `brightness(${brightness / 45}) contrast(${contrast / 82})` }}
                >
                  <svg viewBox="0 0 100 100" fill="none" className="w-[45%] h-auto text-slate-250 filter drop-shadow-[0_0_15px_rgba(241,245,249,0.15)]">
                    {/* Chest Ribcage structure */}
                    {/* Spine */}
                    <path d="M 50 10 V 90" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
                    {/* Ribs (Left & Right) */}
                    <path d="M 50 25 Q 35 22 25 35 Q 38 48 50 40 Q 62 48 75 35 Q 65 22 50 25" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6" />
                    <path d="M 50 35 Q 30 32 20 48 Q 35 60 50 50 Q 65 60 80 48 Q 70 32 50 35" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6" />
                    <path d="M 50 45 Q 28 42 16 60 Q 33 72 50 60 Q 67 72 84 60 Q 72 42 50 45" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5" />
                    <path d="M 50 55 Q 25 52 14 70 Q 30 82 50 70 Q 70 82 86 70 Q 75 52 50 55" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4" />
                    {/* Collar bones */}
                    <path d="M 50 18 Q 35 15 22 22 M 50 18 Q 65 15 78 22" stroke="currentColor" strokeWidth="2" opacity="0.7" />
                    {/* Lungs outline shading */}
                    <path d="M 45 25 C 30 20 22 35 20 55 C 18 75 30 80 44 78 C 45 70 45 35 45 25 Z" fill="currentColor" opacity="0.12" />
                    <path d="M 55 25 C 70 20 78 35 80 55 C 82 75 70 80 56 78 C 55 70 55 35 55 25 Z" fill="currentColor" opacity="0.12" />
                    {/* Heart shadow */}
                    <path d="M 44 48 C 38 52 42 68 50 72 C 55 74 58 68 56 58 C 54 48 48 44 44 48 Z" fill="currentColor" opacity="0.2" />
                  </svg>
                </div>

                {/* Viewport footer specs and series selectors */}
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

                  {/* Horizontal Thumbnail Strip */}
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
                        <svg viewBox="0 0 24 24" fill="none" className={`w-5 h-5 ${activeSeries === item.id ? "text-blue-400" : "text-slate-500/60"}`}>
                          <path d={item.svgPath} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

            {/* RIGHT PANEL: Report Editor Findings (Col span 5) */}
            <div className="lg:col-span-5 bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between space-y-5">
              
              <div className="space-y-4 flex-1">
                {/* Header */}
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

                {/* Reporting template selector */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Reporting Template
                  </label>
                  <button className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100/50 transition-colors font-bold text-xs text-slate-700 cursor-pointer">
                    <span>Normal Chest Radiograph</span>
                    <ChevronDown size={14} className="text-slate-400" />
                  </button>
                </div>

                {/* Findings box */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Eye size={13} className="text-blue-500" />
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      Findings
                    </label>
                  </div>
                  <textarea
                    value={findingsText}
                    onChange={(e) => setFindingsText(e.target.value)}
                    rows={6}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-650 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white outline-none transition-all leading-relaxed resize-none"
                  />
                </div>

                {/* Impression box */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Bookmark size={13} className="text-purple-500" />
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      Impression
                    </label>
                  </div>
                  <textarea
                    value={impressionText}
                    onChange={(e) => setImpressionText(e.target.value)}
                    rows={3}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-650 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white outline-none transition-all leading-relaxed resize-none"
                  />
                </div>
              </div>

              {/* Bottom Actions footer */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-4">
                <button
                  onClick={() => navigate(`/dashboard/radiology/scan/${id || "1"}`)}
                  className="py-3 bg-white border border-slate-250 text-slate-600 hover:text-red-500 rounded-2xl text-xs font-black uppercase tracking-wider shadow-sm transition-colors cursor-pointer text-center"
                >
                  Retake Batch
                </button>
                <button
                  onClick={() => navigate(`/dashboard/radiology/final-report/${id || "1"}`)}
                  className="py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-md shadow-blue-100 hover:translate-x-0.5 transition-all cursor-pointer text-center"
                >
                  Mark as Completed
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
