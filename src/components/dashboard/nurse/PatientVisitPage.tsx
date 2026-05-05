import React, { useState } from "react";
import {
  UserPlus,
  Calendar,
  Stethoscope,
  Activity,
  Paperclip,
  ChevronDown,
  Info,
  CheckCircle2,
  Upload,
} from "lucide-react";

interface PatientVisitPageProps {
  onMenuClick?: () => void;
}

const PatientVisitPage: React.FC<PatientVisitPageProps> = () => {
  const [priority, setPriority] = useState<"routine" | "urgent">("routine");
  return (
    <div className="flex-1 bg-[#F8FAFC] min-h-screen overflow-y-auto font-sans pb-12">
      <div className="p-6 max-w-[1600px] mx-auto">
        {/* Header Section */}
        <div className="mb-10 mt-4">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            Create Patient Visit
          </h2>
          <p className="text-slate-500 font-semibold text-lg">
            Register a new visit based on patient appointment
          </p>
        </div>

        {/* الجزء العلوي: نظام العامودين */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
          {/* Left Column (Forms) - 8 Cols */}
          <div className="lg:col-span-8 space-y-8">
            {/* 1. Appointment Selection Section */}
            <section className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 p-8">
              <div className="flex items-center gap-3 text-[#1A6FC4] mb-8">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Calendar size={24} strokeWidth={2.5} />
                </div>
                <h3 className="font-extrabold uppercase tracking-widest text-sm">
                  Appointment Selection
                </h3>
              </div>

              <div className="space-y-4">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">
                  Select Active Appointment
                </label>
                <div className="flex items-center justify-between p-5 bg-[#F1F5F9] rounded-2xl cursor-pointer hover:bg-slate-200 transition-all border-2 border-transparent hover:border-blue-200 group">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shadow-inner">
                      <img
                        src="https://ui-avatars.com/api/?name=Elena+Rodriguez&background=DBEAFE&color=2563EB&bold=true"
                        className="rounded-xl w-full h-full object-cover"
                        alt="Patient"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-lg">
                        Elena Rodriguez
                      </h4>
                      <p className="text-sm text-slate-500 font-bold">
                        Cardiology <span className="mx-2 opacity-30">•</span>{" "}
                        Dr. Marcus Thorne{" "}
                        <span className="mx-2 opacity-30">•</span> 10:30 AM
                        Today
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    size={24}
                    className="text-slate-400 group-hover:text-blue-500 transition-colors"
                  />
                </div>
              </div>
            </section>

            {/* 2. Visit Information Section */}
            <section className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 p-8">
              <div className="flex items-center gap-3 text-[#1A6FC4] mb-8">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Stethoscope size={24} strokeWidth={2.5} />
                </div>
                <h3 className="font-extrabold uppercase tracking-widest text-sm">
                  Visit Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-3">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">
                    Visit Type
                  </label>
                  <div className="relative">
                    <select className="w-full bg-[#F1F5F9] border-2 border-transparent rounded-xl p-4 text-sm font-bold text-slate-700 appearance-none focus:bg-white focus:border-blue-500 transition-all outline-none">
                      <option>Consultation</option>
                      <option>Follow-up</option>
                      <option>Emergency</option>
                    </select>
                    <ChevronDown
                      size={20}
                      className="absolute right-4 top-4 text-slate-500 pointer-events-none"
                    />
                  </div>
                </div>

                {/* <div className="space-y-3">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">
                    Priority Level
                  </label>
                  <div className="flex gap-4">
                    <button className="flex-1 py-4 px-4 rounded-xl border-2 border-blue-500 bg-blue-50 text-blue-600 font-black text-xs uppercase tracking-wider transition-all shadow-sm">
                      Routine
                    </button>
                    <button className="flex-1 py-4 px-4 rounded-xl border-2 border-transparent bg-[#F1F5F9] text-slate-500 font-black text-xs uppercase tracking-wider hover:bg-slate-200 transition-all">
                      Urgent
                    </button>
                  </div>
                </div> */}
                <div className="space-y-3">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">
                    Priority Level
                  </label>
                  <div className="flex gap-4">
                    {/* Routine Button */}
                    <button
                      onClick={() => setPriority("routine")}
                      className={`flex-1 py-4 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-sm border-2 ${
                        priority === "routine"
                          ? "border-blue-500 bg-blue-50 text-blue-600"
                          : "border-transparent bg-[#F1F5F9] text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      Routine
                    </button>

                    {/* Urgent Button */}
                    <button
                      onClick={() => setPriority("urgent")}
                      className={`flex-1 py-4 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-sm border-2 ${
                        priority === "urgent"
                          ? "border-red-500 bg-red-50 text-red-600" // خليت الـ Urgent بلون أحمر للتمييز
                          : "border-transparent bg-[#F1F5F9] text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      Urgent
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">
                  Chief Complaint *
                </label>
                <textarea
                  placeholder="Primary reason for patient's visit..."
                  className="w-full bg-[#F1F5F9] rounded-2xl p-5 min-h-[120px] border-2 border-transparent focus:bg-white focus:border-blue-500 transition-all outline-none placeholder:text-slate-400 font-bold text-sm"
                ></textarea>
              </div>
            </section>
          </div>

          {/* Right Column (Summary Card) - 4 Cols */}
          <div className="lg:col-span-4 h-full">
            <div className="bg-[#1A6FC4] text-white rounded-[2.5rem] p-10 shadow-2xl shadow-blue-200 relative overflow-hidden h-full">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
              <h3 className="text-xs font-black uppercase tracking-[0.3em] opacity-50 mb-10 text-white">
                Visit Summary
              </h3>
              <div className="space-y-12 relative z-10">
                <div className="flex gap-6">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/20 shadow-lg">
                    <UserPlus size={26} />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-50 mb-2 text-white">
                      Patient Name
                    </p>
                    <h4 className="text-2xl font-extrabold text-white">
                      Elena Rodriguez
                    </h4>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/20 shadow-lg">
                    <Stethoscope size={26} />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-50 mb-2 text-white">
                      Assigned Doctor
                    </p>
                    <h4 className="text-xl font-extrabold text-white uppercase">
                      Dr. Marcus Thorne
                    </h4>
                  </div>
                </div>
              </div>
              <div className="mt-12 bg-white/10 border border-white/20 rounded-[1.5rem] p-6 flex gap-4 backdrop-blur-sm">
                <Info size={28} className="shrink-0 text-blue-200" />
                <p className="text-xs font-bold leading-relaxed opacity-90 italic text-white">
                  Note: Vitals are synced in real-time.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* الجزء السفلي: ممتد بعرض الصفحة بالكامل (Full Width) كما في الصورة */}
        <div className="space-y-8">
          {/* 3. Vital Signs Section (Full Width) */}
          <section className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 p-8">
            <div className="flex items-center gap-3 text-[#1A6FC4] mb-8">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Activity size={24} strokeWidth={2.5} />
              </div>
              <h3 className="font-extrabold uppercase tracking-widest text-sm">
                Vital Signs
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-5 mb-8">
              {[
                { label: "Temp (°C)", value: "36.8" },
                { label: "BP (MMHG)", value: "120 / 80" },
                { label: "HR (BPM)", value: "72" },
                { label: "SPO2 (%)", value: "98" },
                { label: "Weight (KG)", value: "74.5" },
                { label: "Height (CM)", value: "178" },
                { label: "Glucose", value: "95" },
                { label: "BMI (CALC)", value: "23.5", highlight: true },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className={`p-6 rounded-[1.25rem] border-2 transition-all shadow-sm ${stat.highlight ? "border-blue-500 bg-blue-50" : "bg-[#F8FAFC] border-slate-100 hover:border-slate-200"}`}
                >
                  <label
                    className={`block text-[10px] font-black uppercase tracking-widest mb-2 ${stat.highlight ? "text-blue-600" : "text-slate-400"}`}
                  >
                    {stat.label}
                  </label>
                  <p
                    className={`text-2xl font-black ${stat.highlight ? "text-blue-700" : "text-slate-800"}`}
                  >
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">
                Nurse Observation Notes
              </label>
              <textarea
                placeholder="Note any immediate abnormalities..."
                className="w-full bg-[#F1F5F9] rounded-2xl p-5 min-h-[120px] border-2 border-transparent focus:bg-white focus:border-blue-500 transition-all outline-none placeholder:text-slate-400 font-bold text-sm"
              ></textarea>
            </div>
          </section>

          {/* 4. Attachments Section (Full Width) */}
          <section className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 p-8">
            <div className="flex items-center gap-3 text-[#1A6FC4] mb-8">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Paperclip size={24} strokeWidth={2.5} />
              </div>
              <h3 className="font-extrabold uppercase tracking-widest text-sm">
                Attachments
              </h3>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-4">
              <div className="min-w-[180px] h-32 border-3 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 cursor-pointer transition-all bg-[#F8FAFC]">
                <Upload size={32} className="mb-2 opacity-50" />
                <span className="text-[11px] font-black uppercase tracking-widest">
                  Upload File
                </span>
              </div>
            </div>
          </section>

          {/* Action Buttons - Centered */}
          {/* <div className="flex justify-center gap-6 pt-10">
            <button className="px-16 py-5 bg-white text-slate-500 border-2 border-slate-100 font-black rounded-2xl hover:bg-slate-50 transition-all uppercase tracking-[0.2em] text-xs">
              Cancel
            </button>
            <button className="px-24 py-5 bg-[#1A6FC4] text-white font-black rounded-2xl hover:bg-[#0D4A8A] transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs shadow-xl shadow-blue-200 active:scale-[0.98]">
              <CheckCircle2 size={20} />
              Create Visit
            </button>
          </div> */}
          {/* Action Buttons Section - Matching the Image */}
          <div className="p-6 mt-8 rounded-xl border-slate-100 flex justify-end gap-4">
            <button className="px-10 py-3 bg-[#E2E8F0] text-slate-700 font-medium rounded-lg hover:bg-slate-300 transition-colors text-sm">
              Cancel
            </button>
            <button className="px-10 py-3 bg-[#0061BC] text-white font-medium rounded-lg hover:bg-[#0052A3] transition-all flex items-center gap-2 text-sm shadow-lg shadow-blue-200">
              <div className="bg-white rounded-full p-0.5">
                <CheckCircle2 size={14} className="text-[#0061BC] fill-white" />
              </div>
              Create Visit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientVisitPage;
