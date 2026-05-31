// src/api/radiologistProfile.ts
import { fetchApi } from "./config";

export interface RadiologistProfileDocumentDto {
  id?: number | string;
  documentType?: string;
  type?: string;
  fileUrl?: string;
  url?: string;
}

export interface RadiologistProfileDto {
  id?: string | number;
  userId?: string | number;
  name?: string;
  fullName?: string;
  fullNameArabic?: string;
  role?: string;
  status?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  nationalId?: string;
  address?: string;
  city?: string;
  country?: string;
  avatar?: string;
  profileImage?: string;
  department?: string;
  location?: string;
  licenseId?: string;
  licenseNumber?: string;
  experience?: string;
  yearsOfExperience?: string | number;
  employmentDate?: string;
  createdAt?: string;
  lastUpdated?: string;
  lastLogin?: string;
  documents?: RadiologistProfileDocumentDto[];
}

export interface UpdateRadiologistProfileDto {
  name?: string;
  fullNameArabic?: string;
  nationalId?: string;
  gender?: string;
  dateOfBirth?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const extractPayload = <T>(response: unknown): T => {
  const res = response as any;

  if (res?.data !== undefined) return res.data as T;
  if (res?.result !== undefined) return res.result as T;
  if (res?.items !== undefined) return res.items as T;

  return response as T;
};

export const getRadiologistProfile = async (
  userId: string | number
): Promise<RadiologistProfileDto> => {
  const response = await fetchApi<unknown>(`/Users/Radiologist/Profile/${userId}`, {
    method: "GET",
  });

  return extractPayload<RadiologistProfileDto>(response) || {};
};

export const updateRadiologistProfile = async (
  userId: string | number,
  payload: UpdateRadiologistProfileDto
): Promise<RadiologistProfileDto> => {
  const response = await fetchApi<unknown>(`/Users/Radiologist/Profile/${userId}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return extractPayload<RadiologistProfileDto>(response) || {};
};

export const changePassword = async (
  payload: ChangePasswordDto
): Promise<void> => {
  await fetchApi("/Account/ChangePasswrod", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};