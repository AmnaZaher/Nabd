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

      const rolesMap: Record<string, string> = {
        '1': 'Admin', '2': 'Doctor', '3': 'Nurse', '4': 'Pharmacist', '5': 'Radiologist', '6': 'Lab Technician',
        'Admin': 'Admin', 'Doctor': 'Doctor', 'Nurse': 'Nurse', 'Pharmacist': 'Pharmacist', 'Radiologist': 'Radiologist', 'Lab Technician': 'Lab Technician'
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
        dateOfBirth: item.dateOfBirth || item.DateOfBirth || '',
        gender: genderStr,
        experience: item.experience || 'N/A',
        qualifications: item.qualification || item.qualifications || item.Qualification || 'N/A',
        status: item.isActive === false ? 'Disabled' : (item.status || 'Active'),
        lastLogin: item.lastLogin || 'N/A',
        avatar: item.avatar || item.PersonalPhotos || '',
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

