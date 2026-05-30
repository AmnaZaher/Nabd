import { useState, useRef, useEffect } from 'react';
import { UserPlus, User, Stethoscope, BriefcaseMedical, FlaskConical, ScanEye, Pill } from 'lucide-react';

interface AddUserButtonProps {
    onClick: (type: 'patient' | 'staff', role?: string) => void;
}

const GENERAL_USERS = [
    {
        label: 'Patient',
        desc: 'Register new patient and assign ward',
        icon: User,
        type: 'patient' as const,
    },
];

const MEDICAL_STAFF = [
    { label: 'Doctor', desc: 'Add medical staff with specialization', icon: Stethoscope, role: 'Doctor' },
    { label: 'Nurse', desc: 'Onboard clinical nursing staff', icon: BriefcaseMedical, role: 'Nurse' },
    { label: 'Lab Technician', desc: 'Laboratory and diagnostic personnel', icon: FlaskConical, role: 'Lab Technician' },
    { label: 'Radiologist', desc: 'Imaging and radiology specialists', icon: ScanEye, role: 'Radiologist' },
];

export const AddUserButton = ({ onClick }: AddUserButtonProps) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold shadow-md transition-all active:scale-95 text-sm"
            >
                <UserPlus size={17} />
                <span>Add User</span>
            </button>

            {/* Dropdown */}
            {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 py-4 z-50 overflow-hidden">

                    {/* General Users Section */}
                    <p className="px-5 pb-2 text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                        General Users
                    </p>

                    {GENERAL_USERS.map((item) => (
                        <button
                            key={item.label}
                            onClick={() => {
                                setIsDropdownOpen(false);
                                onClick(item.type);
                            }}
                            className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-slate-50 transition-colors group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                <item.icon size={20} className="text-blue-600" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                                <p className="text-xs text-slate-400">{item.desc}</p>
                            </div>
                        </button>
                    ))}

                    {/* Divider */}
                    <div className="border-t border-slate-100 my-3" />

                    {/* Medical Staff Section */}
                    <p className="px-5 pb-2 text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                        Medical Staff
                    </p>

                    {MEDICAL_STAFF.map((item) => (
                        <button
                            key={item.label}
                            onClick={() => {
                                setIsDropdownOpen(false);
                                onClick('staff', item.role);
                            }}
                            className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-slate-50 transition-colors group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                <item.icon size={20} className="text-blue-600" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                                <p className="text-xs text-slate-400">{item.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};