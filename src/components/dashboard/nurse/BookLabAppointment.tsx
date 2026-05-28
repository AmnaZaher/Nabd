import React, { useState } from 'react';
import { Search, FlaskConical, Clock, Info, ChevronDown } from 'lucide-react';
import TopBar from '../TopBar';

interface BookLabAppointmentProps {
    onMenuClick?: () => void;
    onProfileClick?: () => void;
}

const BookLabAppointment: React.FC<BookLabAppointmentProps> = ({
    onMenuClick,
    onProfileClick,
}) => {
    const [priority, setPriority] = useState<'Normal' | 'Urgent' | 'STAT'>('Urgent');

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-slate-50">
            <TopBar
                title="LABORATORY"
                onMenuClick={onMenuClick || (() => {})}
                onProfileClick={onProfileClick}
                showAddUser={true}
                isNurse={true}
            />

            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                <div className="max-w-[1200px] mx-auto mb-6">
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Book Laboratory Appointment</h2>
                </div>
                
                <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-6">
                    {/* Main Form Area */}
                    <div className="flex-1 space-y-6 min-w-0">
                        
                        {/* Patient Information */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 md:p-6">
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

                        {/* Laboratory Test */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 md:p-6 relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <FlaskConical size={20} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800">Laboratory Test</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Test Type</label>
                                    <div className="relative group">
                                        <select className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all appearance-none shadow-sm cursor-pointer">
                                            <option>Full Blood Count (FBC)</option>
                                            <option>Lipid Profile</option>
                                            <option>Liver Function Test</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                                            <ChevronDown size={16} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Department</label>
                                    <input 
                                        type="text" 
                                        defaultValue="Hematology"
                                        readOnly
                                        className="w-full px-4 py-2.5 bg-slate-100 border border-transparent rounded-xl text-sm font-semibold text-slate-600 cursor-not-allowed focus:outline-none"
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
                                                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
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
                                    placeholder="Enter clinical indications or physician instructions..."
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all resize-none shadow-sm"
                                ></textarea>
                            </div>
                        </div>

                        {/* Scheduling Details */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 md:p-6">
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
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Laboratory Room</label>
                                    <div className="relative group">
                                        <select className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all appearance-none shadow-sm cursor-pointer">
                                            <option>MRI Suite B (3.0T)</option>
                                            <option>Lab Room A</option>
                                            <option>Blood Draw Station 1</option>
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
                                            <option>Sarah M. (Phlebotomist)</option>
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
                        <div className="bg-[#0f62fe] rounded-3xl p-6 md:p-7 text-white shadow-xl shadow-blue-600/20 relative overflow-hidden h-fit">
                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/50 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>
                            
                            <h3 className="text-xl font-bold mb-7 relative z-10 tracking-tight">Booking Summary</h3>
                            
                            <div className="space-y-6 relative z-10">
                                <div>
                                    <p className="text-[11px] font-bold text-blue-200 uppercase tracking-wider mb-1.5">Selected Test</p>
                                    <p className="text-lg font-bold tracking-tight">Full Blood Count (FBC)</p>
                                    <div className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold backdrop-blur-sm">
                                        {priority} Priority
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[11px] font-bold text-blue-200 uppercase tracking-wider mb-1.5">Time</p>
                                        <p className="text-xl font-bold tracking-tight">10:30 AM</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-blue-200 uppercase tracking-wider mb-1.5">Duration</p>
                                        <p className="text-xl font-bold tracking-tight">15 Mins</p>
                                    </div>
                                </div>
                                
                                <div className="pt-5 border-t border-blue-400/30">
                                    <p className="text-[11px] font-bold text-blue-200 uppercase tracking-wider mb-1.5">Queue Number</p>
                                    <p className="text-3xl font-extrabold tracking-tight">#L-442</p>
                                </div>
                            </div>
                        </div>

                        {/* Info Alert */}
                        <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-100 flex gap-3 h-fit">
                            <div className="text-blue-500 shrink-0 mt-0.5">
                                <Info size={18} strokeWidth={2.5} />
                            </div>
                            <p className="text-[13px] text-slate-600 font-medium leading-relaxed">
                                Patient should fast for 8-12 hours before this procedure for accurate results.
                            </p>
                        </div>

                        {/* Confirm Button */}
                        <button className="w-full py-3.5 bg-[#0f62fe] hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-bold text-base shadow-md transition-all shadow-blue-500/20 transform active:scale-[0.98]">
                            Confirm Booking
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default BookLabAppointment;
