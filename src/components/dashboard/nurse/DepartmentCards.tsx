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
    Loader2
} from 'lucide-react';
import { getClinics } from '../../../api/clinics';
import { listAppointments } from '../../../api/appointments';

// Helper to map clinic names to specific icons from the design
const getClinicIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('cardiology') || n.includes('heart')) return HeartPulse;
    if (n.includes('pediatric') || n.includes('baby')) return Baby;
    if (n.includes('internal') || n.includes('medicine')) return Stethoscope;
    if (n.includes('surgery') || n.includes('surgeon')) return Scissors;
    if (n.includes('dermatology') || n.includes('skin')) return Hand;
    if (n.includes('orthopedic') || n.includes('bone')) return Bone;
    if (n.includes('pulmonology') || n.includes('lung')) return Activity;
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
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
            {departments.map((dept, index) => {
                const Icon = dept.icon;
                // Highlight the first card as in the design
                const isActive = index === 0;
                
                return (
                    <div 
                        key={dept.id} 
                        className={`min-w-[160px] p-5 rounded-2xl flex flex-col justify-between shrink-0 snap-start transition-all cursor-pointer border ${
                            isActive 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20' 
                            : 'bg-white text-slate-900 border-slate-100 hover:border-blue-200 shadow-sm'
                        }`}
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                            isActive ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-500'
                        }`}>
                            <Icon size={22} strokeWidth={2} />
                        </div>
                        
                        <div>
                            {dept.arabicName && (
                                <p className={`text-[10px] font-bold mb-1 ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                                    {dept.arabicName}
                                </p>
                            )}
                            <h4 className="font-bold text-[15px] leading-tight mb-2">
                                {dept.name}
                            </h4>
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                                isActive 
                                ? 'bg-white/20 text-white' 
                                : 'bg-blue-50 text-blue-600'
                            }`}>
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
