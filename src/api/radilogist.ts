const BASE_URL="https://nabd.runasp.net/api";
import { fetchApi } from "./config";
import type { ApiResponse } from "../types/api.types";

export interface TodayRadiologyRequestDto {
  id?: number;
  requestId?: number;
  patientId?: number;
  patientName?: string;
  requestNumber?: string;
  modality?: string;
  category?: string;
  examName?: string;
  testName?: string;
  scheduleTime?: string;    
  scheduledAt?: string;
  examDate?: string;
  room?: string;
  roomName?: string;
  radiologistName?: string;
  radiologistInitials?: string;
  status?: string;
}

export interface PatientInfoDto {
  patientId?: number;
  patientName?: string;
  fileNumber?: string;
  age_Gender?: string;
  bloodType?: string;
  phoneNumber?: string;
  lastVisit?: string;
  totalRadiologyExams?: number;
  totalRadiologyReportsPending?: number;

  // keep optional fallbacks if backend shape changes elsewhere
  id?: number;
  name?: string;
  fullName?: string;
  mrn?: string;
  caseId?: string;
  caseNumber?: string;
  age?: number;
  gender?: string;
  contact?: string;
  mobile?: string;
  totalExams?: number;
  pendingReports?: number;
}

export interface PatientReportDto {
  id?: number;
  reportId?: number;
  examId?: number;
  patientId?: number;
  createdAt?: string;
  reportDate?: string;
  examDate?: string;
  modality?: string;
  examType?: string;
  type?: string;
  bodyPart?: string;
  studyDescription?: string;
  radiologistName?: string;
  radiologist?: string;
  status?: string;
  approvalStatus?: string;
  content?: string;
  reportTitle?: string;
}

export interface GetReportsByPatientParams {
  dateFrom?: string;
  dateTo?: string;
  status?: string | number;
}

export interface GetRadiologyRequestsParams {
  PageSize?: number;
  PageIndex?: number;
  Search?: string;
  FromDate?: string;
  ToDate?: string;
  Status?: string | number;
  Category?: string | number;
}

export interface RadiologyRequestListItemDto {
  id?: number;
  requestId?: number;
  patientId?: number;
  patientName?: string;
  patientFileNumber?: string;
  fileNumber?: string;
  requestNumber?: string;
  modality?: string;
  category?: string;
  examName?: string;
  testName?: string;
  bodyPart?: string;
  studyDescription?: string;
  status?: string;
  radiologistName?: string | null;
  isStat?: boolean;
  priority?: string;
  age?: number;
  gender?: string;
  nationalId?: string;
  referringDoctor?: string;
  referringDr?: string;
  scheduledTime?: string;
  examDate?: string;
}

export interface RadiologyRequestDetailsDto {
  id?: number;
  requestId?: number;
  patientId?: number;
  patientName?: string;
  patientFileNumber?: string;
  fileNumber?: string;
  requestNumber?: string;
  modality?: string;
  category?: string;
  examName?: string;
  testName?: string;
  bodyPart?: string;
  studyDescription?: string;
  status?: string;
  priority?: string;
  age?: number;
  gender?: string;
  nationalId?: string;
  referringDoctor?: string;
  referringDr?: string;
  scheduledTime?: string;
  examDate?: string;
  radiologistName?: string | null;
  isStat?: boolean;
}

export interface CreateExamDto {
  examDate?: string;
  notes?: string;
  modality?: string;
  room?: string;
}

export interface CreateExamResponseDto {
  id?: number;
  examId?: number;
  message?: string;
}

const extractPayload = <T>(response: unknown): T => {
  const res = response as any;

  if (res?.data !== undefined) return res.data as T;
  if (res?.result !== undefined) return res.result as T;
  if (res?.items !== undefined) return res.items as T;

  return response as T;
};

const ensureArray = <T>(data: unknown): T[] => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const maybeData = data as Record<string, unknown>;
    if (Array.isArray(maybeData.data)) return maybeData.data as T[];
    if (Array.isArray(maybeData.items)) return maybeData.items as T[];
    if (Array.isArray(maybeData.result)) return maybeData.result as T[];
    if (Array.isArray(maybeData.results)) return maybeData.results as T[];
    if (Array.isArray(maybeData.value)) return maybeData.value as T[];
  }
  return [];
};

export const buildQueryString = (params?: GetReportsByPatientParams): string => {
  if (!params) return "";

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
};

/* ================== Radiology APIs ================== */

export const getTodayRadiologyRequests = async (): Promise<TodayRadiologyRequestDto[]> => {
  const response = await fetchApi<unknown>("/Radiology/requests/today", {
    method: "GET",
  });

  return ensureArray<TodayRadiologyRequestDto>(extractPayload(response));
};

export const getPatientInfo = async (
  patientId: number | string
): Promise<PatientInfoDto> => {
  const response = await fetchApi<PatientInfoDto>(`/RadiologyExam/GetPatientInfo/${patientId}`, {
    method: "GET",
  });

  return extractPayload<PatientInfoDto>(response) || {};
};

export const getReportsByPatient = async (
  patientId: number | string,
  params?: GetReportsByPatientParams
): Promise<PatientReportDto[]> => {
  const queryString = buildQueryString(params);

  const response  = await fetchApi<unknown>(
    `/RadiologyExam/GetReportsByPatient/${patientId}${queryString}`,
    {
      method: "GET",
    }
  );
  
  return ensureArray<PatientReportDto>(extractPayload(response));
};

export const getRadiologyRequests = async (
  params?: GetRadiologyRequestsParams
): Promise<RadiologyRequestListItemDto[]> => {
  const queryString = buildQueryString(params);

  const response = await fetchApi<unknown>(`/Radiology/requests${queryString}`, {
    method: "GET",
  });

  return ensureArray<RadiologyRequestListItemDto>(extractPayload(response));
};

export const getRadiologyRequestById = async (
  id: number | string
): Promise<RadiologyRequestDetailsDto> => {
  const response = await fetchApi<unknown>(`/Radiology/requests/${id}`, {
    method: "GET",
  });

  return extractPayload<RadiologyRequestDetailsDto>(response) || {};
};

export const deleteRadiologyRequest = async (
  id: number | string
): Promise<void> => {
  await fetchApi(`/Radiology/requests/${id}`, {
    method: "DELETE",
  });
};

export const createRadiologyExam = async (
  requestId: number | string,
  body: CreateExamDto = {}
): Promise<CreateExamResponseDto> => {
  const response = await fetchApi<unknown>(
    `/RadiologyExam/CreateExam?requestId=${requestId}`,
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );

  return extractPayload<CreateExamResponseDto>(response) || {};
};