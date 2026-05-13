import React from 'react';
import { 
  ChevronLeft, 
  Info, 
  Box, 
  ClipboardList, 
  ShieldCheck, 
  FileText,
  Save
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddRadiologyTest: React.FC = () => {
  const navigate = useNavigate();

  return (
    // الحاوية الرئيسية مع تفعيل التمرير العمودي
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col overflow-hidden font-sans">
      
      {/* 1. Header الثابت */}
      <div className="bg-white border-b border-slate-100 px-8 py-6 sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto">
          {/* زر الرجوع الجديد */}
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors mb-4 group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold tracking-tight">Back to List</span>
          </button>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              {/* تكبير حجم الخط هنا */}
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                Add Radiology Test
              </h1>
              <p className="text-slate-500 text-base font-medium">
                Create a new imaging test configuration with clinical parameters.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(-1)}
                className="px-8 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-200"
              >
                Cancel
              </button>
              <button className="flex items-center gap-2 bg-[#1A6FC4] text-white px-10 py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-blue-100 hover:bg-[#165DA5] hover:-translate-y-0.5 transition-all">
                <Save size={20} />
                Save Radiology Test
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. منطقة المحتوى القابلة للتمرير */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        
        {/* <p className="text-slate-500 text-sm -mt-4">Create a new imaging test configuration with clinical parameters.</p> */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Section: Basic Information */}
          <FormCard icon={<Info size={18} />} title="Basic Information">
            <div className="space-y-6">
              <InputField label="Test Code" placeholder="e.g. XR-CHEST-01" />
              <InputField label="Test Name (English)" placeholder="e.g. Chest X-Ray PA View" />
              <InputField label="Test Name (Arabic)" placeholder="أشعة سينية على الصدر" dir="rtl" />
              <SelectField label="Category" options={['X-Ray', 'MRI', 'CT Scan', 'Ultrasound']} />
            </div>
          </FormCard>

          {/* Section: Imaging Details */}
          <FormCard icon={<Box size={18} />} title="Imaging Details">
            <div className="space-y-6">
              <SelectField label="Modality" options={['Computed Tomography', 'Magnetic Resonance', 'Ultrasound']} />
              <InputField label="Body Part" placeholder="e.g. Abdomen, Cranium" />
              <div className="relative">
                <InputField label="Duration (Minutes)" placeholder="15" />
                <span className="absolute right-4 bottom-3.5 text-[10px] font-black text-slate-400">MIN</span>
              </div>
              <div className="p-4 bg-blue-50/50 rounded-xl flex gap-3 border border-blue-100/50">
                <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
                  Standard duration helps in optimizing the clinical scheduling pipeline.
                </p>
              </div>
            </div>
          </FormCard>

          {/* Section: Preparation & Requirements */}
          <FormCard icon={<ClipboardList size={18} />} title="Preparation & Requirements">
            <div className="space-y-6">
              <InputField label="Fasting Hours" placeholder="0" />
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="text-sm font-bold text-slate-700">Requires Contrast</p>
                  <p className="text-[10px] text-slate-400 font-medium">Intravenous or Oral enhancement</p>
                </div>
                <Toggle active={true} />
              </div>
              <InputField label="Contrast Type" placeholder="e.g. Gadolinium, Iodine-based" />
            </div>
          </FormCard>

          {/* Section: Safety Settings */}
          <FormCard icon={<ShieldCheck size={18} />} title="Safety Settings">
            <div className="space-y-6">
              <SelectField label="Radiation Exposure" options={['Low', 'Medium', 'High']} />
              <div className="grid grid-cols-2 gap-4">
                <Checkbox label="Pregnancy Safe" />
                <Checkbox label="Pediatric Safe" checked={true} />
              </div>
              <InputField label="Minimum Age (Years)" placeholder="0" />
            </div>
          </FormCard>

          {/* Section: Status & Notes - يأخذ العرض الكامل */}
          <div className="lg:col-span-2">
            <FormCard 
              icon={<FileText size={18} />} 
              title="Status & Notes" 
              extra={<div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-lg">
                <span className="text-[10px] font-black text-green-600">IS ACTIVE</span>
                <Toggle active={true} size="sm" />
              </div>}
            >
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Clinical Notes & Contraindications</label>
                <textarea 
                  rows={4}
                  placeholder="Enter specific clinician instructions or general notes for the radiology technician..."
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 outline-none transition-all resize-none"
                />
              </div>
            </FormCard>
          </div>
        </div>

        {/* Clinical Standards Banner */}
        <div className="relative w-full h-48 rounded-[2.5rem] overflow-hidden bg-slate-900 group shadow-2xl shadow-slate-200">
          <img 
            src="https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?q=80&w=1200&auto=format&fit=crop" 
            alt="Clinical Standards"
            className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent flex flex-col justify-center px-12">
            <h3 className="text-2xl font-black text-white mb-2">Clinical Standards</h3>
            <p className="text-blue-100/80 text-sm max-w-lg leading-relaxed">
              Every new test configuration is automatically cross-referenced against global radiology safety protocols for maximum patient care.
            </p>
          </div>
        </div>
        
        {/* Padding إضافي في الأسفل لضمان ظهور المحتوى كاملاً فوق الـ Scroll */}
        <div className="h-10"></div>
      </div>
    </div>
  );
};

// --- المكونات المساعدة (UI Components) ---

const FormCard = ({ icon, title, children, extra }: any) => (
  <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm shadow-slate-100/50">
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shadow-sm shadow-blue-100/50">
          {icon}
        </div>
        <h3 className="text-lg font-black text-slate-900 tracking-tight">{title}</h3>
      </div>
      {extra}
    </div>
    {children}
  </div>
);

const InputField = ({ label, placeholder, dir = 'ltr' }: any) => (
  <div className="space-y-2.5">
    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input 
      type="text" 
      dir={dir}
      placeholder={placeholder}
      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 outline-none transition-all placeholder:text-slate-300"
    />
  </div>
);

const SelectField = ({ label, options }: any) => (
  <div className="space-y-2.5">
    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <select className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/5 outline-none appearance-none cursor-pointer">
      {options.map((opt: string) => <option key={opt}>{opt}</option>)}
    </select>
  </div>
);

const Toggle = ({ active, size = 'md' }: any) => (
  <div className={`${size === 'sm' ? 'w-8 h-4' : 'w-12 h-6'} ${active ? 'bg-green-500' : 'bg-slate-200'} rounded-full relative cursor-pointer p-1 transition-colors`}>
    <div className={`${size === 'sm' ? 'w-2 h-2' : 'w-4 h-4'} bg-white rounded-full transition-all ${active ? 'ml-auto' : ''}`}></div>
  </div>
);

const Checkbox = ({ label, checked = false }: any) => (
  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer">
    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${checked ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'}`}>
      {checked && <div className="w-2 h-2 bg-white rounded-full"></div>}
    </div>
    <span className="text-xs font-bold text-slate-600">{label}</span>
  </div>
);

export default AddRadiologyTest;