import React from "react";
import {
  Plus,
  Search,
  ChevronDown,
  Activity,
  Clock,
  CheckCircle2,
  Edit,
  Trash2,
  Layers,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const RadiologyPage: React.FC = () => {
  const navigate = useNavigate();
  // بيانات تجريبية (Mock Data)
  const tests = [
    {
      code: "RAD-0021",
      nameEn: "Chest X-Ray (Posterior-Anterior)",
      nameAr: "تصوير الصدر بالأشعة السينية (خلفي أمامي)",
      category: "X-Ray",
      bodyPart: "Thorax",
      duration: "15 min",
      status: "Active",
      contrast: "No",
    },
    {
      code: "RAD-3012",
      nameEn: "Brain MRI with Gadolinium",
      nameAr: "تصوير الرنين المغناطيسي للدماغ مع الجادولينيوم",
      category: "MRI",
      bodyPart: "Head/Neck",
      duration: "45 min",
      status: "Active",
      contrast: "Yes",
    },
    {
      code: "RAD-2285",
      nameEn: "Abdominal Ultrasound",
      nameAr: "تصوير البطن بالموجات فوق الصوتية",
      category: "Ultrasound",
      bodyPart: "Abdomen",
      duration: "30 min",
      status: "Inactive",
      contrast: "No",
    },
    {
      code: "RAD-1120",
      nameEn: "CT Angiogram Coronary",
      nameAr: "تصوير الأوعية التاجية بالأشعة المقطعية",
      category: "CT Scan",
      bodyPart: "Thorax",
      duration: "40 min",
      status: "Active",
      contrast: "Yes",
    },
  ];

  return (
    <div className="flex-1 bg-[#F8FAFC] min-h-screen p-6 font-sans">
      {/* 1. Top Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Radiology Tests Catalog
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Manage all radiology exams and imaging configurations
          </p>
        </div>
        <button
          onClick={() => {
            console.log("Button Clicked!");
            navigate("add");
          }}
          className="flex items-center gap-2 bg-[#1A6FC4] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-[#165DA5] transition-all"
        >
          <Plus size={20} />
          Add Radiology Test
        </button>
      </div>

      {/* 2. Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[300px]">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by test name or code..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
            />
          </div>

          {/* Filter Dropdowns */}
          <FilterItem label="Category" value="All Modalities" />
          <FilterItem label="Body Part" value="Whole Body" />
          <FilterItem label="Contrast" value="All" />
          <FilterItem label="Status" value="Active Only" />
        </div>
      </div>

      {/* 3. Data Table Section */}
      <div className="sticky top-0 z-10 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                Test Code
              </th>
              <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                Test Name (EN/AR)
              </th>
              <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                Category
              </th>
              <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                Body Part
              </th>
              <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                Duration
              </th>
              <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">
                Status
              </th>
              <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {tests.map((test, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4">
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-black tracking-wider">
                    {test.code}
                  </span>
                </td>
                <td className="p-4">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">
                      {test.nameEn}
                    </p>
                    <p
                      className="text-[11px] text-slate-400 font-bold mt-0.5"
                      dir="rtl"
                    >
                      {test.nameAr}
                    </p>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-bold text-slate-600">
                      {test.category}
                    </span>
                  </div>
                </td>
                <td className="p-4 text-sm font-bold text-slate-500">
                  {test.bodyPart}
                </td>
                <td className="p-4 text-sm font-bold text-slate-500">
                  {test.duration}
                </td>
                <td className="p-4 text-center">
                  <span
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      test.status === "Active"
                        ? "bg-green-50 text-green-600"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {test.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                      <Edit size={18} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-50/30 flex justify-between items-center border-t border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Showing 1-4 of 128 results
          </p>
          <div className="flex gap-2">
            <PaginationButton active={false}>&lt;</PaginationButton>
            <PaginationButton active={true}>1</PaginationButton>
            <PaginationButton active={false}>2</PaginationButton>
            <PaginationButton active={false}>3</PaginationButton>
            <PaginationButton active={false}>&gt;</PaginationButton>
          </div>
        </div>
      </div>

      {/* 4. Bottom Statistics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon={<Layers className="text-blue-500" />}
          label="Total Tests"
          value="128"
          sub="+4 added this month"
        />
        <StatCard
          icon={<Activity className="text-red-500" />}
          label="Contrast Required"
          value="32%"
          sub="41 specific exams"
        />
        <StatCard
          icon={<Clock className="text-amber-500" />}
          label="Avg. Duration"
          value="24 min"
          sub="Across all modalities"
        />
        <StatCard
          icon={<CheckCircle2 className="text-green-500" />}
          label="Active Catalog"
          value="94%"
          sub="120 live imaging tools"
        />
      </div>
    </div>
  );
};

// --- المكونات الفرعية (Sub-components) ---

const FilterItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col">
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1">
      {label}
    </span>
    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-100 transition-all">
      <span className="text-xs font-bold text-slate-700">{value}</span>
      <ChevronDown size={14} className="text-slate-400" />
    </div>
  </div>
);

const PaginationButton = ({
  children,
  active,
}: {
  children: React.ReactNode;
  active: boolean;
}) => (
  <button
    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black transition-all ${
      active
        ? "bg-[#1A6FC4] text-white shadow-md shadow-blue-100"
        : "bg-white text-slate-400 hover:bg-slate-100"
    }`}
  >
    {children}
  </button>
);

const StatCard = ({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex gap-4 items-center">
    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-xl shrink-0">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
        {label}
      </p>
      <h4 className="text-xl font-black text-slate-900 leading-none">
        {value}
      </h4>
      <p className="text-[10px] text-green-500 font-bold mt-1.5">{sub}</p>
    </div>
  </div>
);

export default RadiologyPage;
