import { fetchApi } from "./config";

export interface ListOfAllExamsParams {
  PatientFileNumber?: string;
  RequestNumber?: string;
  DateFrom?: string;
  DateTo?: string;
  PageSize?: number;
  PageIndex?: number;
}

export interface RadiologyExamListItemDto {
  id?: number;
  examId?: number;
  requestId?: number;
  requestNumber?: string;
  patientId?: number;
  patientName?: string;
  patientFileNumber?: string;
  fileNumber?: string;
  modality?: string;
  examName?: string;
  testName?: string;
  bodyPart?: string;
  studyDescription?: string;
  status?: string;
  radiologistName?: string | null;
  priority?: string;
  isStat?: boolean;
  examDate?: string;
  scheduledTime?: string;
  createdAt?: string;
}

export interface RadiologyExamDetailsDto {
  id?: number;
  examId?: number;
  requestId?: number;
  requestNumber?: string;
  patientId?: number;
  patientName?: string;
  patientFileNumber?: string;
  fileNumber?: string;
  modality?: string;
  examName?: string;
  testName?: string;
  bodyPart?: string;
  studyDescription?: string;
  status?: string;
  priority?: string;
  radiologistName?: string | null;
  examDate?: string;
  scheduledTime?: string;
  notes?: string;
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
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data as T[];
    if (Array.isArray(obj.items)) return obj.items as T[];
    if (Array.isArray(obj.result)) return obj.result as T[];
    if (Array.isArray(obj.results)) return obj.results as T[];
    if (Array.isArray(obj.value)) return obj.value as T[];
  }

  return [];
};

const buildQueryString = (params?: ListOfAllExamsParams): string => {
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

export const getListOfAllExams = async (
  params?: ListOfAllExamsParams
): Promise<RadiologyExamListItemDto[]> => {
  const queryString = buildQueryString(params);

  const response = await fetchApi<unknown>(`/RadiologyExam/ListOfAllExams${queryString}`, {
    method: "GET",
  });

  return ensureArray<RadiologyExamListItemDto>(extractPayload(response));
};

export const getRadiologyExamDetails = async (
  examId: number | string
): Promise<RadiologyExamDetailsDto> => {
  const response = await fetchApi<unknown>(`/RadiologyExam/ExamDetails/${examId}`, {
    method: "GET",
  });

  return extractPayload<RadiologyExamDetailsDto>(response) || {};
};