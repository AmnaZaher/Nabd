import { useState } from 'react';
import { registerStaff } from '../../../api/auth';
import { AddUserButton } from '../shared/AddUserButton';
import { Stepper, Button } from '../../ui';
import BasicInfoForm, { type StaffBasicInfo } from './BasicInfoForm';
import RoleDetailsForm, { type StaffRoleDetails } from './RoleDetailsForm';
import UploadDocumentsForm, { type StaffDocument } from './UploadDocumentsForm';

const initialDocuments: StaffDocument[] = [
  { id: "1", title: "National ID", status: "Not Uploaded" },
  { id: "2", title: "Qualification Certificate", status: "Not Uploaded" },
  { id: "3", title: "Internship Certificate", status: "Not Uploaded" },
  { id: "4", title: "Medical Practice License", status: "Not Uploaded" },
  { id: "5", title: "Medical Fitness Certificate", status: "Not Uploaded" },
  { id: "6", title: "Birth Certificate", status: "Not Uploaded" },
  { id: "7", title: "Criminal Record Certificate", status: "Not Uploaded" },
  {
    id: "8",
    title: "Certificate of Registration in the Medical Syndicate",
    status: "Not Uploaded",
  },
  { id: "9", title: "Curriculum Vitae (CV)", status: "Not Uploaded" },
];

const STEPS = [
  { label: "Basic Info" },
  { label: "Role Details" },
  { label: "Documents" },
];

interface RegisterStaffProps {
  initialRole?: string;
  onSwitchView?: (type: "patient" | "staff", role?: string) => void;
}

