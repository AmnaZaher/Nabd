// Roles
export const STAFF_ROLES = {
    DOCTOR: 'Doctor',
    NURSE: 'Nurse',
    LAB_TECHNICIAN: 'Lab Technician',
    RADIOLOGIST: 'Radiologist',
} as const;

// Status
export const USER_STATUS = {
    ACTIVE: 'Active',
    DISABLED: 'Disabled',
} as const;

// Departments
export const DEPARTMENTS = [
    'Cardiology',
    'Emergency',
    'General Surgery',
    'ICU',
    'Oncology',
    'Pediatrics',
    'Urology',
    'Pulmonology',
    'Ophthalmology',
] as const;

// Blood Types
export const BLOOD_TYPES = [
    'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
] as const;

// Gender
export const GENDERS = ['Male', 'Female'] as const;

// Insurance Types
export const INSURANCE_TYPES = [
    'Self Pay',
    'Private Insurance',
    'Government Insurance',
] as const;

// Allergy Types
export const ALLERGY_TYPES = [
    'Medication / Drug',
    'Food',
    'Environmental',
    'Latex',
    'Other',
] as const;

// Severity Levels
export const SEVERITY_LEVELS = [
    'Mild',
    'Moderate',
    'Severe / Anaphylactic',
] as const;

// Chronic Disease Status
export const DISEASE_STATUS = [
    'Active',
    'Stable',
    'In Remission',
    'Resolved',
] as const;

// Required Documents for Staff
export const REQUIRED_DOCUMENTS = [
    'National ID',
    'Qualification Certificate',
    'Internship Certificate',
    'Medical Practice License',
    'Medical Fitness Certificate',
    'Birth Certificate',
    'Criminal Record Certificate',
    'Certificate of Registration in the Medical Syndicate',
    'Curriculum Vitae (CV)',
] as const;

// Shift Types
export const SHIFT_TYPES = [
    'Morning',
    'Evening',
    'Night',
] as const;