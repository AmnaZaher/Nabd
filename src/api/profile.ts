// src/api/profile.ts
import { fetchApi } from "./config";

// ==================== Types ====================

export interface DoctorProfile {
  id: number | string;
  nameEngLish: string;
  nameArabic: string;
  email: string;
  phoneNumber: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  city: string;
  country: string;
  isActive: boolean;
  educationalQualification: string;
  graduationYear: number | string;
  specialization: string;
  medicalSyndicateNumber: string;
  clinicId: number | string;
  avatar?: string;
  personalPhotos?: string;
  role?: string;
  department?: string;
  location?: string;
  status?: string;
  // Kept for UI display compatibility
  fullNameArabic?: string;
  nationalId?: string;
  syndicateNumber?: string;
  assignedDept?: string;
  assignedClinic?: string;
  
  // Audit fields
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface DoctorScheduleEntry {
  day: string;
  startTime: string;
  endTime: string;
  shift: string;
}

export interface DoctorFile {
  id: number | string;
  fileName: string;
  fileUrl: string;
  fileType?: string;
}

export interface EditDoctorPayload {
  NameEngLish?: string;
  NameArabic?: string;
  Email?: string;
  PhoneNumber?: string;
  Gender?: string;
  DateOfBirth?: string;        // ISO date-time string
  ClinicId?: number;
  IsActive?: boolean;
  EducationalQualification?: string;
  GraduationYear?: number;
  Specialization?: string;
  MedicalSyndicateNumber?: string;
  Address?: string;
  City?: string;
  Country?: string;
}

// ==================== Normalizer ====================
// Maps the raw backend response to a predictable shape used by the UI.
const normalizeDoctorProfile = (raw: any, userId: string | number): DoctorProfile => {
  const isActive = raw.isActive !== undefined ? raw.isActive : raw.IsActive !== undefined ? raw.IsActive : true;
  const gender =
    raw.gender === 1 || raw.Gender === 1 || String(raw.gender ?? raw.Gender).toLowerCase() === 'male'
      ? 'Male'
      : raw.gender === 2 || raw.Gender === 2 || String(raw.gender ?? raw.Gender).toLowerCase() === 'female'
      ? 'Female'
      : raw.gender ?? raw.Gender ?? 'Not Specified';

  return {
    id:                       raw.id              ?? raw.Id              ?? raw.userId ?? raw.UserId ?? userId,
    nameEngLish:              raw.nameEngLish      ?? raw.NameEngLish      ?? raw.fullNameEnglish ?? raw.name ?? '',
    nameArabic:               raw.nameArabic       ?? raw.NameArabic       ?? raw.fullNameArabic  ?? '',
    email:                    raw.email            ?? raw.Email            ?? '',
    phoneNumber:              raw.phoneNumber      ?? raw.PhoneNumber      ?? raw.phone ?? '',
    gender,
    dateOfBirth:              raw.dateOfBirth      ?? raw.DateOfBirth      ?? '',
    address:                  raw.address          ?? raw.Address          ?? '',
    city:                     raw.city             ?? raw.City             ?? '',
    country:                  raw.country          ?? raw.Country          ?? '',
    isActive,
    educationalQualification: raw.educationalQualification ?? raw.EducationalQualification ?? raw.qualification ?? '',
    graduationYear:           raw.graduationYear   ?? raw.GraduationYear   ?? '',
    specialization:           raw.specialization   ?? raw.Specialization   ?? '',
    medicalSyndicateNumber:   raw.medicalSyndicateNumber ?? raw.MedicalSyndicateNumber ?? raw.syndicateNumber ?? '',
    clinicId:                 raw.clinicId         ?? raw.ClinicId         ?? '',
    avatar:                   raw.avatar           ?? raw.Avatar           ?? raw.personalPhotos ?? raw.PersonalPhotos ?? '',
    personalPhotos:           raw.personalPhotos   ?? raw.PersonalPhotos   ?? '',
    role:                     raw.role             ?? raw.Role             ?? 'Doctor',
    department:               raw.department       ?? raw.Department       ?? raw.dept ?? '',
    location:                 raw.location         ?? raw.Location         ?? raw.city ?? raw.City ?? '',
    status:                   isActive ? 'Active' : 'Disabled',

    // UI-compatibility aliases
    fullNameArabic:           raw.nameArabic       ?? raw.NameArabic       ?? raw.fullNameArabic ?? '',
    nationalId:               raw.nationalId       ?? raw.NationalId       ?? '',
    syndicateNumber:          raw.medicalSyndicateNumber ?? raw.MedicalSyndicateNumber ?? raw.syndicateNumber ?? '',
    assignedDept:             raw.department       ?? raw.Department       ?? raw.dept ?? '',
    assignedClinic:           raw.location         ?? raw.Location         ?? raw.city ?? raw.City ?? '',

    createdAt:                raw.createdAt        ?? raw.CreatedAt        ?? raw.createdDate ?? raw.CreatedDate ?? '',
    updatedAt:                raw.updatedAt        ?? raw.UpdatedAt        ?? raw.updatedDate ?? raw.UpdatedDate ?? '',
    updatedBy:                raw.updatedBy        ?? raw.UpdatedBy        ?? raw.modifiedBy ?? raw.ModifiedBy ?? '',
  };
};

const deriveShift = (startTime: string): string => {
  if (!startTime) return '';
  const hour = parseInt(startTime.split(':')[0], 10);
  if (isNaN(hour)) return '';
  if (hour >= 6  && hour < 14) return 'Morning';
  if (hour >= 14 && hour < 21) return 'Evening';
  return 'Night';
};

const normalizeSchedule = (raw: any): DoctorScheduleEntry => {
  const startTime = raw.startTime ?? raw.StartTime ?? raw.start ?? raw.Start ?? raw.from ?? raw.From ?? '';
  const endTime   = raw.endTime   ?? raw.EndTime   ?? raw.end   ?? raw.End   ?? raw.to   ?? raw.To   ?? '';
  const shift     = raw.shift     ?? raw.Shift     ?? raw.shiftType ?? raw.ShiftType ?? deriveShift(startTime);
  return {
    day: raw.day ?? raw.Day ?? '',
    startTime,
    endTime,
    shift,
  };
};

const normalizeFile = (raw: any): DoctorFile => ({
  id:       raw.id       ?? raw.Id       ?? '',
  fileName: raw.fileName ?? raw.FileName ?? raw.name ?? '',
  fileUrl:  raw.fileUrl  ?? raw.FileUrl  ?? raw.url  ?? raw.path ?? '',
  fileType: raw.fileType ?? raw.FileType ?? '',
});

// ==================== API ====================

export const profileApi = {
  /**
   * GET /api/Users/Doctor/Profile/{UserId}
   * Fetch full doctor profile by user ID.
   */
  getDoctorProfile: async (userId: string | number): Promise<DoctorProfile | null> => {
    try {
      const response = await fetchApi<any>(`/Users/Doctor/Profile/${userId}`);
      const raw = response?.data;
      if (!raw) return null;
      return normalizeDoctorProfile(raw, userId);
    } catch (error) {
      console.error(`[profileApi] getDoctorProfile(${userId}) failed:`, error);
      return null;
    }
  },

  /**
   * GET /api/Users/Doctor/DoctorSchedule/{UserId}
   * Fetch a doctor's working schedule by user ID.
   */
  getDoctorSchedule: async (userId: string | number): Promise<DoctorScheduleEntry[]> => {
    try {
      const response = await fetchApi<any>(`/Users/Doctor/DoctorSchedule/${userId}`);
      const raw = response?.data;
      if (!raw) return [];
      const list = Array.isArray(raw) ? raw : raw.schedules ?? raw.data ?? [];
      return list.map(normalizeSchedule);
    } catch (error) {
      console.error(`[profileApi] getDoctorSchedule(${userId}) failed:`, error);
      return [];
    }
  },

  /**
   * GET /api/Users/Files/{UserId}
   * Fetch uploaded files / attachments for a user.
   */
  getUserFiles: async (userId: string | number): Promise<DoctorFile[]> => {
    try {
      const response = await fetchApi<any>(`/Users/Files/${userId}`);
      const raw = response?.data;
      if (!raw) return [];
      const list = Array.isArray(raw) ? raw : raw.files ?? raw.data ?? [];
      return list.map(normalizeFile);
    } catch (error) {
      console.error(`[profileApi] getUserFiles(${userId}) failed:`, error);
      return [];
    }
  },

  /**
   * PUT /api/Users/Doctor/EditDoctor/{UserId}
   * Update doctor profile. Sends multipart/form-data as required by the API.
   */
  editDoctorProfile: async (
    userId: string | number,
    payload: EditDoctorPayload
  ): Promise<void> => {
    const formData = new FormData();

    const append = (key: string, value: string | number | boolean | undefined | null) => {
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, String(value));
      }
    };

    append('NameEngLish',              payload.NameEngLish);
    append('NameArabic',               payload.NameArabic);
    append('Email',                    payload.Email);
    append('PhoneNumber',              payload.PhoneNumber);
    append('Gender',                   payload.Gender);
    append('DateOfBirth',              payload.DateOfBirth);
    append('ClinicId',                 payload.ClinicId);
    append('IsActive',                 payload.IsActive);
    append('EducationalQualification', payload.EducationalQualification);
    append('GraduationYear',           payload.GraduationYear);
    append('Specialization',           payload.Specialization);
    append('MedicalSyndicateNumber',   payload.MedicalSyndicateNumber);
    append('Address',                  payload.Address);
    append('City',                     payload.City);
    append('Country',                  payload.Country);

    // fetchApi with FormData — do NOT set Content-Type manually; the browser sets it with boundary
    await fetchApi(`/Users/Doctor/EditDoctor/${userId}`, {
      method: 'PUT',
      body: formData,
    });
  },
};