import  { useState } from "react";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AddLabTest = () => {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(true);
  const [isFasting, setIsFasting] = useState(true);

  return (
    /* أضفت h-full و overflow-y-auto هنا عشان السكرول يشتغل */
    <div className="h-full overflow-y-auto bg-slate-50/30">
      <div className="p-4 md:p-8 space-y-6 w-full max-w-full mx-auto animate-in fade-in duration-500">
        {/* Top Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 font-bold text-sm hover:gap-3 transition-all"
        >
          <ArrowLeft size={18} />
          Back to List
        </button>

        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Add Test
          </h1>
          <p className="text-slate-500 mt-1">
            Add and manage lab tests including sample type, method, and
            requirements.
          </p>
        </div>

        {/* Main Form Container - W-FULL */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 md:p-10 space-y-10 w-full">
          {/* Header with Switch */}
          <div className="flex justify-between items-center pb-6 border-b border-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <Plus size={24} />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Add Lab Test</h2>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                {isActive ? "Active" : "Inactive"}
              </span>
              <button
                onClick={() => setIsActive(!isActive)}
                className={`w-12 h-6 rounded-full transition-all relative ${isActive ? "bg-blue-600" : "bg-slate-200"}`}
              >
                <div
                  className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-all ${isActive ? "left-7" : "left-1"}`}
                />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-10">
            {/* Section 1: Basic Information */}
            <div className="space-y-6">
              <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-[2px] border-l-4 border-blue-600 pl-3">
                Basic Information
              </h3>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 ml-1">
                  Test Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. CBC-001"
                  className="w-full p-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 ml-1 text-right block">
                  Test Name (Arabic)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  placeholder="اسم الاختبار"
                  className="w-full p-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 ml-1">
                  Test Name (English)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Complete Blood Count"
                  className="w-full p-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                />
              </div>
            </div>

            {/* Section 2: Classification */}
            <div className="space-y-6">
              <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-[2px] border-l-4 border-blue-600 pl-3">
                Classification
              </h3>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 ml-1">
                  Category
                </label>
                <select className="w-full p-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:bg-white transition-all appearance-none cursor-pointer">
                  <option>Chemistry</option>
                  <option>Hematology</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 ml-1">
                  Sub Category
                </label>
                <input
                  type="text"
                  placeholder="e.g. Routine Chemistry"
                  className="w-full p-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 ml-1">
                  Test Method
                </label>
                <input
                  type="text"
                  placeholder="e.g. Spectrophotometry"
                  className="w-full p-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Sample & Patient Requirements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-10 pt-4">
            <div className="space-y-6">
              <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-[2px] border-l-4 border-blue-600 pl-3">
                Sample & Stability
              </h3>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 ml-1">
                  Sample Type
                </label>
                <select className="w-full p-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold outline-none appearance-none cursor-pointer focus:bg-white transition-all">
                  <option>Whole Blood</option>
                  <option>Serum</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">
                    Room Temp
                  </label>
                  <input
                    type="text"
                    placeholder="24 Hrs"
                    className="w-full p-3 bg-slate-50/50 border border-slate-100 rounded-xl text-sm font-bold outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">
                    Refrigerated
                  </label>
                  <input
                    type="text"
                    placeholder="7 Days"
                    className="w-full p-3 bg-slate-50/50 border border-slate-100 rounded-xl text-sm font-bold outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">
                    Frozen
                  </label>
                  <input
                    type="text"
                    placeholder="30 Days"
                    className="w-full p-3 bg-slate-50/50 border border-slate-100 rounded-xl text-sm font-bold outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-[2px] border-l-4 border-blue-600 pl-3">
                Patient Requirements
              </h3>
              <div className="flex justify-between items-center p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                <div>
                  <div className="text-sm font-bold text-blue-900">
                    Fasting Required
                  </div>
                  <div className="text-[10px] text-blue-600/70 font-medium">
                    Does the patient need to fast?
                  </div>
                </div>
                <button
                  onClick={() => setIsFasting(!isFasting)}
                  className={`w-10 h-5 rounded-full transition-all relative ${isFasting ? "bg-blue-600" : "bg-slate-200"}`}
                >
                  <div
                    className={`absolute top-0.5 bg-white w-4 h-4 rounded-full transition-all ${isFasting ? "left-5.5" : "left-0.5"}`}
                  />
                </button>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 ml-1">
                  Fasting Hours
                </label>
                <input
                  type="number"
                  placeholder="12"
                  className="w-full p-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Test Parameters Table (Inside the same white card) */}
          <div className="space-y-6 pt-10 border-t border-slate-50">
            {/* <div className="flex justify-between items-center">
                            <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-[2px] flex items-center gap-2">
                                Test Parameters
                            </h3>
                            <button className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-blue-100 transition-colors">
                                <Plus size={16} /> Add Parameter
                            </button>
                        </div> */}
            {/* Header with Icon and Add Button */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center border border-blue-100">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 3v18h18" />
                    <path d="M18 17V9" />
                    <path d="M13 17V5" />
                    <path d="M8 17v-3" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  Test Parameters
                </h3>
              </div>
              <button className="text-blue-600 text-sm font-bold flex items-center gap-1.5 hover:text-blue-700 transition-colors">
                <Plus size={16} strokeWidth={3} /> Add Parameter
              </button>
            </div>

            {/* The Input Card - Exactly like the image */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                {/* Parameter Name */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                    Parameter Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hemoglobin"
                    className="w-full p-3 bg-slate-50/80 border border-slate-200/50 rounded-xl text-sm font-medium text-slate-600 placeholder:text-slate-300 focus:bg-white focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                  />
                </div>

                {/* Unit */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    placeholder="g/dL"
                    className="w-full p-3 bg-slate-50/80 border border-slate-200/50 rounded-xl text-sm font-medium text-slate-600 placeholder:text-slate-300 focus:bg-white focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                  />
                </div>

                {/* Min Range */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                    Min Range
                  </label>
                  <input
                    type="text"
                    placeholder="13.5 - 17.5"
                    className="w-full p-3 bg-slate-50/80 border border-slate-200/50 rounded-xl text-sm font-medium text-slate-600 placeholder:text-slate-300 focus:bg-white focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                  />
                </div>

                {/* Max Range */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                    Max Range
                  </label>
                  <input
                    type="text"
                    placeholder="13.5 - 17.5"
                    className="w-full p-3 bg-slate-50/80 border border-slate-200/50 rounded-xl text-sm font-medium text-slate-600 placeholder:text-slate-300 focus:bg-white focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                  />
                </div>

                {/* Gender (Gander as written in image) */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                    Gander
                  </label>
                  <input
                    type="text"
                    placeholder="13.5 - 17.5"
                    className="w-full p-3 bg-slate-50/80 border border-slate-200/50 rounded-xl text-sm font-medium text-slate-600 placeholder:text-slate-300 focus:bg-white focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6">
              <button className="px-8 py-3 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors">
                Cancel
              </button>
              <button className="px-10 py-3 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center gap-3">
                <Save size={20} />
                Save Lab Test
              </button>
            </div>
          </div>
        </div>

        {/* Section 5: List of Added Parameters */}
        <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm w-full">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Parameter Name
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                  Unit
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                  Normal Range
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                  Status
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                {
                  name: "Hemoglobin",
                  unit: "g/dL",
                  range: "13.5 - 17.5",
                  status: "Active",
                },
                {
                  name: "White Blood Cell Count",
                  unit: "10^9/L",
                  range: "4.5 - 11.0",
                  status: "Active",
                },
                {
                  name: "Platelet Count",
                  unit: "10^3/uL",
                  range: "150 - 450",
                  status: "Inactive",
                },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5 text-sm font-black text-slate-700">
                    {row.name}
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-slate-400 text-center">
                    {row.unit}
                  </td>
                  <td className="px-8 py-5 text-sm font-black text-slate-600 text-center">
                    {row.range}
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${row.status === "Active" ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-400"}`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Space at the bottom for better scrolling experience */}
        <div className="h-10" />
      </div>
    </div>
  );
};

export default AddLabTest;
