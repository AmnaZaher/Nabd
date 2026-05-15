export interface PatientListItem {
  id: string;         // user account GUID (used for navigation & API)
  userId: string;     // alias kept for clarity
  name: string;
  subtitle: string;
  patientId: string;  // national ID / file number
  demographics: string;
  lastVisit: string;
  upcoming: string;
  status: "Active" | "Disabled";
  avatar: string;
  prescriptions: Prescription[];
  prescriptionSummary: PrescriptionSummary;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  route: string;
}

export interface ChronicDisease {
  name: string;
  diagnosedDate: string;
  status: "Controlled" | "Managed" | "Uncontrolled";
}

export interface Visit {
  id: string;
  visitNumber: string;
  date: string;
  time: string;
  doctor: {
    name: string;
    initials: string;
    color: string;
  };
  department: string;
  visitType: string;
  status: "Completed" | "In Progress" | "Waiting" | "Cancelled";
}

export interface VisitStats {
  totalVisits: number;
  totalVisitsChange: string;
  departments: number;
  departmentsLabel: string;
  avgVisitTime: string;
  avgVisitTimeLabel: string;
}

export interface LabResult {
  id: string;
  testName: string;
  testSubtitle: string;
  date: string;
  doctor: {
    name: string;
    initials: string;
    color: string;
  };
  status: "Finalized" | "Review Required" | "Pending";
  icon: "blood" | "lipid" | "glucose" | "liver";
}

export interface PatientVitals {
  heartRate: number;
  heartRateStatus: "Stable" | "Elevated" | "Low";
  heartRateHistory: number[];
}

export interface PatientProfile {
  id: string;
  name: string;
  nameArabic: string;
  patientId: string;
  gender: string;
  age: number;
  dateOfBirth: string;
  nationalId: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  bloodType: string;
  primaryLanguage: string;
  insuranceType: string;
  status: "Active" | "Disabled";
  lastVisit: string;
  upcomingAppointment: string;
  nextOfKin: {
    name: string;
    relationship: string;
    phone: string;
  };
  allergies: string[];
  chronicDiseases: ChronicDisease[];
  medications: Medication[];
  visits: Visit[];
  visitStats: VisitStats;
  labResults: LabResult[];
  vitals: PatientVitals;
  avatar: string;
  radiology: RadiologyReport[];
  radiologySummary: RadiologySummary;
  prescriptions: Prescription[];
  prescriptionSummary: PrescriptionSummary;
}

export interface PatientFilters {
  gender: string;
  status: string;
  lastVisit: string;
  upcomingAppointment: string;
}

export interface RadiologyReport {
  id: string;
  scanType: string;
  date: string;
  doctor: string;
  icon: "xray" | "mri" | "ct" | "ultrasound" | "emergency";
  isUrgent: boolean;
}

export interface RadiologySummary {
  totalScans: number;
  activeReports: number;
  pendingReview: number;
  nextScan: {
    type: string;
    date: string;
  };
}

export interface Prescription {
  id: string;
  doctor: {
    name: string;
    specialty: string;
    initials: string;
    color: string;
  };
  date: string;
  medicationCount: number;
  hasAlert: boolean;
}

export interface PrescriptionSummary {
  totalPrescriptions: number;
  activeTreatmentNote: string;
  recentNote: string;
}
