import React, { useState } from 'react';
import { Search, Activity, Clock, Info, ChevronDown, ClipboardCheck } from 'lucide-react';
import TopBar from '../TopBar';

interface BookRadiologyAppointmentProps {
    onMenuClick?: () => void;
    onProfileClick?: () => void;
}

const BookRadiologyAppointment: React.FC<BookRadiologyAppointmentProps> = ({
    onMenuClick,
    onProfileClick,
}) => {
    const [priority, setPriority] = useState<'Normal' | 'Urgent' | 'STAT'>('Urgent');

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-slate-50">
            <TopBar
                title="PATIENT VISIT"
                onMenuClick={onMenuClick || (() => {})}
                onProfileClick={onProfileClick}
                showAddUser={true}
                isNurse={true}
            />

            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                <div className="max-w-[1200px] mx-auto mb-6">
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Book Radiology Appointment</h2>
                </div>
                
                <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-6">
                    {/* Main Form Area */}
                    <div className="flex-1 space-y-6 min-w-0">
                        
                        {/* Patient Information */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 md:p-6 relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <Search size={20} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800">Patient Information</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">MRN / Patient Search</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <Search size={16} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                        </div>
                                        <input 
                                            type="text" 
                                            defaultValue="MRN-882941-X"
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Patient ID</label>
                                    <input 
                                        type="text" 
                                        defaultValue="PID-9902"
                                        readOnly
                                        className="w-full px-4 py-2.5 bg-slate-100 border border-transparent rounded-xl text-sm font-semibold text-slate-600 cursor-not-allowed focus:outline-none"
                                    />
                                </div>
                                
                                <div className="space-y-1.5 md:col-span-1">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                                    <input 
                                        type="text" 
                                        defaultValue="Jonathan Miller"
                                        readOnly
                                        className="w-full px-4 py-2.5 bg-slate-100 border border-transparent rounded-xl text-sm font-semibold text-slate-600 cursor-not-allowed focus:outline-none"
                                    />
                                </div>
                                
                                <div className="grid grid-cols-3 gap-4 md:col-span-1">
                                    <div className="col-span-1 space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Age</label>
                                        <input 
                                            type="text" 
                                            defaultValue="42 Yrs"
                                            readOnly
                                            className="w-full px-3 py-2.5 bg-slate-100 border border-transparent rounded-xl text-sm font-semibold text-slate-600 cursor-not-allowed focus:outline-none text-center"
                                        />
                                    </div>
                                    <div className="col-span-1 space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Gender</label>
                                        <input 
                                            type="text" 
                                            defaultValue="Male"
                                            readOnly
                                            className="w-full px-3 py-2.5 bg-slate-100 border border-transparent rounded-xl text-sm font-semibold text-slate-600 cursor-not-allowed focus:outline-none text-center"
                                        />
                                    </div>
                                    <div className="col-span-1 space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Phone</label>
                                        <input 
                                            type="text" 
                                            defaultValue="+1 (555) 012-3456"
                                            readOnly
                                            className="w-full px-3 py-2.5 bg-slate-100 border border-transparent rounded-xl text-sm font-semibold text-slate-600 cursor-not-allowed focus:outline-none whitespace-nowrap overflow-hidden text-ellipsis text-center"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Radiology Examination */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 md:p-6 relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <Activity size={20} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800">Radiology Examination</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Examination Type</label>
                                    <div className="relative group">
                                        <select className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all appearance-none shadow-sm cursor-pointer">
                                            <option>MRI Scan</option>
                                            <option>CT Scan</option>
                                            <option>X-Ray</option>
                                            <option>Ultrasound</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                                            <ChevronDown size={16} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Body Part / Region</label>
                                    <input 
                                        type="text" 
                                        defaultValue="Lumbar Spine"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2.5">Priority Level</label>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    {(['Normal', 'Urgent', 'STAT'] as const).map((p) => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setPriority(p)}
                                            className={`
                                                flex-1 py-2.5 px-4 rounded-xl text-sm font-bold border transition-all
                                                ${priority === p 
                                                    ? p === 'STAT' ? 'border-red-200 bg-white text-red-600 shadow-sm ring-1 ring-red-100' : 'border-blue-200 bg-white text-blue-600 shadow-sm ring-1 ring-blue-100'
                                                    : p === 'STAT' ? 'border-slate-200 bg-white text-red-400 hover:text-red-500 hover:bg-red-50' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                                }
                                            `}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Clinical Notes</label>
                                <textarea 
                                    rows={3}
                                    defaultValue="Rule out herniated disc L4-L5. Patient reports severe radiculopathy."
                                    placeholder="Enter clinical indications or physician instructions..."
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all resize-none shadow-sm"
                                ></textarea>
                            </div>
                        </div>

                        {/* Scheduling Details */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 md:p-6 relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <Clock size={20} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800">Scheduling Details</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Appointment Date</label>
                                    <input 
                                        type="text" 
                                        defaultValue="10/24/2023"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Available Time Slot</label>
                                    <div className="relative group">
                                        <select className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all appearance-none shadow-sm cursor-pointer">
                                            <option>11:00 AM (Recommended)</option>
                                            <option>11:30 AM</option>
                                            <option>12:00 PM</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                                            <ChevronDown size={16} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Radiology Room</label>
                                    <div className="relative group">
                                        <select className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all appearance-none shadow-sm cursor-pointer">
                                            <option>MRI Suite B (3.0T)</option>
                                            <option>CT Room A</option>
                                            <option>X-Ray Room 1</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                                            <ChevronDown size={16} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Assign Technician</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <div className="w-5 h-5 rounded-full bg-slate-200 overflow-hidden">
                                                <img src={`https://i.pravatar.cc/150?u=david`} alt="Tech" className="w-full h-full object-cover" />
                                            </div>
                                        </div>
                                        <select className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all appearance-none shadow-sm cursor-pointer">
                                            <option>David K. (Senior Tech)</option>
                                            <option>Sarah M. (Tech)</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                                            <ChevronDown size={16} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar - Summary */}
                    <div className="w-full lg:w-[360px] flex flex-col gap-6 shrink-0">
                        {/* Booking Summary Card */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                            {/* Header */}
                            <div className="bg-[#0f62fe] px-5 py-4 flex items-center gap-3">
                                <ClipboardCheck size={20} className="text-white" strokeWidth={2.5} />
                                <h3 className="text-base font-bold text-white tracking-tight">Appointment Summary</h3>
                            </div>
                            
                            <div className="p-5 flex flex-col gap-5">
                                {/* Modality Image Card */}
                                <div className="relative rounded-xl overflow-hidden h-36 border border-slate-200/50 shadow-inner group">
                                    <img src="/mri-scanner.png" alt="MRI Scanner" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <span className="inline-block px-2 py-0.5 bg-blue-500 text-white text-[9px] font-bold uppercase tracking-widest rounded-md mb-1 shadow-sm">Modality Selected</span>
                                        <p className="text-white font-bold text-lg leading-tight tracking-tight shadow-sm">MRI Lumbar Spine</p>
                                    </div>
                                </div>

                                {/* Details List */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                                        <span className="text-sm font-semibold text-slate-500">Scheduled Time</span>
                                        <span className="text-sm font-bold text-slate-800">Oct 24 • 11:00 AM</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                                        <span className="text-sm font-semibold text-slate-500">Est. Duration</span>
                                        <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                            <Clock size={14} className="text-slate-400" />
                                            45 Minutes
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-semibold text-slate-500">Room Allocation</span>
                                        <span className="text-sm font-bold text-slate-800">MRI Suite B</span>
                                    </div>
                                </div>

                                {/* Queue Box */}
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col mt-2">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Queue Position</span>
                                    <span className="text-2xl font-extrabold text-[#0f62fe] tracking-tight">#14</span>
                                </div>
                                
                                <p className="text-xs text-center text-slate-500 mt-2 px-2 leading-relaxed">
                                    Finalizing this booking will send a notification to the patient via SMS and update the Nursing Station dashboard.
                                </p>
                            </div>
                        </div>

                        {/* Confirm Button */}
                        <button className="w-full py-3.5 bg-[#0f62fe] hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-bold text-base shadow-md transition-all shadow-blue-500/20 transform active:scale-[0.98]">
                            Confirm Appointment
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default BookRadiologyAppointment;
