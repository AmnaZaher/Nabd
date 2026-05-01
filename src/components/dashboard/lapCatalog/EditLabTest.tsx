import React, { useState } from "react";
import {
  Save,
  Trash2,
  Plus,
  Info,
  FlaskConical,
  Thermometer,
  Settings2,
  Edit3,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

const EditLabTest = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // لجلب كود التحليل من الـ URL

  return (
    <div className="h-full overflow-y-auto bg-slate-50/30">
      <div className="p-4 md:p-8 space-y-6 w-full max-w-full mx-auto animate-in fade-in zoom-in-95 duration-500">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              <Link
                to="/dashboard/lab-catalog"
                className="hover:text-blue-600 transition-colors cursor-pointer"
              >
                Lab Test Catalog
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-blue-600">Edit Test</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Comprehensive Metabolic Panel (CMP)
            </h1>
            <p className="text-slate-500 font-medium">
              Modify core clinical parameters and range thresholds for lab
              verification.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm"
            >
              Cancel
            </button>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-red-50 text-red-600 border border-red-100 font-bold rounded-xl hover:bg-red-100 transition-all shadow-sm">
              <Trash2 size={18} /> Delete Test
            </button>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200">
              <Save size={18} /> Save All Changes
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: General & Parameters */}
          <div className="lg:col-span-2 space-y-8">
            {/* General Specifications Card */}
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-8">
              <div className="flex items-center gap-3 text-blue-600 border-b border-slate-50 pb-4">
                <Info size={20} />
                <h3 className="text-lg font-black text-slate-800">
                  General Specifications
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Test Name
                  </label>
                  <input
                    type="text"
                    defaultValue="Comprehensive Metabolic Panel (CMP)"
                    className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Test Code (Read-Only)
                  </label>
                  <input
                    type="text"
                    value="LAB-CMP-042"
                    readOnly
                    className="w-full p-3.5 bg-slate-100/50 border border-slate-200/50 rounded-2xl text-sm font-bold text-slate-400 cursor-not-allowed outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Category
                  </label>
                  <select className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white outline-none">
                    <option>Clinical Chemistry</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Method
                  </label>
                  <input
                    type="text"
                    defaultValue="Spectrophotometry"
                    className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Dynamic Parameters Management Card */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8 flex justify-between items-center border-b border-slate-50">
                <div className="flex items-center gap-3 text-blue-600">
                  <Settings2 size={20} />
                  <h3 className="text-lg font-black text-slate-800">
                    Dynamic Parameters Management
                  </h3>
                </div>
                <button className="text-blue-600 text-xs font-black flex items-center gap-1.5 hover:underline">
                  <Plus size={14} strokeWidth={3} /> Add Parameter
                </button>
              </div>

              <div className="overflow-x-auto p-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 rounded-xl">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Parameter Name
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                        Unit
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                        Normal Range
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                        Critical Threshold
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {[
                      {
                        name: "Glucose, Serum",
                        unit: "mg/dL",
                        range: "65 — 99",
                        critical: "< 40 or > 400",
                      },
                      {
                        name: "BUN",
                        unit: "mg/dL",
                        range: "6 — 24",
                        critical: "> 100",
                      },
                      {
                        name: "Creatinine, Serum",
                        unit: "mg/dL",
                        range: "0.76 — 1.27",
                        critical: "> 5.0",
                      },
                    ].map((row, i) => (
                      <tr key={i}>
                        <td className="px-6 py-5 text-sm font-black text-slate-700">
                          {row.name}
                        </td>
                        <td className="px-6 py-5 text-sm font-bold text-slate-400 text-center">
                          {row.unit}
                        </td>
                        <td className="px-6 py-5 text-sm font-black text-slate-600 text-center">
                          {row.range}
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="text-xs font-black text-red-500 bg-red-50 px-3 py-1 rounded-lg">
                            {row.critical}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                              <Edit3 size={16} />
                            </button>
                            <button className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Pre-analytical & Stability */}
          <div className="space-y-8">
            {/* Pre-analytical Info Card */}
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-8">
              <div className="flex items-center gap-3 text-blue-600">
                <FlaskConical size={20} />
                <h3 className="text-lg font-black text-slate-800">
                  Pre-analytical Info
                </h3>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Sample Type
                  </label>
                  <select className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white outline-none">
                    <option>Serum (Gold/Red Top)</option>
                  </select>
                </div>
                <div className="p-5 bg-slate-50/50 rounded-3xl border border-slate-100 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-black text-slate-800">
                      Fasting Required
                    </p>
                    <p className="text-[10px] font-bold text-slate-400">
                      Patient must fast 8-12 hours
                    </p>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stability Settings Card */}
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-8">
              <div className="flex items-center gap-3 text-blue-600">
                <Thermometer size={20} />
                <h3 className="text-lg font-black text-slate-800">
                  Stability Settings
                </h3>
              </div>
              <div className="space-y-4">
                {[
                  {
                    label: "REFRIGERATED (2-8°C)",
                    value: "7 Days",
                    icon: "❄️",
                  },
                  {
                    label: "ROOM TEMP (20-25°C)",
                    value: "24 Hours",
                    icon: "🌡️",
                  },
                  { label: "FROZEN (-20°C)", value: "6 Months", icon: "🧊" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:bg-white hover:border-blue-100 transition-all cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-sm group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                        {item.label}
                      </p>
                      <p className="text-sm font-black text-slate-700">
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditLabTest;
