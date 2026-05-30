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
        '1': 'Admin', '2': 'Doctor', '3': 'Nurse', '5': 'Radiologist', '6': 'Lab Technician',
        'Admin': 'Admin', 'Doctor': 'Doctor', 'Nurse': 'Nurse', 'Radiologist': 'Radiologist', 'Lab Technician': 'Lab Technician', 'LabTechnician': 'Lab Technician'
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
                       rawGender === 2 || rawGender === '2' || String(rawGender).toLowerCase() === 'female' ? 'Female' : 
                       (rawGender || 'Not Specified');

      const resolveImageUrl = (url: any) => {
        if (!url) return '';
        let strUrl = url;
        if (Array.isArray(url) && url.length > 0) {
          strUrl = url[0];
        }
        if (typeof strUrl !== 'string' || strUrl.trim() === '') return '';
        strUrl = strUrl.replace(/\\/g, '/');
        strUrl = strUrl.replace(/(https?:\/\/)[/]+/g, '$1');
        if (strUrl.startsWith('http://') || strUrl.startsWith('https://') || strUrl.startsWith('data:')) return strUrl;
        if (strUrl.startsWith('/')) return `https://nabd.runasp.net${strUrl}`;
        return `https://nabd.runasp.net/${strUrl}`;
      };

      let rawAvatar = item.avatar || item.Avatar || item.PersonalPhotos || item.personalPhotos || item.PersonalPhoto || item.personalPhoto || item.profileImage || item.ProfileImage || item.profilePicture || item.ProfilePicture || item.photo || item.Photo || item.image || item.Image || '';
      if (!rawAvatar && Array.isArray(item.documents)) {
        const photoDoc = item.documents.find((doc: any) => 
          doc && 
          (doc.documentType === 'PersonalPhotos' || 
           String(doc.documentType).toLowerCase() === 'personalphotos' ||
           doc.type === 'PersonalPhotos' ||
           String(doc.type).toLowerCase() === 'personalphotos')
        );
        if (photoDoc) {
          rawAvatar = photoDoc.fileUrl || photoDoc.url || photoDoc.FileUrl || '';
        }
      }

      let cityVal = item.city || item.City || '';
      let countryVal = item.country || item.Country || '';
      if (!cityVal && !countryVal && (item.cityCountry || item.CityCountry)) {
        const parts = (item.cityCountry || item.CityCountry).split(',');
        cityVal = parts[0]?.trim() || '';
        countryVal = parts[1]?.trim() || '';
      }

      // Safe mapping to prevent UI crashes if backend fields are missing or PascalCase
      return {
        ...item, // Spread at top so our mappings can overwrite
        id: item.id || item.Id || item.userId || item.UserId || idOrNationalId,
        name: item.name || item.fullNameEnglish || item.FullNameEnglish || 'Unknown',
        fullNameArabic: item.fullNameArabic || item.FullNameArabic || '',
        role: roleVal,
        department: deptVal,
        licenseId: item.licenseNumber || item.licenseId || 'N/A',
        location: item.location || cityVal || 'Hospital',
        email: item.email || item.Email || '',
        nationalId: item.nationalId || item.NationalId || idOrNationalId,
        phone: item.phoneNumber || item.phone || item.PhoneNumber || '',
        address: item.address || item.Address || '',
        country: countryVal || 'Egypt',
        city: cityVal || '6 Of Oct',
        dateOfBirth: item.dateOfBirth || item.DateOfBirth || '',
        gender: genderStr,
        experience: item.experience || 'N/A',
        qualifications: item.qualification || item.qualifications || item.Qualification || 'N/A',
        status: item.isActive === false || item.active === false ? 'Disabled' : (item.status || 'Active'),
        lastLogin: item.lastLogin || item.LastLogin || 'N/A',
        avatar: resolveImageUrl(rawAvatar),
        
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

    const resolveImageUrl = (url: any) => {
      if (!url) return '';
      let strUrl = url;
      if (Array.isArray(url) && url.length > 0) {
        strUrl = url[0];
      }
      if (typeof strUrl !== 'string' || strUrl.trim() === '') return '';
      strUrl = strUrl.replace(/\\/g, '/');
      strUrl = strUrl.replace(/(https?:\/\/)[/]+/g, '$1');
      if (strUrl.startsWith('http://') || strUrl.startsWith('https://') || strUrl.startsWith('data:')) return strUrl;
      if (strUrl.startsWith('/')) return `https://nabd.runasp.net${strUrl}`;
      return `https://nabd.runasp.net/${strUrl}`;
    };

    /** Helper: build a StaffProfile from a raw backend item */
    const buildProfile = (item: any, fallbackId: string, fallbackNationalId?: string): StaffProfile => {
      const rolesMap: Record<string, string> = {
        '1': 'Admin', '2': 'Doctor', '3': 'Nurse', '5': 'Radiologist', '6': 'Lab Technician',
        'Admin': 'Admin', 'Doctor': 'Doctor', 'Nurse': 'Nurse', 'Radiologist': 'Radiologist', 'Lab Technician': 'Lab Technician', 'LabTechnician': 'Lab Technician'
      };
      
      let rawRole = item.role ?? item.Role ?? item.roleId ?? item.RoleId ?? item.staffRole ?? item.StaffRole ?? item.roleName ?? item.RoleName ?? '';
      if (typeof rawRole === 'object' && rawRole !== null) {
          rawRole = rawRole.name ?? rawRole.Name ?? rawRole.id ?? rawRole.Id ?? '';
      }
      const roleStr = String(rawRole).trim();
      let finalRole = rolesMap[roleStr] || (roleStr && isNaN(parseInt(roleStr)) ? roleStr : '');

      let rawAvatar = item.avatar || item.Avatar || item.PersonalPhotos || item.personalPhotos || item.PersonalPhoto || item.personalPhoto || item.profileImage || item.ProfileImage || item.profilePicture || item.ProfilePicture || item.photo || item.Photo || item.image || item.Image || '';
      if (!rawAvatar && Array.isArray(item.documents)) {
        const photoDoc = item.documents.find((doc: any) => 
          doc && 
          (doc.documentType === 'PersonalPhotos' || 
           String(doc.documentType).toLowerCase() === 'personalphotos' ||
           doc.type === 'PersonalPhotos' ||
           String(doc.type).toLowerCase() === 'personalphotos')
        );
        if (photoDoc) {
          rawAvatar = photoDoc.fileUrl || photoDoc.url || photoDoc.FileUrl || '';
        }
      }

      let cityVal = item.city || item.City || '';
      let countryVal = item.country || item.Country || '';
      if (!cityVal && !countryVal && (item.cityCountry || item.CityCountry)) {
        const parts = (item.cityCountry || item.CityCountry).split(',');
        cityVal = parts[0]?.trim() || '';
        countryVal = parts[1]?.trim() || '';
      }

      const rawGender = item.gender ?? item.Gender;
      const genderStr = rawGender === 1 || rawGender === '1' || String(rawGender).toLowerCase() === 'male' ? 'Male' : 
                       rawGender === 2 || rawGender === '2' || String(rawGender).toLowerCase() === 'female' ? 'Female' : 
                       (rawGender || '');

      return {
        ...item,
        id: item.id || item.Id || item.userId || item.UserId || fallbackId,
        name: resolveName(item),
        fullNameArabic: item.fullNameArabic || item.FullNameArabic || '',
        role: finalRole || jwtRole || 'Staff',
        department: item.department || item.Department || '',
        licenseId: item.licenseId || item.licenseNumber || item.LicenseNumber || '',
        location: item.location || cityVal || '',
        email: item.email || item.Email || '',
        nationalId: item.nationalId || item.NationalId || fallbackNationalId || '',
        phone: item.phoneNumber || item.phone || '',
        address: item.address || item.Address || '',
        city: cityVal,
        country: countryVal,
        gender: genderStr,
        experience: item.experience || '',
        qualifications: item.qualifications || item.qualification || '',
        status: item.isActive === false || item.active === false ? 'Disabled' : (item.status || 'Active'),
        lastLogin: item.lastLogin || item.LastLogin || '',
        avatar: resolveImageUrl(rawAvatar),
      } as StaffProfile;
    };

    // Resolve role if not provided
    let resolvedRole = jwtRole;
    if (!resolvedRole) {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          const parts = token.split('.');
          if (parts.length === 3) {
            const base64Url = parts[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            );
            const payload = JSON.parse(jsonPayload);
            const rawRole =
                payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
                payload.role ||
                payload.Role ||
                payload.staffRole ||
                payload.StaffRole ||
                '';
            const rolesMap: Record<string, string> = {
                '1': 'Admin', '2': 'Doctor', '3': 'Nurse', '5': 'Radiologist', '6': 'Lab Technician',
                'Admin': 'Admin', 'Doctor': 'Doctor', 'Nurse': 'Nurse', 'Radiologist': 'Radiologist', 'Lab Technician': 'Lab Technician', 'LabTechnician': 'Lab Technician'
            };
            const roleStr = String(rawRole).trim();
            resolvedRole = rolesMap[roleStr] || (isNaN(parseInt(roleStr)) ? roleStr : '');
          }
        }
      } catch (e) {
        console.warn("Failed to extract role from token inside getMyProfile:", e);
      }
    }
    // ── Short-circuit for roles that have no profile endpoint yet ──
    // Nurses (and any other non-Admin, non-Doctor roles) don't have a dedicated
    // profile API endpoint yet. Skip all server calls and use JWT data directly
    // to avoid 403/404 error spam in the console.
    const rolesWithProfileEndpoint = ['Admin', 'Lab Technician', 'LabTechnician'];
    const hasProfileEndpoint = rolesWithProfileEndpoint.includes(resolvedRole || '');

    if (!hasProfileEndpoint) {
      return buildProfile({
        id: userId,
        name: jwtUsername || 'Staff Member',
        role: resolvedRole || 'Staff',
        status: 'Active',
        email: '',
        phone: '',
        department: 'General'
      }, userId, jwtUsername);
    }

    // ── Strategy 0: /Admin/Profile (Admin only) ──
    if (resolvedRole === 'Admin') {
      try {
        const response = await fetchApi<any>('/Admin/Profile');
        const item = response?.data;
        if (item) {
          const name = resolveName(item);
          if (name) return buildProfile(item, userId, jwtUsername);
        }
      } catch (err) { console.log("Strategy 0 failed:", err); }
    }

    // ── Strategy Lab Technician ──
    if (resolvedRole === 'Lab Technician' || resolvedRole === 'LabTechnician') {
      try {
        const response = await fetchApi<any>(`/Users/LabTechnician/Profile/${userId}`);
        const item = response?.data;
        if (item) {
          const name = resolveName(item);
          if (name) return buildProfile(item, userId, jwtUsername);
        }
      } catch (err) { console.log("Strategy Lab Tech failed:", err); }
    }

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

  updateLabTechnicianProfile: async (id: string, payload: any): Promise<void> => {
    try {
      const formData = new FormData();
      
      const append = (key: string, value: any) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, String(value));
        }
      };

      append('NameEngLish', payload.FullNameEnglish || payload.NameEngLish || payload.name || '');
      append('NameArabic', payload.FullNameArabic || payload.NameArabic || payload.fullNameArabic || '');
      append('Email', payload.Email || payload.email || '');
      append('PhoneNumber', payload.PhoneNumber || payload.phone || payload.phoneNumber || '');
      append('NationalId', payload.NationalId || payload.nationalId || '');
      append('Gender', payload.Gender || payload.gender || '');
      
      const dateOfBirth = payload.DateOfBirth || payload.dateOfBirth;
      if (dateOfBirth) {
        try {
          const d = new Date(dateOfBirth);
          if (!isNaN(d.getTime())) {
            append('DateOfBirth', d.toISOString());
          } else {
            append('DateOfBirth', dateOfBirth);
          }
        } catch (e) {
          append('DateOfBirth', dateOfBirth);
        }
      }
      
      append('Address', payload.Address || payload.address || '');

      if (payload.PersonalPhotos) {
        if (payload.PersonalPhotos instanceof File) {
          formData.append('PersonalPhotos', payload.PersonalPhotos);
        } else {
          let showImageVal = payload.PersonalPhotos;
          if (typeof showImageVal === 'string') {
            showImageVal = showImageVal.replace('https://nabd.runasp.net', '');
          }
          append('showImage', showImageVal);
        }
      } else {
        let showImageVal = payload.showImage || payload.avatar || '';
        if (showImageVal && typeof showImageVal === 'string') {
          showImageVal = showImageVal.replace('https://nabd.runasp.net', '');
          append('showImage', showImageVal);
        }
      }

      await fetchApi(`/Users/lab/EditLabTechnican/${id}`, {
        method: "POST",
        body: formData,
      });
    } catch (err: any) {
      console.error("Lab technician profile update failed:", err);
      throw err;
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

