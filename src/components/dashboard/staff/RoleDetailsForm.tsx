import { BriefcaseMedical } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchApi } from '../../../api/config';

export interface StaffRoleDetails {
    role: string;

    // Shared / Doctor
    educationalQualification?: string;
    medicalSyndicateNumber?: string;
    graduationYear?: string;
    specialization?: string;
    dateOfAppointment?: string;
    clinicId?: string;

    // Shared new roles
    employmentDate?: string;
    shiftType?: string;

    // Nurse
    doctorId?: string;
    qualification?: string;
    syndicateRegistrationNumber?: string;
    nurseLevel?: string;
    nursingLicenseNumber?: string;

    // Lab Tech
    ltLicenseNumber?: string;
    canPerformTests?: boolean;
    canApproveResults?: boolean;
    canManageEquipment?: boolean;

    // Radiologist
    radiologistLicenseNumber?: string;
}

interface RoleDetailsFormProps {
    details: StaffRoleDetails;
    onChange: (details: StaffRoleDetails) => void;
}

const RoleDetailsForm = ({ details, onChange }: RoleDetailsFormProps) => {
    const [clinics, setClinics] = useState<any[]>([]);
    const [loadingClinics, setLoadingClinics] = useState(false);

    useEffect(() => {
        const loadClinics = async () => {
            setLoadingClinics(true);
            try {
                const res = await fetchApi<any>('/Patient/Clinics');
                const list = res?.data || (res as any)?.items || (res as any)?.data || (Array.isArray(res) ? res : []);
                setClinics(Array.isArray(list) ? list : list.data || list.items || []);
            } catch (err) {
                console.error('Failed to load clinics:', err);
            } finally {
                setLoadingClinics(false);
            }
        };
        loadClinics();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const target = e.target;
        const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
        onChange({
            ...details,
            [target.name]: value
        });
    };

    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center shrink-0 shadow-sm shadow-blue-200">
                        <BriefcaseMedical size={20} strokeWidth={2.5} />
                    </div>
                    <h2 className="text-xl font-extrabold text-slate-900">Section 2: Staff Role & Professional Details</h2>
                </div>
            </div>

            <div className="p-6 md:p-8">
                {/* Role Dropdown Out of Blue Box */}
                <div className="mb-8 w-full md:w-64">
                    <label className="block text-sm font-bold text-slate-900 mb-2">Staff Role</label>
                    <select
                        name="role"
                        value={details.role}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-blue-600 font-bold appearance-none"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239CA3AF' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                            backgroundPosition: `right .5rem center`,
                            backgroundRepeat: `no-repeat`,
                            backgroundSize: `1.5em 1.5em`,
                            paddingRight: `2.5rem`
                        }}
                    >
                        <option value="Doctor">Doctor</option>
                        <option value="Nurse">Nurse</option>
                        <option value="Lab Technician">Lab Technician</option>
                        <option value="Radiologist">Radiologist</option>
                        <option value="Admin">Admin</option>
                    </select>
                </div>

                {/* Box Details */}
                <div className="bg-[#7ab1b6] rounded-xl p-6 md:p-8">
                    {details.role === 'Doctor' && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="col-span-1 md:col-span-1">
                                <label className="block text-xs font-bold text-slate-800 mb-2 ml-1">Educational Qualification</label>
                                <input type="text" name="educationalQualification" value={details.educationalQualification || ''} onChange={handleChange} placeholder="MBBS, MD" className="w-full px-4 py-2.5 bg-white border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 text-slate-900 font-medium" />
                            </div>
                            <div className="col-span-1 md:col-span-1">
                                <label className="block text-xs font-bold text-slate-800 mb-2 ml-1">Medical Syndicate Number</label>
                                <input type="text" name="medicalSyndicateNumber" value={details.medicalSyndicateNumber || ''} onChange={handleChange} placeholder="REG-99283-X" className="w-full px-4 py-2.5 bg-white border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 text-slate-900 font-medium" />
                            </div>
                            <div className="col-span-1 md:col-span-1">
                                <label className="block text-xs font-bold text-slate-800 mb-2 ml-1">Graduation Year</label>
                                <input type="text" name="graduationYear" value={details.graduationYear || ''} onChange={handleChange} placeholder="2015" className="w-full px-4 py-2.5 bg-white border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 text-slate-900 font-medium" />
                            </div>
                            <div className="col-span-1 md:col-span-1">
                                <label className="block text-xs font-bold text-slate-800 mb-2 ml-1">Specialization</label>
                                <input type="text" name="specialization" value={details.specialization || ''} onChange={handleChange} placeholder="Cardiology" className="w-full px-4 py-2.5 bg-white border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 text-slate-900 font-medium" />
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-xs font-bold text-slate-800 mb-2 ml-1">Date Of Appointment</label>
                                <input type="date" name="dateOfAppointment" value={details.dateOfAppointment || ''} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 text-slate-500 font-medium" />
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-xs font-bold text-slate-800 mb-2 ml-1">Clinic ID</label>
                                <select name="clinicId" className="w-full px-4 py-2.5 bg-white border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 text-slate-900 font-medium appearance-none" value={details.clinicId || ''} onChange={handleChange}>
                                    <option value="">Select Clinic</option>
                                    {loadingClinics ? (
                                        <option value="" disabled>Loading...</option>
                                    ) : (
                                        clinics.map((c: any) => (
                                            <option key={c.id || c.clinicId} value={c.id || c.clinicId}>
                                                {c.name || c.clinicName || c.nameEnglish || `#${c.id || c.clinicId}`}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>
                        </div>
                    )}

                    {details.role === 'Nurse' && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-slate-800 mb-2 ml-1">Clinic ID</label>
                                <select name="clinicId" value={details.clinicId || ''} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border-0 rounded-xl focus:outline-none appearance-none font-medium">
                                    <option value="">Select Clinic ID</option>
                                    {loadingClinics ? (
                                        <option value="" disabled>Loading...</option>
                                    ) : (
                                        clinics.map((c: any) => (
                                            <option key={c.id || c.clinicId} value={c.id || c.clinicId}>
                                                {c.name || c.clinicName || c.nameEnglish || `#${c.id || c.clinicId}`}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-slate-800 mb-2 ml-1">Doctor ID</label>
                                <select name="doctorId" value={details.doctorId || ''} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border-0 rounded-xl focus:outline-none appearance-none font-medium">
                                    <option value="">Select Doctor ID</option>
                                    <option value="JNLL.LK">JNLL.LK</option>
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-slate-800 mb-2 ml-1">Specialization</label>
                                <select name="specialization" value={details.specialization || ''} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border-0 rounded-xl focus:outline-none appearance-none font-medium">
                                    <option value="">Select Specialization</option>
                                    <option value="Cardiology">Cardiology</option>
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-slate-800 mb-2 ml-1">Qualification</label>
                                <select name="qualification" value={details.qualification || ''} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border-0 rounded-xl focus:outline-none appearance-none font-medium">
                                    <option value="">Select Qualification</option>
                                    <option value="Cardiology">Cardiology</option>
                                </select>
                            </div>

                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-slate-800 mb-2 ml-1">Shift Type</label>
                                <select name="shiftType" value={details.shiftType || ''} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border-0 rounded-xl focus:outline-none appearance-none font-medium">
                                    <option value="">Select Shift Type</option>
                                    <option value="Morning">Morning</option>
                                    <option value="Evening">Evening</option>
                                    <option value="Night">Night</option>
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-slate-800 mb-2 ml-1">Employment Date</label>
                                <input type="date" name="employmentDate" value={details.employmentDate || ''} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border-0 rounded-xl focus:outline-none font-medium text-slate-500" />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-slate-800 mb-2 ml-1">Syndicate Registration Number</label>
                                <input type="text" name="syndicateRegistrationNumber" value={details.syndicateRegistrationNumber || ''} onChange={handleChange} placeholder="869867646" className="w-full px-4 py-2.5 bg-white border-0 rounded-xl focus:outline-none font-medium text-slate-900" />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-slate-800 mb-2 ml-1">Nurse Level</label>
                                <select name="nurseLevel" value={details.nurseLevel || ''} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border-0 rounded-xl focus:outline-none appearance-none font-medium">
                                    <option value="">Select Level</option>
                                    <option value="fkjvnhv">fkjvnhv</option>
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-slate-800 mb-2 ml-1">Nursing License Number</label>
                                <input type="text" name="nursingLicenseNumber" value={details.nursingLicenseNumber || ''} onChange={handleChange} placeholder="785979" className="w-full px-4 py-2.5 bg-white border-0 rounded-xl focus:outline-none font-medium text-slate-900" />
                            </div>
                        </div>
                    )}

                    {details.role === 'Lab Technician' && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-xs font-bold text-slate-800 mb-2 ml-1">Specialization</label>
                                <select name="specialization" value={details.specialization || ''} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border-0 rounded-xl focus:outline-none appearance-none font-medium">
                                    <option value="">Select Specialization</option>
                                    <option value="MBBS, MD">MBBS, MD</option>
                                </select>
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-xs font-bold text-slate-800 mb-2 ml-1">Employment Date</label>
                                <input type="date" name="employmentDate" value={details.employmentDate || ''} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border-0 rounded-xl focus:outline-none font-medium text-slate-500" />
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-xs font-bold text-slate-800 mb-2 ml-1">LT License Number</label>
                                <input type="text" name="ltLicenseNumber" value={details.ltLicenseNumber || ''} onChange={handleChange} placeholder="6478785" className="w-full px-4 py-2.5 bg-white border-0 rounded-xl focus:outline-none font-medium text-slate-900" />
                            </div>
                            <div className="col-span-1 md:col-span-1">
                                <label className="block text-xs font-bold text-slate-800 mb-2 ml-1">Shift Type</label>
                                <select name="shiftType" value={details.shiftType || ''} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border-0 rounded-xl focus:outline-none appearance-none font-medium">
                                    <option value="">Select Shift Type</option>
                                    <option value="morning">morning</option>
                                </select>
                            </div>

                            <div className="col-span-1 md:col-span-1 flex flex-col justify-end space-y-4 pt-4 md:pt-0">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" name="canPerformTests" checked={details.canPerformTests} onChange={handleChange} className="w-5 h-5 text-blue-600 bg-white border-none rounded focus:ring-blue-500" />
                                    <span className="text-sm font-bold text-slate-800">Can Perform Tests</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" name="canApproveResults" checked={details.canApproveResults} onChange={handleChange} className="w-5 h-5 text-blue-600 bg-white border-none rounded focus:ring-blue-500" />
                                    <span className="text-sm font-bold text-slate-800">Can Approve Results</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" name="canManageEquipment" checked={details.canManageEquipment} onChange={handleChange} className="w-5 h-5 text-blue-600 bg-white border-none rounded focus:ring-blue-500" />
                                    <span className="text-sm font-bold text-slate-800">Can Manage Equipment</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {details.role === 'Radiologist' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-slate-800 mb-2 ml-1">Specialization</label>
                                <select name="specialization" value={details.specialization || ''} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border-0 rounded-xl focus:outline-none appearance-none font-medium">
                                    <option value="">Select Specialization</option>
                                    <option value="MBBS, MD">MBBS, MD</option>
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-slate-800 mb-2 ml-1">Employment Date</label>
                                <input type="date" name="employmentDate" value={details.employmentDate || ''} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border-0 rounded-xl focus:outline-none font-medium text-slate-500" />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-slate-800 mb-2 ml-1">Shift Type</label>
                                <select name="shiftType" value={details.shiftType || ''} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border-0 rounded-xl focus:outline-none appearance-none font-medium">
                                    <option value="">Select Shift Type</option>
                                    <option value="morning">morning</option>
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-slate-800 mb-2 ml-1">Radiologist License Number</label>
                                <input type="text" name="radiologistLicenseNumber" value={details.radiologistLicenseNumber || ''} onChange={handleChange} placeholder="8393447" className="w-full px-4 py-2.5 bg-white border-0 rounded-xl focus:outline-none font-medium text-slate-900" />
                            </div>
                        </div>
                    )}



                    {details.role === 'Admin' && (
                        <div className="text-center py-6">
                            <p className="text-white font-medium">No additional professional details required for Administration staff.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoleDetailsForm;
