import { fetchApi } from './config';
import type { StaffProfile } from '../types/staff.types';

export const mapToStaffProfile = (data: any, fallbackId?: string): StaffProfile => {
    if (!data) return {} as StaffProfile;
    
    // In case the endpoint returns an array or wrapped object
    const rawData = Array.isArray(data) ? data[0] : (data?.data || data);
    
    const actualId = rawData.id || rawData.userId || rawData.UserId || fallbackId || '';
    
    const firstName = rawData.firstName || rawData.FirstName || '';
    const lastName = rawData.lastName || rawData.LastName || '';
    const combinedName = (firstName || lastName) ? `${firstName} ${lastName}`.trim() : '';

    return {
        ...rawData,
        id: actualId,
        name: rawData.name || rawData.Name || 
              rawData.fullNameEnglish || rawData.FullNameEnglish || 
              rawData.fullName || rawData.FullName || 
              combinedName || 
              rawData.doctorName || rawData.DoctorName || 
              rawData.userName || rawData.UserName || 
              'Unknown',
        fullNameArabic: rawData.fullNameArabic || rawData.FullNameArabic || '',
        role: rawData.role || rawData.Role || 'Doctor',
        department: rawData.department || rawData.Department || rawData.dept || rawData.Dept || '',
        licenseId: rawData.licenseId || rawData.LicenseId || rawData.licenseNumber || rawData.LicenseNumber || '',
        location: rawData.location || rawData.Location || rawData.city || rawData.City || '',
        email: rawData.email || rawData.Email || rawData.emailAddress || rawData.EmailAddress || '',
        nationalId: rawData.nationalId || rawData.NationalId || actualId,
        phone: rawData.phone || rawData.Phone || rawData.phoneNumber || rawData.PhoneNumber || '',
        address: rawData.address || rawData.Address || '',
        gender: rawData.gender === 1 ? 'Male' : rawData.gender === 2 ? 'Female' : (rawData.gender || rawData.Gender || 'Not Specified'),
        dateOfBirth: rawData.dateOfBirth || rawData.DateOfBirth || '',
        experience: rawData.experience || rawData.Experience || '',
        qualifications: rawData.qualifications || rawData.Qualifications || rawData.qualification || '',
        status: rawData.isActive === false ? 'Disabled' : (rawData.status || rawData.Status || 'Active'),
        lastLogin: rawData.lastLogin || rawData.LastLogin || '',
        avatar: rawData.avatar || rawData.Avatar || rawData.profileImage || rawData.ProfileImage || rawData.personalPhotos || rawData.PersonalPhotos || '',
        
        syndicateNumber: rawData.syndicateNumber || rawData.SyndicateNumber || '',
        graduationYear: rawData.graduationYear || rawData.GraduationYear || '',
        educationalQualification: rawData.educationalQualification || rawData.EducationalQualification || rawData.qualifications || '',
        dateOfAppointment: rawData.dateOfAppointment || rawData.DateOfAppointment || '',
        isHeadOfDepartment: !!(rawData.isHeadOfDepartment || rawData.IsHeadOfDepartment),
        assignedDept: rawData.assignedDept || rawData.AssignedDept || rawData.department || '',
        assignedClinic: rawData.assignedClinic || rawData.AssignedClinic || rawData.location || '',
        workingSchedule: rawData.workingSchedule || rawData.WorkingSchedule || [],
        documents: rawData.documents || rawData.Documents || []
    } as unknown as StaffProfile;
};

export const usersApi = {
    getDoctorProfile: async (userId: string) => {
        return fetchApi<any>(`/Users/Doctor/Profile/${userId}`);
    },
    getUserFiles: async (userId: string) => {
        return fetchApi<any>(`/Users/Files/${userId}`);
    },
    getDoctorSchedule: async (userId: string) => {
        return fetchApi<any>(`/Users/Doctor/DoctorSchedule/${userId}`);
    },
    editDoctor: async (userId: string, data: any) => {
        return fetchApi<any>(`/Users/Doctor/EditDoctor/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }
};
