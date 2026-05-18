// src/api/staff.ts
import { fetchApi } from "./config";
import type { StaffProfile, StaffMember } from "../types/staff.types";

export interface StaffListResponse {
  staffs: StaffMember[];
  totalCount: number;
}

export const staffApi = {
  getStaffs: async (params: { 
    Role?: string; 
    SearchKey?: string; 
    Gender?: string; 
    IsActive?: boolean; 
    PageIndex?: number; 
    PageSize?: number;
    sort?: number;
    LastLoginFrom?: string;
    LastLoginTo?: string;
  }) => {
    const query = new URLSearchParams();
    if (params.Role) query.append('Role', params.Role);
    if (params.SearchKey) query.append('SearchKey', params.SearchKey);
    if (params.Gender) query.append('Gender', params.Gender);
    if (params.IsActive !== undefined) query.append('IsActive', params.IsActive.toString());
    if (params.PageIndex !== undefined) query.append('PageIndex', params.PageIndex.toString());
    if (params.PageSize !== undefined) query.append('PageSize', params.PageSize.toString());
    if (params.sort !== undefined) query.append('sort', params.sort.toString());
    if (params.LastLoginFrom) query.append('LastLoginFrom', params.LastLoginFrom);
    if (params.LastLoginTo) query.append('LastLoginTo', params.LastLoginTo);

    const response = await fetchApi<StaffListResponse>(`/Admin/Staffs?${query.toString()}`);
    return response.data;
  },

  getStaffById: async (idOrNationalId: string): Promise<StaffProfile | null> => {
    // We fetch a small batch and find the exact match to prevent partial search matches returning the wrong staff member
    try {
      const response = await fetchApi<StaffListResponse>(`/Admin/Staffs?SearchKey=${encodeURIComponent(idOrNationalId)}&PageIndex=0&PageSize=20`);
      
      const list = response.data?.staffs || (response.data as any)?.items || (response.data as any)?.data || [];
      
      // Find the exact match in the returned search results
      const searchId = idOrNationalId.toLowerCase().trim();
      let item = list.find((s: any) => {
        return Object.values(s).some(val => 
          val !== null && 
          val !== undefined && 
          String(val).toLowerCase().trim() === searchId
        );
      });
      
      // Fallback: If only one result is returned by an ID/National ID search, it's likely our staff member
      if (!item && list.length === 1) {
        item = list[0];
      }
      
      // Secondary Fallback: If SearchKey failed entirely (backend doesn't search by ID), fetch recent staff and search locally
      if (!item) {
        const fallbackResponse = await fetchApi<StaffListResponse>(`/Admin/Staffs?PageIndex=0&PageSize=100`);
        const fallbackList = fallbackResponse.data?.staffs || (fallbackResponse.data as any)?.items || (fallbackResponse.data as any)?.data || [];
        item = fallbackList.find((s: any) => {
          return Object.values(s).some(val => 
            val !== null && 
            val !== undefined && 
            String(val).toLowerCase().trim() === searchId
          );
        });
      }
      
      if (!item) {
        console.warn(`No exact identity match found in search results for: ${idOrNationalId}.`);
        return null;
      }

      // Augment the list item with full profile details if possible
      const realId = item.id || item.Id || item.userId || item.UserId;
      if (realId) {
        try {
          const fullProfileResponse = await fetchApi<any>(`/Staff/${realId}`);
          if (fullProfileResponse?.data) {
            item = { ...item, ...fullProfileResponse.data };
          }
        } catch (e) {
          console.warn(`Failed to fetch full profile details via /Staff/${realId}:`, e);
          // Fallback for Admin profile
          if (idOrNationalId === 'admin1' || String(item.role) === '1' || String(item.Role) === '1' || item.roleName === 'Admin') {
            try {
              const adminProfileResponse = await fetchApi<any>('/Admin/Profile');
              if (adminProfileResponse?.data) {
                item = { ...item, ...adminProfileResponse.data };
              }
            } catch (e2) {
              console.warn("Failed to fetch admin profile fallback:", e2);
            }
          }
        }
      }


      const rolesMap: Record<string, string> = {
        '1': 'Admin', '2': 'Doctor', '3': 'Nurse', '4': 'Pharmacist', '5': 'Radiologist', '6': 'Lab Technician',
        'Admin': 'Admin', 'Doctor': 'Doctor', 'Nurse': 'Nurse', 'Pharmacist': 'Pharmacist', 'Radiologist': 'Radiologist', 'Lab Technician': 'Lab Technician', 'LabTechnician': 'Lab Technician'
      };
      
      // Comprehensive search for role
      const findRole = () => {
        const direct = item.role ?? item.Role ?? item.roleId ?? item.RoleId ?? item.staffRole ?? item.StaffRole ?? item.roleName ?? item.RoleName;
        if (direct !== undefined && direct !== null) {
          if (typeof direct === 'object') return direct.name ?? direct.Name ?? rolesMap[direct.id ?? direct.Id] ?? 'Staff';
          const s = String(direct);
          return rolesMap[s] ?? (isNaN(parseInt(s)) ? s : 'Staff');
        }
        for (const k in item) {
          if (k.toLowerCase().includes('role')) {
            const val = item[k];
            if (val !== undefined && val !== null) {
              if (typeof val === 'object') return val.name ?? val.Name ?? rolesMap[val.id ?? val.Id] ?? 'Staff';
              const s = String(val);
              return rolesMap[s] ?? (isNaN(parseInt(s)) ? s : 'Staff');
            }
          }
        }
        return item.specialization ?? item.Specialization ?? 'Staff';
      };

      const roleVal = findRole();

      // Comprehensive search for dept
      const findDept = () => {
        const direct = item.dept ?? item.department ?? item.deptName ?? item.Dept ?? item.Department ?? item.departmentName ?? item.DepartmentName;
        if (direct !== undefined && direct !== null) {
          if (typeof direct === 'object') return direct.name ?? direct.Name ?? 'General';
          return String(direct);
        }
        for (const k in item) {
          if (k.toLowerCase().includes('dept') || k.toLowerCase().includes('depart')) {
            const val = item[k];
            if (val) return typeof val === 'object' ? (val.name ?? val.Name) : String(val);
          }
        }
        return item.specialization ?? item.Specialization ?? 'General';
      };
      
      const deptVal = findDept();

      // Safe mapping to prevent UI crashes if backend fields are missing or PascalCase
      // Gender mapping: 1 for Male, 2 for Female ($int32)
      const rawGender = item.gender ?? item.Gender;
      const genderStr = rawGender === 1 || rawGender === '1' || String(rawGender).toLowerCase() === 'male' ? 'Male' : 
                       rawGender === 2 || rawGender === '2' || String(rawGender).toLowerCase() === 'female' ? 'Female' : 'Not Specified';

      // Safe mapping to prevent UI crashes if backend fields are missing or PascalCase
      return {
        ...item, // Spread at top so our mappings can overwrite
        id: item.id || item.Id || idOrNationalId,
        name: item.name || item.fullNameEnglish || item.FullNameEnglish || 'Unknown',
        fullNameArabic: item.fullNameArabic || item.FullNameArabic || '',
        role: roleVal,
        department: deptVal,
        licenseId: item.licenseNumber || item.licenseId || 'N/A',
        location: item.location || item.city || item.City || 'Hospital',
        email: item.email || item.Email || '',
        nationalId: item.nationalId || item.NationalId || idOrNationalId,
        phone: item.phoneNumber || item.phone || item.PhoneNumber || '',
        address: item.address || item.Address || '',
        country: item.country || item.Country || '',
        city: item.city || item.City || '',
        dateOfBirth: item.dateOfBirth || item.DateOfBirth || '',
        gender: genderStr,
        experience: item.experience || 'N/A',
        qualifications: item.qualification || item.qualifications || item.Qualification || 'N/A',
        status: item.isActive === false ? 'Disabled' : (item.status || 'Active'),
        lastLogin: item.lastLogin || 'N/A',
        avatar: item.avatar || item.PersonalPhotos || '',
        
        // Doctor Specific Fields - map from backend if available (case-insensitive search)
        syndicateNumber: item.syndicateNumber || item.SyndicateNumber || '',
        graduationYear: item.graduationYear || item.GraduationYear || '',
        educationalQualification: item.educationalQualification || item.EducationalQualification || item.qualification || item.Qualification || '',
        dateOfAppointment: item.dateOfAppointment || item.DateOfAppointment || '',
        isHeadOfDepartment: !!(item.isHeadOfDepartment || item.IsHeadOfDepartment),
        assignedDept: item.assignedDept || item.AssignedDept || deptVal,
        assignedClinic: item.assignedClinic || item.AssignedClinic || item.location || item.City || 'Main Clinic',
        workingSchedule: item.workingSchedule || item.WorkingSchedule || [],
      } as unknown as StaffProfile;
    } catch (error) {
      console.error('API getStaffById failed:', error);
      return null;
    }
  },

  getProfile: async (id: string): Promise<StaffProfile> => {
    const response = await fetchApi<StaffProfile>(`/Staff/${id}`);
    return response.data!;
  },

  /**
   * Fetches the current user's display profile.
   * Strategy 0: /Staff/My/Profile  — self-profile via bearer token (no ID needed)
   * Strategy 1: /Staff/{userId}    — direct lookup by JWT nameidentifier
   * Strategy 2: Admin search        — /Admin/Staffs?SearchKey={nationalId} (admins only)
   * All strategies reject purely-numeric names (= national ID leaking as name).
   */
  getMyProfile: async (userId: string, jwtUsername?: string, jwtRole?: string): Promise<StaffProfile | null> => {
    /** Helper: resolve the display name from a raw backend item */
    const resolveName = (item: any): string => {
      const candidates = [
        item.fullNameEnglish,
        item.FullNameEnglish,
        item.displayName,
        item.DisplayName,
        item.firstName ? `${item.firstName} ${item.lastName || ''}`.trim() : '',
        item.FirstName ? `${item.FirstName} ${item.LastName || ''}`.trim() : '',
        item.name,
        item.Name,
      ];
      for (const c of candidates) {
        if (c && typeof c === 'string' && c.trim().length > 0 && !/^\d+$/.test(c.trim())) {
          return c.trim();
        }
      }
      return '';
    };

    /** Helper: build a StaffProfile from a raw backend item */
    const buildProfile = (item: any, fallbackId: string, fallbackNationalId?: string): StaffProfile => ({
      ...item,
      id: item.id || item.Id || fallbackId,
      name: resolveName(item),
      fullNameArabic: item.fullNameArabic || item.FullNameArabic || '',
      role: item.role || item.Role || '',
      department: item.department || item.Department || '',
      licenseId: item.licenseId || item.licenseNumber || '',
      location: item.location || item.city || '',
      email: item.email || item.Email || '',
      nationalId: item.nationalId || item.NationalId || fallbackNationalId || '',
      phone: item.phoneNumber || item.phone || '',
      address: item.address || '',
      gender: item.gender || '',
      experience: item.experience || '',
      qualifications: item.qualifications || item.qualification || '',
      status: item.isActive === false ? 'Disabled' : (item.status || 'Active'),
      lastLogin: item.lastLogin || '',
      avatar: item.avatar || item.PersonalPhotos || '',
    } as StaffProfile);

    // ── Short-circuit for roles that have no profile endpoint yet ──
    // Nurses (and any other non-Admin, non-Doctor roles) don't have a dedicated
    // profile API endpoint yet. Skip all server calls and use JWT data directly
    // to avoid 403/404 error spam in the console.
    const adminOnlyRoles = ['Admin'];
    const hasProfileEndpoint = adminOnlyRoles.includes(jwtRole || '');

    if (!hasProfileEndpoint) {
      return buildProfile({
        id: userId,
        name: jwtUsername || 'Staff Member',
        role: jwtRole || 'Staff',
        status: 'Active',
        email: '',
        phone: '',
        department: 'General'
      }, userId, jwtUsername);
    }

    // ── Strategy 0: /Admin/Profile (Admin only) ──
    try {
      const response = await fetchApi<any>('/Admin/Profile');
      const item = response?.data;
      if (item) {
        const name = resolveName(item);
        if (name) return buildProfile(item, userId, jwtUsername);
      }
    } catch (err) { console.log("Strategy 0 failed:", err); }

    // ── Strategy 1: /Staff/{userId} (direct lookup by internal ID) ──
    try {
      const response = await fetchApi<any>(`/Staff/${userId}`);
      const item = response?.data;
      if (item) {
        const name = resolveName(item);
        if (name) return buildProfile(item, userId, jwtUsername);
      }
    } catch (err) { console.log("Strategy 1 failed:", err); }

    // ── Strategy 2: Admin search by national ID (admins only) ──
    if (jwtUsername) {
      try {
        const result = await staffApi.getStaffById(jwtUsername);
        if (result) return result;
      } catch { /* also failed */ }
    }

    // ── Final Fallback: JWT data ──
    console.warn("All profile fetch strategies failed. Falling back to JWT data.");
    return buildProfile({
      id: userId,
      name: jwtUsername || 'Staff Member',
      role: jwtRole || '',
      status: 'Active',
      email: '',
      phone: '',
      department: 'General'
    }, userId, jwtUsername);
  },

  toggleStatus: async (id: string, activate: boolean): Promise<void> => {
    await fetchApi(`/Staff/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: activate ? "Active" : "Disabled" }),
    });
  },

  updateStaff: async (id: string, payload: any): Promise<void> => {
    // Try multiple endpoint and payload combinations
    const endpoints = [`/Admin/Staffs/${id}`, `/Admin/Staff/${id}`, `/Staff/${id}`];
    const payloads = [payload, { staffDto: payload }];
    
    let lastError: any = null;
    
    for (const url of endpoints) {
      for (const p of payloads) {
        try {
          await fetchApi(url, {
            method: "PUT",
            body: JSON.stringify(p),
          });
          return;
        } catch (err: any) {
          lastError = err;
          if (err.status !== 404 && err.status !== 400 && err.status !== 405) break; 
        }
      }
    }
    
    // Fallback: Use NewStaff to upsert if standard endpoints fail (Backend has no dedicated PUT)
    try {
      console.warn("Standard update endpoints failed, attempting upsert via /Account/NewStaff");
      const formData = new FormData();
      Object.keys(payload).forEach(key => {
        if (payload[key] !== undefined && payload[key] !== null) {
          formData.append(key, payload[key].toString());
        }
      });
      // NewStaff might require Role, Email, FullNameArabic, NationalId
      if (!formData.has('Role')) formData.append('Role', payload.role || 'Staff');
      
      await fetchApi('/Account/NewStaff', {
        method: "POST",
        body: formData,
      });
      return;
    } catch (upsertErr: any) {
      console.error("Upsert failed:", upsertErr);
      throw new Error(upsertErr.message || lastError?.message || 'Staff update failed. The backend might be missing the update endpoint.');
    }
  },

  deleteStaff: async (id: string): Promise<void> => {
    // Try Admin endpoint first
    const endpoints = [`/Admin/Staffs/${id}`, `/Admin/Staff/${id}`, `/Staff/${id}`];
    
    let lastError: any = null;
    for (const url of endpoints) {
      try {
        await fetchApi(url, {
          method: "DELETE",
        });
        return;
      } catch (err: any) {
        lastError = err;
        if (err.status !== 404) break;
      }
    }
    
    throw new Error(lastError?.message || 'Staff deletion is not supported by the current API.');
  }
};

