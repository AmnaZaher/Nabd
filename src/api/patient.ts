// src/api/patient.ts
import { fetchApi } from "./config";
import type { PatientProfile, PatientListItem, Visit } from "../types/patient.types";

export interface PatientListResponse {
  patients: PatientListItem[];
  totalCount: number;
}

export const patientApi = {
  getPatients: async (params: { 
    SearchKey?: string; 
    PageIndex?: number; 
    PageSize?: number; 
    sort?: number;
    Gender?: string;
    IsActive?: boolean;
    LastVisit?: string;
  }) => {
    const query = new URLSearchParams();
    if (params.SearchKey) query.append('SearchKey', params.SearchKey);
    if (params.Gender) query.append('Gender', params.Gender);
    if (params.IsActive !== undefined) query.append('IsActive', params.IsActive.toString());
    if (params.LastVisit) query.append('LastVisit', params.LastVisit);
    if (params.PageIndex !== undefined) query.append('PageIndex', params.PageIndex.toString());
    if (params.PageSize !== undefined) query.append('PageSize', params.PageSize.toString());
    if (params.sort !== undefined) query.append('sort', params.sort.toString());

    const response = await fetchApi<PatientListResponse>(`/Admin/Patients?${query.toString()}`);
    return response.data;
  },

  getPatientById: async (idOrNationalId: string): Promise<PatientProfile | null> => {
    // 1. First attempt: Direct fetch by ID if supported by the new PatientBasicInfo endpoint
    try {
      let item: any = null;

      try {
        const basicInfoResp = await fetchApi<any>(`/Admin/PatientBasicInfo/${idOrNationalId}`);
        if (basicInfoResp.data) {
          item = basicInfoResp.data;
        }
      } catch (err) {
        console.warn(`Direct fetch for PatientBasicInfo failed for ${idOrNationalId}, falling back to search.`);
      }

      if (!item) {
        const response = await fetchApi<PatientListResponse>(`/Admin/Patients?SearchKey=${encodeURIComponent(idOrNationalId)}&PageIndex=0&PageSize=20`);
        
        const list = response.data?.patients || (response.data as any)?.items || (response.data as any)?.data || [];
        
        // Find the exact match in the returned search results
        const searchId = idOrNationalId.toLowerCase().trim();
        item = list.find((p: any) => {
          const idFields = [p.id, p.Id, p.nationalId, p.NationalId, p.patientId, p.PatientId];
          return idFields.some(val => 
            val !== null && 
            val !== undefined && 
            String(val).toLowerCase().trim() === searchId
          );
        });
      
      // Secondary Fallback: If SearchKey failed entirely (backend doesn't search by ID), fetch recent patients and search locally
      if (!item) {
        const fallbackResponse = await fetchApi<PatientListResponse>(`/Admin/Patients?PageIndex=0&PageSize=100`);
        const fallbackList = fallbackResponse.data?.patients || (fallbackResponse.data as any)?.items || (fallbackResponse.data as any)?.data || [];
        item = fallbackList.find((p: any) => {
          const idFields = [p.id, p.Id, p.nationalId, p.NationalId, p.patientId, p.PatientId];
          return idFields.some(val => 
            val !== null && 
            val !== undefined && 
            String(val).toLowerCase().trim() === searchId
          );
        });
      }
      } // Close if (!item) search block
      
      if (!item) {
        console.warn(`No exact identity match found in search results for: ${idOrNationalId}.`);
        return null;
      }

      // Helper to calculate age if not provided by backend
      const calculateAge = (dob: string) => {
        if (!dob || dob === 'N/A') return 0;
        try {
          const birthDate = new Date(dob);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          return age;
        } catch (e) { return 0; }
      };

      const dob = item.dateOfBirth || item.DateOfBirth || 'N/A';
      const rawAge = item.age || item.Age;
      const calculatedAge = rawAge && rawAge > 0 ? rawAge : calculateAge(dob);

      // Gender mapping: 1 for Male, 2 for Female ($int32)
      const rawGender = item.gender ?? item.Gender;
      const genderStr = rawGender === 1 || rawGender === '1' || String(rawGender).toLowerCase() === 'male' ? 'Male' :
        rawGender === 2 || rawGender === '2' || String(rawGender).toLowerCase() === 'female' ? 'Female' : 'Not Specified';

      // Safe mapping to prevent UI crashes if backend fields are missing or PascalCase
      return {
        ...item, // Spread at top so our mappings can overwrite
        id: item.id || item.Id || idOrNationalId,
        name: item.name || item.fullNameEnglish || item.FullNameEnglish || 'Unknown',
        nameArabic: item.fullNameArabic || item.FullNameArabic || '',
        patientId: item.patientId || item.PatientId || idOrNationalId,
        gender: genderStr,
        age: calculatedAge,
        dateOfBirth: dob,
        nationalId: item.nationalId || item.NationalId || idOrNationalId,
        phone: item.phoneNumber || item.phone || item.PhoneNumber || 'N/A',
        email: item.email || item.Email || 'No Email',
        address: item.address || item.Address || 'N/A',
        city: item.city || item.City || 'N/A',
        country: item.country || item.Country || 'N/A',
        bloodType: item.bloodType || item.BloodType || 'N/A',
        primaryLanguage: item.primaryLanguage || item.PrimaryLanguage || 'Arabic',
        insuranceType: item.insuranceType || item.InsuranceType || 'None',
        status: item.isActive === false ? 'Disabled' : (item.status || 'Active'),
        lastVisit: item.lastVisit || item.LastVisit || 'N/A',
        upcomingAppointment: item.upcoming || item.UpcomingAppointment || 'N/A',
        nextOfKin: item.nextOfKin || item.NextOfKin || null,
        allergies: item.allergies || item.Allergies || [],
        chronicDiseases: item.chronicDiseases || item.ChronicDiseases || [],
        medications: item.medications || item.Medications || [],
        visits: item.visits || item.Visits || [],
        visitStats: item.visitStats || { totalVisits: 0, totalVisitsChange: '', departments: 0, departmentsLabel: '', avgVisitTime: '', avgVisitTimeLabel: '' },
        labResults: item.labResults || [],
        vitals: item.vitals || { heartRate: 0, heartRateStatus: 'Stable', heartRateHistory: [] },
        avatar: item.avatar || item.PersonalPhotos || '',
        radiology: item.radiology || [],
        radiologySummary: item.radiologySummary || { totalScans: 0, activeReports: 0, pendingReview: 0, nextScan: { type: '', date: '' } },
        prescriptions: item.prescriptions || [],
        prescriptionSummary: item.prescriptionSummary || { totalPrescriptions: 0, activeTreatmentNote: '', recentNote: '' },
      } as unknown as PatientProfile;
    } catch (error) {
      console.error('API getPatientById failed:', error);
      return null;
    }
  },

  getPatientProfile: async (): Promise<PatientProfile> => {
    const response = await fetchApi<PatientProfile>(`/Patient/My/Profile`);
    return response.data!;
  },

  getVisitHistory: async (): Promise<Visit[]> => {
      const response = await fetchApi<Visit[]>('/MedicalRecorde/VisitHistory');
      return response.data!;
  },

  // Admin: get visits for a specific patient by their file number (patientId)
  getPatientVisits: async (params: {
    fileNumber: string;
    PageIndex?: number;
    PageSize?: number;
    VisitStatus?: number;
    StartDate?: string;
    EndDate?: string;
  }): Promise<any> => {
    const query = new URLSearchParams();
    query.append('FileNubmer', params.fileNumber);
    if (params.PageIndex !== undefined) query.append('PageIndex', params.PageIndex.toString());
    if (params.PageSize !== undefined) query.append('PageSize', params.PageSize.toString());
    if (params.VisitStatus !== undefined) query.append('VisitStatus', params.VisitStatus.toString());
    if (params.StartDate) query.append('StartDate', params.StartDate);
    if (params.EndDate) query.append('EndDate', params.EndDate);
    const response = await fetchApi<any>(`/Visit?${query.toString()}`);
    return response.data;
  },

  getVisitDetails: async (visitId: string | number): Promise<any> => {
      const response = await fetchApi<any>(`/MedicalRecorde/Visit/${visitId}`);
      return response.data;
  },

  updatePatient: async (id: string, payload: any): Promise<void> => {
    // Try the specific EditPatientBaseData endpoint which expects multipart/form-data
    try {
      const formData = new FormData();
      Object.keys(payload).forEach(key => {
        if (payload[key] !== undefined && payload[key] !== null) {
          if (typeof payload[key] === 'object' && !(payload[key] instanceof File)) {
             formData.append(key, JSON.stringify(payload[key]));
          } else {
             formData.append(key, payload[key]);
          }
        }
      });
      await fetchApi(`/Admin/EditPatientBaseData/${id}`, {
        method: 'PUT',
        body: formData
      });
      return;
    } catch (adminErr: any) {
      console.warn('Admin PUT EditPatientBaseData failed, trying Account/NewPatient upsert:', adminErr.message);
    }

    // Fallback: re-register with same NationalId to upsert
    const upsertPayload = {
      ...payload,
      nationalId: payload.nationalId || id
    };
    await fetchApi(`/Account/NewPatient`, {
      method: 'POST',
      body: JSON.stringify(upsertPayload)
    });
  },

  deletePatient: async (id: string): Promise<void> => {
    // Uses ActiveOrDeActive toggle endpoint
    try {
      await fetchApi(`/Admin/ActiveOrDeActive/${id}`, {
        method: 'PATCH'
      });
      return;
    } catch (patchErr: any) {
      console.warn('PATCH deactivation failed:', patchErr.message);
      throw new Error('Patient delete/deactivation failed. Error: ' + patchErr.message);
    }
  }
};
