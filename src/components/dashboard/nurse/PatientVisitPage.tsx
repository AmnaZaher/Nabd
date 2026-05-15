import React, { useState, useEffect } from "react";
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
  Loader2
} from "lucide-react";
import TopBar from "../TopBar";
import { listAppointments, getAppointmentDetails, type Appointment } from "../../../api/appointments";
import { visitApi, type CreateVisitPayload } from "../../../api/visit";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";

interface PatientVisitPageProps {
  onMenuClick?: () => void;
  onProfileClick?: () => void;
}

const PatientVisitPage: React.FC<PatientVisitPageProps> = ({ onMenuClick, onProfileClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const appointmentIdFromQuery = searchParams.get('appointmentId');
  const passedApptId = location.state?.selectedApptId || appointmentIdFromQuery;
  
  const [priority, setPriority] = useState<"routine" | "urgent">("routine");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedApptId, setSelectedApptId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<CreateVisitPayload>>({
    VisitType: "Consultation",
    ChiefComplaint: "",
    Notes: "",
    "VitalSigns.Notes": ""
  });
  
  // Vitals state
  const [vitals, setVitals] = useState({
    Temperature: "",
    BloodPressureSystolic: "",
    BloodPressureDiastolic: "",
    HeartRate: "",
    RespiratoryRate: "",
    OxygenSaturation: "",
    Weight: "",
    Height: "",
    BloodGlucose: ""
  });

  const [attachments, setAttachments] = useState<File[]>([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const today = new Date().toISOString().split('T')[0];
        // Fetch Scheduled (1) and InProgress (2) appointments
        const res = await listAppointments({ DateAppointment: today, PageSize: 50, PageIndex: 0 });
        const raw = res as any;
        let appts: Appointment[] = raw?.data?.data || raw?.data?.appointments || raw?.data?.items || (Array.isArray(raw?.data) ? raw.data : []) || raw?.appointments || raw?.items || [];
        appts = appts.filter(a => a.status === 1 || a.status === 2);
        
        // If passedApptId exists and is NOT in the appts list, fetch it specifically
        if (passedApptId && !appts.some(a => a.id.toString() === passedApptId.toString())) {
            try {
                const singleRes = await getAppointmentDetails(passedApptId);
                if (singleRes?.data) {
                    appts = [singleRes.data, ...appts];
                }
            } catch (err) {
                console.warn("Failed to fetch specific appointment:", passedApptId);
            }
        }

        setAppointments(appts);
        if (passedApptId) {
          setSelectedApptId(passedApptId.toString());
        } else if (appts.length > 0) {
          setSelectedApptId(appts[0].id.toString());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [passedApptId]);

  const selectedAppt = appointments.find(a => a.id.toString() === selectedApptId);

  // BMI Calculation
  const weight = parseFloat(vitals.Weight);
  const height = parseFloat(vitals.Height) / 100; // cm to m
  const bmi = (weight > 0 && height > 0) ? (weight / (height * height)).toFixed(1) : "";

  const handleVitalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVitals(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const handleSubmit = async () => {
    if (!selectedApptId) {
      setError("Please select an appointment first.");
      return;
    }
    if (!formData.ChiefComplaint) {
      setError("Chief Complaint is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload: CreateVisitPayload = {
        ...formData,
        Notes: `${priority.toUpperCase()} Priority - ${formData.Notes || ''}`,
      };
      
      // Parse vitals
      if (vitals.Temperature) payload["VitalSigns.Temperature"] = parseFloat(vitals.Temperature);
      if (vitals.BloodPressureSystolic) payload["VitalSigns.BloodPressureSystolic"] = parseFloat(vitals.BloodPressureSystolic);
      if (vitals.BloodPressureDiastolic) payload["VitalSigns.BloodPressureDiastolic"] = parseFloat(vitals.BloodPressureDiastolic);
      if (vitals.HeartRate) payload["VitalSigns.HeartRate"] = parseFloat(vitals.HeartRate);
      if (vitals.RespiratoryRate) payload["VitalSigns.RespiratoryRate"] = parseFloat(vitals.RespiratoryRate);
      if (vitals.OxygenSaturation) payload["VitalSigns.OxygenSaturation"] = parseFloat(vitals.OxygenSaturation);
      if (vitals.Weight) payload["VitalSigns.Weight"] = parseFloat(vitals.Weight);
      if (vitals.Height) payload["VitalSigns.Height"] = parseFloat(vitals.Height);
      if (vitals.BloodGlucose) payload["VitalSigns.BloodGlucose"] = parseFloat(vitals.BloodGlucose);
      if (bmi) payload["VitalSigns.BMI"] = parseFloat(bmi);
      
      if (attachments.length > 0) {
        payload.Attachments = attachments;
      }

      await visitApi.createVisit(selectedApptId, payload);
      setSuccess(true);
      
      // Reset form on success
      setTimeout(() => {
        setSuccess(false);
        // Refresh appointments
        setAppointments(prev => prev.filter(a => a.id.toString() !== selectedApptId));
        setSelectedApptId("");
        setFormData({ VisitType: "Consultation", ChiefComplaint: "", Notes: "", "VitalSigns.Notes": "" });
        setVitals({ Temperature: "", BloodPressureSystolic: "", BloodPressureDiastolic: "", HeartRate: "", RespiratoryRate: "", OxygenSaturation: "", Weight: "", Height: "", BloodGlucose: "" });
        setAttachments([]);
      }, 3000);

    } catch (err: any) {
      setError(err.message || "Failed to create visit.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <TopBar
        title="Create Patient Visit"
        onMenuClick={onMenuClick || (() => {})}
        onProfileClick={onProfileClick}
        showAddUser={false}
        isNurse={true}
      />
      <div className="flex-1 bg-[#F8FAFC] overflow-y-auto font-sans pb-12">
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
        
        {success && (
          <div className="mb-8 p-4 bg-green-50 text-green-700 rounded-xl font-bold flex items-center gap-3">
            <CheckCircle2 size={24} />
            Visit created successfully!
          </div>
        )}

        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-xl font-bold flex items-center gap-3">
            <Info size={24} />
            {error}
          </div>
        )}

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
                <div className="relative">
                  {loading ? (
                    <div className="flex items-center justify-center p-5 bg-[#F1F5F9] rounded-2xl">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    </div>
                  ) : (
                    <>
                      <select 
                        value={selectedApptId} 
                        onChange={(e) => setSelectedApptId(e.target.value)}
                        className="w-full bg-[#F1F5F9] border-2 border-transparent rounded-2xl p-5 text-sm font-bold text-slate-700 appearance-none focus:bg-white focus:border-blue-500 transition-all outline-none"
                      >
                        <option value="">-- Select Appointment --</option>
                        {appointments.map(a => (
                          <option key={a.id} value={a.id}>
                            {a.patientName} - Dr. {a.doctorName} - {new Date(a.appointmentDate || a.dateTime || '').toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={24} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </>
                  )}
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
                    <select 
                      value={formData.VisitType}
                      onChange={(e) => setFormData({...formData, VisitType: e.target.value})}
                      className="w-full bg-[#F1F5F9] border-2 border-transparent rounded-xl p-4 text-sm font-bold text-slate-700 appearance-none focus:bg-white focus:border-blue-500 transition-all outline-none"
                    >
                      <option value="Consultation">Consultation</option>
                      <option value="Follow-up">Follow-up</option>
                      <option value="Emergency">Emergency</option>
                    </select>
                    <ChevronDown size={20} className="absolute right-4 top-4 text-slate-500 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">
                    Priority Level
                  </label>
                  <div className="flex gap-4">
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

                    <button
                      onClick={() => setPriority("urgent")}
                      className={`flex-1 py-4 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-sm border-2 ${
                        priority === "urgent"
                          ? "border-red-500 bg-red-50 text-red-600" 
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
                  value={formData.ChiefComplaint}
                  onChange={(e) => setFormData({...formData, ChiefComplaint: e.target.value})}
                  placeholder="Primary reason for patient's visit..."
                  className="w-full bg-[#F1F5F9] rounded-2xl p-5 min-h-[120px] border-2 border-transparent focus:bg-white focus:border-blue-500 transition-all outline-none placeholder:text-slate-400 font-bold text-sm"
                ></textarea>
              </div>
            </section>
          </div>

          {/* Right Column (Summary Card) - 4 Cols */}
          <div className="lg:col-span-4 h-full">
            <div className="bg-[#1A6FC4] text-white rounded-[2.5rem] p-10 shadow-2xl shadow-blue-200 relative overflow-hidden h-full min-h-[400px]">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
              <h3 className="text-xs font-black uppercase tracking-[0.3em] opacity-50 mb-10 text-white">
                Visit Summary
              </h3>
              
              {selectedAppt ? (
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
                        {selectedAppt.patientName}
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
                        Dr. {selectedAppt.doctorName}
                      </h4>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 opacity-70">
                  <Info size={48} className="mb-4 text-blue-200" />
                  <p className="text-sm font-bold text-center">Select an appointment to view summary</p>
                </div>
              )}

              <div className="mt-12 bg-white/10 border border-white/20 rounded-[1.5rem] p-6 flex gap-4 backdrop-blur-sm">
                <Info size={28} className="shrink-0 text-blue-200" />
                <p className="text-xs font-bold leading-relaxed opacity-90 italic text-white">
                  Note: Vitals are synced in real-time.
                </p>
              </div>
            </div>
          </div>
        </div>

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
              <div className="p-6 rounded-[1.25rem] border-2 bg-[#F8FAFC] border-slate-100 transition-all shadow-sm focus-within:border-blue-500 focus-within:bg-white">
                <label className="block text-[10px] font-black uppercase tracking-widest mb-2 text-slate-400">Temp (°C)</label>
                <input type="number" step="0.1" name="Temperature" value={vitals.Temperature} onChange={handleVitalChange} className="w-full bg-transparent text-2xl font-black text-slate-800 outline-none" placeholder="0.0" />
              </div>
              <div className="p-6 rounded-[1.25rem] border-2 bg-[#F8FAFC] border-slate-100 transition-all shadow-sm flex gap-2">
                <div className="flex-1 focus-within:border-blue-500 focus-within:bg-white rounded-lg p-2 -m-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest mb-2 text-slate-400">SYS</label>
                  <input type="number" name="BloodPressureSystolic" value={vitals.BloodPressureSystolic} onChange={handleVitalChange} className="w-full bg-transparent text-xl font-black text-slate-800 outline-none" placeholder="120" />
                </div>
                <div className="text-slate-300 text-2xl font-light mt-6">/</div>
                <div className="flex-1 focus-within:border-blue-500 focus-within:bg-white rounded-lg p-2 -m-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest mb-2 text-slate-400">DIA</label>
                  <input type="number" name="BloodPressureDiastolic" value={vitals.BloodPressureDiastolic} onChange={handleVitalChange} className="w-full bg-transparent text-xl font-black text-slate-800 outline-none" placeholder="80" />
                </div>
              </div>
              <div className="p-6 rounded-[1.25rem] border-2 bg-[#F8FAFC] border-slate-100 transition-all shadow-sm focus-within:border-blue-500 focus-within:bg-white">
                <label className="block text-[10px] font-black uppercase tracking-widest mb-2 text-slate-400">HR (BPM)</label>
                <input type="number" name="HeartRate" value={vitals.HeartRate} onChange={handleVitalChange} className="w-full bg-transparent text-2xl font-black text-slate-800 outline-none" placeholder="0" />
              </div>
              <div className="p-6 rounded-[1.25rem] border-2 bg-[#F8FAFC] border-slate-100 transition-all shadow-sm focus-within:border-blue-500 focus-within:bg-white">
                <label className="block text-[10px] font-black uppercase tracking-widest mb-2 text-slate-400">SPO2 (%)</label>
                <input type="number" name="OxygenSaturation" value={vitals.OxygenSaturation} onChange={handleVitalChange} className="w-full bg-transparent text-2xl font-black text-slate-800 outline-none" placeholder="0" />
              </div>
              <div className="p-6 rounded-[1.25rem] border-2 bg-[#F8FAFC] border-slate-100 transition-all shadow-sm focus-within:border-blue-500 focus-within:bg-white">
                <label className="block text-[10px] font-black uppercase tracking-widest mb-2 text-slate-400">Weight (KG)</label>
                <input type="number" step="0.1" name="Weight" value={vitals.Weight} onChange={handleVitalChange} className="w-full bg-transparent text-2xl font-black text-slate-800 outline-none" placeholder="0.0" />
              </div>
              <div className="p-6 rounded-[1.25rem] border-2 bg-[#F8FAFC] border-slate-100 transition-all shadow-sm focus-within:border-blue-500 focus-within:bg-white">
                <label className="block text-[10px] font-black uppercase tracking-widest mb-2 text-slate-400">Height (CM)</label>
                <input type="number" name="Height" value={vitals.Height} onChange={handleVitalChange} className="w-full bg-transparent text-2xl font-black text-slate-800 outline-none" placeholder="0" />
              </div>
              <div className="p-6 rounded-[1.25rem] border-2 bg-[#F8FAFC] border-slate-100 transition-all shadow-sm focus-within:border-blue-500 focus-within:bg-white">
                <label className="block text-[10px] font-black uppercase tracking-widest mb-2 text-slate-400">Glucose</label>
                <input type="number" name="BloodGlucose" value={vitals.BloodGlucose} onChange={handleVitalChange} className="w-full bg-transparent text-2xl font-black text-slate-800 outline-none" placeholder="0" />
              </div>
              <div className="p-6 rounded-[1.25rem] border-2 border-blue-500 bg-blue-50 transition-all shadow-sm">
                <label className="block text-[10px] font-black uppercase tracking-widest mb-2 text-blue-600">BMI (CALC)</label>
                <p className="text-2xl font-black text-blue-700">{bmi || "--"}</p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">
                Nurse Observation Notes
              </label>
              <textarea
                value={formData["VitalSigns.Notes"]}
                onChange={(e) => setFormData({...formData, "VitalSigns.Notes": e.target.value})}
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
              <label className="min-w-[180px] h-32 border-3 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 cursor-pointer transition-all bg-[#F8FAFC]">
                <input type="file" multiple className="hidden" onChange={handleFileChange} />
                <Upload size={32} className="mb-2 opacity-50" />
                <span className="text-[11px] font-black uppercase tracking-widest">
                  Upload File
                </span>
              </label>
              {attachments.map((file, i) => (
                <div key={i} className="min-w-[180px] h-32 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center p-4 relative">
                  <Paperclip size={24} className="text-slate-400 mb-2" />
                  <p className="text-xs font-bold text-slate-700 truncate w-full text-center">{file.name}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Action Buttons Section */}
          <div className="p-6 mt-8 rounded-xl border-slate-100 flex justify-end gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="px-10 py-3 bg-[#E2E8F0] text-slate-700 font-medium rounded-lg hover:bg-slate-300 transition-colors text-sm"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              disabled={submitting}
              className="px-10 py-3 bg-[#0061BC] text-white font-medium rounded-lg hover:bg-[#0052A3] transition-all flex items-center gap-2 text-sm shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : (
                <div className="bg-white rounded-full p-0.5">
                  <CheckCircle2 size={14} className="text-[#0061BC] fill-white" />
                </div>
              )}
              Create Visit
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default PatientVisitPage;
