import React, { useState, useEffect } from 'react';
import { 
    HeartPulse, 
    Baby, 
    Stethoscope, 
    Scissors, 
    Hand, 
    Bone, 
    Activity, 
    Building2,
    Eye,
    Brain,
    Ear,
    Loader2
} from 'lucide-react';
import { getClinics } from '../../../api/clinics';
import { listAppointments } from '../../../api/appointments';

// Helper to map clinic names to specific icons from the design
const getClinicIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('cardiology') || n.includes('heart') || n.includes('القلب')) return HeartPulse;
    if (n.includes('pediatric') || n.includes('baby') || n.includes('أطفال')) return Baby;
    if (n.includes('internal') || n.includes('medicine') || n.includes('باطني')) return Stethoscope;
    if (n.includes('surgery') || n.includes('surgeon') || n.includes('جراح')) return Scissors;
    if (n.includes('dermatology') || n.includes('skin') || n.includes('جلد')) return Hand;
    if (n.includes('orthopedic') || n.includes('bone') || n.includes('عظام')) return Bone;
    if (n.includes('pulmonology') || n.includes('lung') || n.includes('صدر')) return Activity;
    if (n.includes('neurology') || n.includes('neuro') || n.includes('أعصاب')) return Brain;
    if (n.includes('ophthalmology') || n.includes('eye') || n.includes('عيون')) return Eye;
    if (n.includes('ent') || n.includes('ear') || n.includes('أنف') || n.includes('حنجرة')) return Ear;
    if (n.includes('oncology') || n.includes('أورام')) return Activity;
    if (n.includes('urology') || n.includes('مسالك')) return Building2;
    if (n.includes('gynecology') || n.includes('obstetric') || n.includes('نساء')) return Baby;
    if (n.includes('icu') || n.includes('عناية') || n.includes('مركزة')) return HeartPulse;
    return Building2;
};

interface DepartmentInfo {
    id: number;
    name: string;
    arabicName: string;
    patientCount: number;
    icon: React.ElementType;
}

const DepartmentCards: React.FC = () => {
    const [departments, setDepartments] = useState<DepartmentInfo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDepartments = async () => {
            setLoading(true);
            try {
                // Fetch active clinics
                const clinicsRes = await getClinics({ isActive: true, PageIndex: 0, PageSize: 50 });
                let clinicsData = clinicsRes?.data?.items || clinicsRes?.data || clinicsRes || [];
                if (!Array.isArray(clinicsData)) clinicsData = [];
                
                // For a real app, we would get the number of patients from a stats API.
                // Here we fetch today's appointments and count by clinic
                const today = new Date().toISOString().split('T')[0];
                const apptRes = await listAppointments({ StartDate: today, EndDate: today, PageSize: 1000 });
                let appts = apptRes?.data?.items || apptRes?.data || apptRes || [];
                if (!Array.isArray(appts)) appts = [];
                
                const deps: DepartmentInfo[] = clinicsData.map((clinic: any) => {
                    const clinicAppts = appts.filter((a: any) => a.clinicId === clinic.id);
                    return {
                        id: clinic.id,
                        name: clinic.name || 'Unknown',
                        arabicName: clinic.nameAr || '',
                        patientCount: clinicAppts.length, // Or use clinic.doctorsCount as fallback if no appts
                        icon: getClinicIcon(clinic.name || ''),
                    };
                });
                
                // If there are no clinics, add some mock ones matching the design to show the UI
                if (deps.length === 0) {
                    const mockDeps = [
                        { id: 1, name: 'Cardiology', arabicName: 'القلب', patientCount: 24, icon: HeartPulse },
                        { id: 2, name: 'Pediatrics', arabicName: 'طب الأطفال', patientCount: 18, icon: Baby },
                        { id: 3, name: 'Internal Medicine', arabicName: 'الطب الباطني', patientCount: 31, icon: Stethoscope },
                        { id: 4, name: 'Surgery', arabicName: 'الجراحة', patientCount: 12, icon: Scissors },
                        { id: 5, name: 'Dermatology', arabicName: 'الجلدية', patientCount: 9, icon: Hand },
                        { id: 6, name: 'Orthopedics', arabicName: 'العظام', patientCount: 9, icon: Bone },
                        { id: 7, name: 'Pulmonology', arabicName: 'الصدر', patientCount: 9, icon: Activity },
                        { id: 8, name: 'Neurology', arabicName: 'الأعصاب', patientCount: 9, icon: Brain },
                        { id: 9, name: 'Oncology', arabicName: 'الأورام', patientCount: 9, icon: Activity },
                        { id: 10, name: 'ICU', arabicName: 'العناية المركزة', patientCount: 9, icon: HeartPulse },
                        { id: 11, name: 'Urology', arabicName: 'المسالك البولية', patientCount: 9, icon: Building2 },
                        { id: 12, name: 'ENT', arabicName: 'الأنف والأذن والحنجرة', patientCount: 9, icon: Ear },
                        { id: 13, name: 'Ophthalmology', arabicName: 'العيون', patientCount: 9, icon: Eye },
                        { id: 14, name: 'Gynecology & Obstetrics', arabicName: 'النساء والتوليد', patientCount: 9, icon: Baby },
                    ];
                    setDepartments(mockDeps);
                } else {
                    setDepartments(deps);
                }

            } catch (error) {
                console.error("Error fetching departments:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDepartments();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 size={32} className="animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {departments.map((dept) => {
                const Icon = dept.icon;

                return (
                    <div
                        key={dept.id}
                        className="group/deptcard p-4 rounded-2xl flex flex-col justify-between transition-all duration-200 cursor-pointer border bg-white text-slate-900 border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:bg-[#0066cc] hover:text-white hover:border-[#0066cc] hover:shadow-[#0066cc]/20"
                    >
                        {/* Icon */}
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-colors duration-200 bg-blue-50 text-[#0066cc] group-hover/deptcard:bg-white/20 group-hover/deptcard:text-white">
                            <Icon size={20} strokeWidth={2} />
                        </div>

                        {/* Text */}
                        <div>
                            {dept.arabicName && (
                                <p className="text-[9px] font-bold mb-0.5 leading-tight transition-colors duration-200 text-slate-400 group-hover/deptcard:text-blue-100">
                                    {dept.arabicName}
                                </p>
                            )}
                            <h4 className="font-bold text-[14px] leading-tight mb-2 transition-colors duration-200">
                                {dept.name}
                            </h4>
                            <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full transition-colors duration-200 bg-blue-50 text-[#0066cc] group-hover/deptcard:bg-white/20 group-hover/deptcard:text-white">
                                {dept.patientCount} PATIENTS
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );



};

export default DepartmentCards;