const RegisterStaff = ({
  initialRole = "Doctor",
  onSwitchView,
}: RegisterStaffProps) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Step 1 State
  const [basicInfo, setBasicInfo] = useState<StaffBasicInfo>({
    fullNameEng: "",
    nationalId: "",
    gender: "",
    fullNameAr: "",
    dateOfBirth: "",
    email: "",
    phoneNumber: "",
    address: "",
    city: "",
    country: "",
    accountStatus: true,
  });

  // Step 2 State
  const [roleDetails, setRoleDetails] = useState<StaffRoleDetails>({
    role: initialRole,
    educationalQualification: "",
    medicalSyndicateNumber: "",
    graduationYear: "",
    specialization: "",
    dateOfAppointment: "",
    clinicId: "",
    doctorId: "",
    qualification: "",
    syndicateRegistrationNumber: "",
    nurseLevel: "",
    nursingLicenseNumber: "",
    ltLicenseNumber: "",
    canPerformTests: false,
    canApproveResults: false,
    canManageEquipment: false,
    radiologistLicenseNumber: "",
    pharmacyDegree: "",
    pharmacyLicenseNumber: "",
    employmentDate: "",
    shiftType: "",
  });

  // Step 3 State
  const [documents, setDocuments] = useState<StaffDocument[]>(initialDocuments);

    const handleUpload = (id: string, _file: File) => {
        setDocuments((docs) =>
            docs.map((d) =>
                d.id === id
                    ? { ...d, status: 'Uploaded', filename: 'resume_V2.pdf', filesize: '1.2MB', file: _file }
                    : d
            )
        );
    };

    const handleRemove = (id: string) => {
        setDocuments((docs) =>
            docs.map((d) =>
                d.id === id
                    ? { ...d, status: 'Not Uploaded', filename: undefined, filesize: undefined, file: undefined }
                    : d
            )
        );
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        setSubmitMessage(null);
        try {
            const formData = new FormData();
            formData.append('FullNameEnglish', basicInfo.fullNameEng);
            formData.append('FullNameArabic', basicInfo.fullNameAr || basicInfo.fullNameEng); // Required field
            formData.append('Email', basicInfo.email);
            formData.append('NationalId', basicInfo.nationalId);
            formData.append('Password', basicInfo.nationalId); // Use National ID as password
            let roleInt = '1';
            switch(roleDetails.role) {
                case 'Admin': roleInt = '1'; break;
                case 'Doctor': roleInt = '2'; break;
                case 'Nurse': roleInt = '3'; break;
                case 'Pharmacist': roleInt = '4'; break;
                case 'Radiologist': roleInt = '5'; break;
                case 'Lab Technician': roleInt = '6'; break;
            }
            formData.append('Role', roleInt);
            formData.append('IsActive', 'true');

            if (basicInfo.phoneNumber) formData.append('PhoneNumber', basicInfo.phoneNumber);
            if (basicInfo.address) formData.append('Address', basicInfo.address);
            if (basicInfo.city) formData.append('City', basicInfo.city);
            if (basicInfo.country) formData.append('Country', basicInfo.country);

            // Gender mapping: 1 for Male, 2 for Female ($int32)
            const genderVal = basicInfo.gender === 'Female' ? '2' : '1';
            formData.append('Gender', genderVal);

            if (basicInfo.profilePhoto) formData.append('PersonalPhotos', basicInfo.profilePhoto);

            // Append Role Details based on selected Role
            if (roleDetails.educationalQualification) formData.append('EducationalQualification', roleDetails.educationalQualification);
            if (roleDetails.medicalSyndicateNumber) formData.append('MedicalSyndicateNumber', roleDetails.medicalSyndicateNumber);
            if (roleDetails.graduationYear) formData.append('GraduationYear', roleDetails.graduationYear);
            if (roleDetails.specialization) formData.append('Specialization', roleDetails.specialization);
            if (roleDetails.dateOfAppointment) formData.append('DateOfAppointment', roleDetails.dateOfAppointment);
            if (roleDetails.clinicId) formData.append('ClinicId', roleDetails.clinicId);
            if (roleDetails.doctorId) formData.append('DoctorId', roleDetails.doctorId);
            if (roleDetails.qualification) formData.append('Qualification', roleDetails.qualification);
            if (roleDetails.syndicateRegistrationNumber) formData.append('SyndicateRegistrationNumber', roleDetails.syndicateRegistrationNumber);
            if (roleDetails.nurseLevel) formData.append('NurseLevel', roleDetails.nurseLevel);
            if (roleDetails.nursingLicenseNumber) formData.append('NursingLicenseNumber', roleDetails.nursingLicenseNumber);
            if (roleDetails.ltLicenseNumber) formData.append('LtLicenseNumber', roleDetails.ltLicenseNumber);
            formData.append('CanPerformTests', roleDetails.canPerformTests ? 'true' : 'false');
            formData.append('CanApproveResults', roleDetails.canApproveResults ? 'true' : 'false');
            formData.append('CanManageEquipment', roleDetails.canManageEquipment ? 'true' : 'false');
            if (roleDetails.radiologistLicenseNumber) formData.append('RadiologistLicenseNumber', roleDetails.radiologistLicenseNumber);
            if (roleDetails.pharmacyDegree) formData.append('PharmacyDegree', roleDetails.pharmacyDegree);
            if (roleDetails.pharmacyLicenseNumber) formData.append('PharmacyLicenseNumber', roleDetails.pharmacyLicenseNumber);
            if (roleDetails.employmentDate) formData.append('EmploymentDate', roleDetails.employmentDate);
            if (roleDetails.shiftType) formData.append('ShiftType', roleDetails.shiftType);

            // Document mapping (PascalCase)
            const natIdDoc = documents.find((d) => d.id === '1');
            if (natIdDoc?.file) formData.append('NationalIdFile', natIdDoc.file);

            const qualDoc = documents.find((d) => d.id === '2');
            if (qualDoc?.file) formData.append('QualificationCertificate', qualDoc.file);

            const medLicDoc = documents.find((d) => d.id === '4');
            if (medLicDoc?.file) formData.append('MedicalPracticeLicense', medLicDoc.file);

            const res = await registerStaff(formData);
            
            if (res.isSuccess) {
                setSubmitMessage({ type: 'success', text: 'Staff member registered successfully' });
                // Reset form or navigate back after delay
                setTimeout(() => {
                    if (onSwitchView) onSwitchView('staff', 'Doctor'); // Reset to list or default
                }, 2000);
            } else {
                setSubmitMessage({ type: 'error', text: res.message || 'Registration failed' });
            }
        } catch (err: any) {
            console.error('Staff registration error:', err);
            setSubmitMessage({ type: 'error', text: err.message || 'Network error occurred' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 font-sans">
            {/* Top Bar */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-2 text-base">
                    <span className="font-extrabold text-slate-900 text-lg">Add New User</span>
                    <span className="text-slate-400 text-lg">{"\u203A"}</span>
                    <span className="text-slate-500 font-semibold text-base">Hospital Staff</span>
                </div>
                <div className="flex items-center gap-4">
                    <AddUserButton
                        onClick={(type: 'patient' | 'staff', role?: string) => {
                            if (onSwitchView) onSwitchView(type, role);
                        }}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-[1240px] mx-auto">
                    {/* Header */}
                    <div className="mb-8 pl-2">
                        <h1 className="text-2xl font-extrabold text-slate-900 mb-8">
                            Register New Staff Member
                        </h1>

                        {/* Submit Message */}
                        {submitMessage && (
                            <div
                                className={`mb-8 p-4 rounded-xl text-sm font-semibold border ${
                                    submitMessage.type === 'success'
                                        ? 'bg-green-50 text-green-700 border-green-200'
                                        : 'bg-red-50 text-red-700 border-red-200'
                                }`}
                            >
                                {submitMessage.text}
                            </div>
                        )}

                        {/* Stepper */}
                        <Stepper steps={STEPS} currentStep={step} className="mb-12" />
                    </div>

                    {/* Step Content */}
                    <div className="mb-8">
                        {step === 1 && (
                            <BasicInfoForm info={basicInfo} onChange={setBasicInfo} />
                        )}
                        {step === 2 && (
                            <RoleDetailsForm details={roleDetails} onChange={setRoleDetails} />
                        )}
                        {step === 3 && (
                            <UploadDocumentsForm
                                documents={
                                    ['Lab Technician', 'Radiologist', 'Pharmacist'].includes(roleDetails.role)
                                        ? documents.filter(
                                              (doc) =>
                                                  doc.title !== 'Certificate of Registration in the Medical Syndicate'
                                          )
                                        : documents
                                }
                                onUpload={handleUpload}
                                onRemove={handleRemove}
                            />
                        )}
                    </div>

                    {/* Bottom Navigation */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-6 shadow-sm flex items-center justify-between">
                        <Button
                            variant="outline"
                            onClick={() => step > 1 && setStep(step - 1)}
                            disabled={step === 1}
                            icon={
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            }
                        >
                            Previous
                        </Button>

                        {/* Step Indicator */}
                        <div className="flex items-center gap-1.5 mx-4 hidden md:flex">
                            <span className="text-slate-400 text-sm font-semibold mr-2">
                                Step {step} of 3
                            </span>
                            {[1, 2, 3].map((num) => (
                                <div
                                    key={num}
                                    className={`h-2 rounded-full transition-all ${
                                        num === step ? 'w-6 bg-blue-600' : 'w-2 bg-slate-200'
                                    }`}
                                />
                            ))}
                        </div>

                        {step < 3 ? (
                            <Button
                                variant="primary"
                                onClick={() => setStep(step + 1)}
                                icon={
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                }
                                iconPosition="right"
                            >
                                Next Step: {STEPS[step].label}
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSave}
                                isLoading={isSubmitting}
                                className="bg-green-500 hover:bg-green-600 text-white shadow-[0_4px_14px_rgba(34,197,94,0.2)]"
                            >
                                {isSubmitting ? '' : 'Submit Registration'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterStaff;
