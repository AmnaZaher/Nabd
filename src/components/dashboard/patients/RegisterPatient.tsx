import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Loader2, UserPlus } from 'lucide-react';
import { AddUserButton } from '../shared/AddUserButton';
import { registerPatient } from '../../../api/auth';
import MedicalHistoryForm from './MedicalHistoryForm';
import type { MedicalRecord } from './MedicalHistoryForm';
import PersonalInfoForm from './PersonalInfoForm';
import type { PersonalInfo } from './PersonalInfoForm';
import AllergiesForm from './AllergiesForm';
import type { AllergyRecord } from './AllergiesForm';
import ChronicDiseasesForm from './ChronicDiseasesForm';
import type { ChronicDiseaseRecord } from './ChronicDiseasesForm';

interface RegisterPatientProps {
    onSwitchView?: (type: 'patient' | 'staff', role?: string) => void;
    isNurse?: boolean;
}

const RegisterPatient = ({ onSwitchView, isNurse = false }: RegisterPatientProps) => {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
        firstName: '',
        middleName: '',
        lastName: '',
        fullNameArabic: '',
        dateOfBirth: '',
        gender: '1',
        nationalId: '',
        phoneNumber: '',
        email: '',
        address: '',
        city: '',
        country: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        bloodGroup: '1'
    });
    const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
    const [allergyRecords, setAllergyRecords] = useState<AllergyRecord[]>([]);
    const [chronicDiseaseRecords, setChronicDiseaseRecords] = useState<ChronicDiseaseRecord[]>([]);

    const handleAddRecord = (record: MedicalRecord) => {
        setMedicalRecords([...medicalRecords, record]);
    };

    const handleRemoveMedicalRecord = (index: number) => {
        setMedicalRecords(medicalRecords.filter((_, i) => i !== index));
    };

    const handleAddAllergy = (record: AllergyRecord) => {
        setAllergyRecords([...allergyRecords, record]);
    };

    const handleRemoveAllergy = (index: number) => {
        setAllergyRecords(allergyRecords.filter((_, i) => i !== index));
    };

    const handleAddChronicDisease = (record: ChronicDiseaseRecord) => {
        setChronicDiseaseRecords([...chronicDiseaseRecords, record]);
    };

    const handleRemoveChronicDisease = (index: number) => {
        setChronicDiseaseRecords(chronicDiseaseRecords.filter((_, i) => i !== index));
    };

    const steps = [
        { num: 1, label: 'Personal Info' },
        { num: 2, label: 'Medical History' },
        { num: 3, label: 'Allergies' },
        { num: 4, label: 'Chronic Diseases' }
    ];

    const handleSave = async () => {
        setIsSubmitting(true);
        setSubmitMessage(null);
        try {
            const payload = {
                fullNameEnglish: [personalInfo.firstName, personalInfo.middleName, personalInfo.lastName].filter(Boolean).join(' '),
                fullNameArabic: personalInfo.fullNameArabic || [personalInfo.firstName, personalInfo.middleName, personalInfo.lastName].filter(Boolean).join(' '),
                nationalId: personalInfo.nationalId,
                gender: parseInt(personalInfo.gender, 10) || 1,
                dateOfBirth: personalInfo.dateOfBirth ? `${personalInfo.dateOfBirth}T00:00:00` : null,
                email: personalInfo.email,
                address: personalInfo.address,
                city: personalInfo.city || '',
                country: personalInfo.country || '',
                phoneNumber: personalInfo.phoneNumber,
                password: personalInfo.nationalId,
                isActive: true,
                bloodType: parseInt(personalInfo.bloodGroup, 10) || 1,
                allergies: allergyRecords.map(a => ({
                    allergenType: 1,
                    allergenName: a.allergenName,
                    severity: 1,
                    onSetDate: new Date().toISOString(),
                    status: 1,
                    notes: a.reactionDetails
                })),
                diseasesDto: chronicDiseaseRecords.map(d => ({
                    diseaseName: d.diseaseName,
                    diseaseCode: 'N/A',
                    diagnosisDate: new Date().toISOString()
                })),
                historyDto: medicalRecords.map(m => ({
                    condition: m.condition,
                    diagnosisDate: m.diagnosisDate ? `${m.diagnosisDate}T00:00:00` : new Date().toISOString(),
                    notes: m.notes
                }))
            };

            const res = await registerPatient(payload);
            if (res.isSuccess) {
                setSubmitMessage({ type: 'success', text: 'Patient registered successfully' });
                setTimeout(() => {
                    if (onSwitchView) onSwitchView('patient');
                }, 2000);
            } else {
                setSubmitMessage({ type: 'error', text: res.message || 'Registration failed' });
            }
        } catch (err: any) {
            console.error('Patient registration error:', err);
            setSubmitMessage({ type: 'error', text: err.message || 'Network error occurred' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 font-sans">
            {/* Topbar */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                {/* Breadcrumb - larger text */}
                <div className="flex items-center gap-2 text-base">
                    <span className="font-extrabold text-slate-900 text-lg">
                        {isNurse ? 'Patient Management' : 'Add New User'}
                    </span>
                    <span className="text-slate-400 text-lg">›</span>
                    <span className="text-slate-500 font-semibold text-base">Register Patient</span>
                </div>

                {/* Add User/Patient Button */}
                {isNurse ? (
                    <button 
                        onClick={() => onSwitchView?.('patient')}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold shadow-md transition-all active:scale-95 text-sm"
                    >
                        <UserPlus size={17} />
                        <span>Add Patient</span>
                    </button>
                ) : (
                    <AddUserButton
                        onClick={(type: 'patient' | 'staff', role?: string) => {
                            if (onSwitchView) onSwitchView(type, role);
                        }}
                    />
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-[1000px] mx-auto">
                    {/* Header */}
                    <div className="mb-8 pl-2">
                        <h1 className="text-2xl font-extrabold text-slate-900 mb-8">Register New Patient</h1>

                        {submitMessage && (
                            <div className={`mb-8 p-4 rounded-xl text-sm font-semibold border ${submitMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                {submitMessage.text}
                            </div>
                        )}

                        {/* Stepper */}
                        <div className="flex items-center justify-center mb-12 relative max-w-3xl mx-auto">
                            <div className="absolute top-5 left-8 right-8 h-[2px] bg-slate-200 -z-10 flex">
                                <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}></div>
                                <div className="h-full bg-slate-200 transition-all duration-300" style={{ width: `${(1 - (step - 1) / (steps.length - 1)) * 100}%` }}></div>
                            </div>

                            {steps.map((s) => {
                                const isCompleted = s.num < step;
                                const isActive = s.num === step;
                                return (
                                    <div key={s.num} className="flex-1 flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-3 transition-colors ${isCompleted ? 'bg-green-100 text-green-600 border-2 border-green-500' :
                                            isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-200' :
                                                'bg-white text-slate-400 border-2 border-slate-200'
                                            }`}>
                                            {isCompleted ? <Check className="w-5 h-5" /> : s.num}
                                        </div>
                                        <span className={`text-xs font-bold ${isCompleted ? 'text-green-500' :
                                            isActive ? 'text-blue-600' :
                                                'text-slate-400'
                                            }`}>
                                            {s.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Step Content */}
                    <div className="mb-8">
                        {step === 1 && (
                            <PersonalInfoForm info={personalInfo} onChange={setPersonalInfo} />
                        )}
                        {step === 2 && (
                            <MedicalHistoryForm
                                records={medicalRecords}
                                onAddRecord={handleAddRecord}
                                onRemoveRecord={handleRemoveMedicalRecord}
                            />
                        )}
                        {step === 3 && (
                            <AllergiesForm
                                records={allergyRecords}
                                onAddRecord={handleAddAllergy}
                                onRemoveRecord={handleRemoveAllergy}
                            />
                        )}
                        {step === 4 && (
                            <ChronicDiseasesForm
                                records={chronicDiseaseRecords}
                                onAddRecord={handleAddChronicDisease}
                                onRemoveRecord={handleRemoveChronicDisease}
                            />
                        )}
                    </div>

                    {/* Bottom Navigation Toolbar */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-6 shadow-sm flex items-center justify-between">
                        <button
                            onClick={() => step > 1 && setStep(step - 1)}
                            disabled={step === 1}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-colors ${step === 1
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Previous
                        </button>

                        <div className="flex items-center gap-1.5 mx-4">
                            <span className="text-slate-400 text-sm font-semibold mr-2">Step {step} of 4</span>
                            {[1, 2, 3, 4].map(num => (
                                <div key={num} className={`h-2 rounded-full transition-all ${num === step ? 'w-6 bg-blue-600' : 'w-2 bg-slate-200'}`} />
                            ))}
                        </div>

                        {step < 4 ? (
                            <button
                                onClick={() => setStep(step + 1)}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors"
                            >
                                Next Step: {steps[step].label}
                                <ArrowRight className="w-4 h-4 border-l border-blue-500 pl-2 ml-1" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSave}
                                disabled={isSubmitting}
                                className="flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors shadow-[0_4px_14px_rgba(37,99,235,0.2)] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPatient;