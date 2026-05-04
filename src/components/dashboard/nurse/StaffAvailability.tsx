import React, { useState, useEffect } from 'react';
import { staffApi } from '../../../api/staff';
import type { StaffProfile } from '../../../types/staff.types';
import { Loader2, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '../../../routes/routePaths';

const StaffAvailability: React.FC = () => {
    const [staff, setStaff] = useState<StaffProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStaff = async () => {
            setLoading(true);
            try {
                const res = await staffApi.getStaffs({ Role: 'Doctor', PageSize: 5 });
                let staffData = res?.staffs || (res as any)?.items || (res as any)?.data || res || [];
                if (!Array.isArray(staffData)) staffData = [];
                setStaff(staffData.slice(0, 4) as unknown as StaffProfile[]);
                
                // If empty, mock for UI
                if (staffData.length === 0) {
                    setStaff([
                        { id: 1, name: 'Dr. Sarah Jenkins', role: 'Doctor', department: 'Cardiology', status: 'Active', email: '', phone: '', gender: 'Female' },
                        { id: 2, name: 'Dr. Marcus Thorne', role: 'Doctor', department: 'Internal Medicine', status: 'Active', email: '', phone: '', gender: 'Male' },
                        { id: 3, name: 'Dr. Julian Vance', role: 'Doctor', department: 'Dermatology', status: 'Disabled', email: '', phone: '', gender: 'Male' }
                    ] as unknown as StaffProfile[]);
                }
            } catch (error) {
                console.error("Failed to fetch staff:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStaff();
    }, []);

    // Helper to generate a random status for the demo design (since backend doesn't have granular status)
    const getStatus = (staffMember: StaffProfile, index: number) => {
        if (staffMember.status === 'Disabled') return { text: 'BUSY', color: 'bg-red-50 text-red-600', dot: 'bg-red-500' };
        if (index === 1) return { text: 'IN SURGERY', color: 'bg-orange-50 text-orange-600', dot: 'bg-orange-500' };
        return { text: 'AVAILABLE', color: 'bg-green-50 text-green-600', dot: 'bg-green-500' };
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col h-full">
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-[15px] font-extrabold text-slate-900">Staff Availability</h3>
                <button 
                    onClick={() => navigate(PATHS.USER_MANAGEMENT)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                    View All
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-1 space-y-3">
                {loading ? (
                    <div className="flex justify-center p-4">
                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                    </div>
                ) : (
                    staff.map((member, index) => {
                        const status = getStatus(member, index);
                        return (
                            <div key={member.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-blue-100 hover:shadow-sm transition-all cursor-pointer group" onClick={() => navigate(`${PATHS.STAFF_PROFILE}/${member.id}`)}>
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 group-hover:border-blue-300 transition-colors">
                                            {member.avatar ? (
                                                <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="text-slate-400" size={20} />
                                            )}
                                        </div>
                                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${status.dot}`} />
                                    </div>
                                    
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                                            {member.name}
                                        </h4>
                                        <p className="text-[11px] font-medium text-slate-500">
                                            {member.department || 'General'}
                                        </p>
                                    </div>
                                </div>
                                
                                <span className={`px-2 py-1 rounded text-[9px] font-extrabold uppercase tracking-wider ${status.color}`}>
                                    {status.text}
                                </span>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default StaffAvailability;
