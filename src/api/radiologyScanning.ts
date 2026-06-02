import { fetchApi } from "./config";

export interface RadiologyImageDto {
  id?: number;
  imageId?: number;
  fileName?: string;
  type?: string;
  notes?: string;
  createdAt?: string;
  imageUrl?: string;
  url?: string;
}

export interface UploadRadiologyImageDto {
  id?: number;
  imageId?: number;
  fileName?: string;
  type?: string;
  notes?: string;
  createdAt?: string;
  imageUrl?: string;
  url?: string;
}

export interface PatientInfo {
  id?: number;
  name?: string;
  patientId?: string;
  fileNumber?: string;
  age?: number;
  gender?: string;
  weight?: number;
  dateOfBirth?: string;
}

export interface ExamDetails {
  id?: number;
  examId?: number;
  requestId?: number;
  requestNumber?: string;
  visitNumber?: string;
  visitDate?: string;
  examDate?: string;
  examType?: string;
  examTitle?: string;
  protocol?: string;
  modality?: string;
  bodyPart?: string;
  technician?: string;
  technicianNote?: string;
  notes?: string;
  medicalNotes?: string;
  status?: string;
  doctor?: string;
  doctorName?: string;
  radiologist?: string;
  radiologistName?: string;
  patient?: PatientInfo;
  patientName?: string;
  patientId?: string;
  patientFileNumber?: string;
  patientAge?: number;
  patientGender?: string;
  patientWeight?: number;
  images?: RadiologyImageDto[];
  createdAt?: string;
  updatedAt?: string;
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

export const uploadRadiologyImage = async (
  examId: string | number,
  file: File,
  acquisitionDate?: string,
  notes?: string
): Promise<UploadRadiologyImageDto> => {
  const formData = new FormData();
  formData.append("File", file);

  if (acquisitionDate) {
    formData.append("AcquisitionDate", acquisitionDate);
  }

  if (notes) {
    formData.append("Notes", notes);
  }

  const response = await fetchApi<unknown>(`/RadiologyExam/UploadRadiologyImage/${examId}`, {
    method: "POST",
    body: formData,
  });

  return extractPayload<UploadRadiologyImageDto>(response) || {};
};

export const softDeleteRadiologyImage = async (
  imageId: string | number
): Promise<void> => {
  await fetchApi(`/RadiologyExam/SoftDeleteImage/${imageId}`, {
    method: "DELETE",
  });
};

export const removeAllRadiologyImages = async (
  examId: string | number
): Promise<void> => {
  await fetchApi(`/RadiologyExam/RemoveAllImages/${examId}`, {
    method: "DELETE",
  });
};

/**
 * GET /api/RadiologyExam/ExamDetails/{examId}
 */
export const getExamDetails = async (
  examId: string | number
): Promise<ExamDetails> => {
  const response = await fetchApi<unknown>(`/RadiologyExam/ExamDetails/${examId}`, {
    method: "GET",
  });

  return extractPayload<ExamDetails>(response) || {};
};