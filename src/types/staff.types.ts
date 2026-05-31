export interface StaffMember {
    id: string;
    name: string;
    subtitle: string;
    username: string;
    role: 'Doctor' | 'Nurse' | 'Lab Technician' | 'Radiologist' | 'Admin';
    lastLogin: string;
    dept: string;
    status: 'Active' | 'Disabled';
    avatar: string;
}

export interface WorkingSchedule {
    id?: string;
    day: string;
    startTime: string;
    endTime: string;
    shift: 'Morning' | 'Evening' | 'Night';
}

export interface StaffProfile {
    id: string;
    name: string;
    fullNameArabic?: string;
    role: string;
    department: string;
    licenseId?: string;
    location?: string;
    email?: string;
    nationalId?: string;
    phone?: string;
    address?: string;
    gender?: string;
    dateOfBirth?: string;
    city?: string;
    country?: string;
    experience?: string;
    qualifications?: string;
    status?: 'Active' | 'Disabled';
    lastLogin?: string;
    avatar?: string;
    
    // Doctor Specific Fields
    syndicateNumber?: string;
    graduationYear?: string;
    educationalQualification?: string;
    dateOfAppointment?: string;
    isHeadOfDepartment?: boolean;
    assignedDept?: string;
    assignedClinic?: string;
    workingSchedule?: WorkingSchedule[];
    documents?: any[];
    employmentDate?: string;
    createdAt?: string;
    lastUpdated?: string;
    active?: boolean;
}

export interface StaffFilters {
    role: string;
    status: string;
    sort: string;
    lastLoginFrom: string;
    lastLoginTo: string;
}