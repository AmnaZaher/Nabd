import { fetchApi } from "./config";

export interface RadiologyImageDto {
  id?: number;
  imageId?: number;
  examId?: number | string; // Added here
  fileName?: string;
  type?: string;
  notes?: string;
  createdAt?: string;
  imageUrl?: string;
  url?: string;
  reportTextForImage?: string;
  ReportTextForImage?: string;
}

export interface UploadRadiologyImageDto {
  id?: number;
  imageId?: number;
  examId?: number | string; // Added here
  fileName?: string;
  type?: string;
  notes?: string;
  createdAt?: string;
  imageUrl?: string;
  url?: string;
}

export interface UpdateImageNotesRequest {
  reportTextForImage: string;
}

/**
 * Swagger says PATCH /api/RadiologyExam/UpdateImageNotes/{imageId}
 * request body = ImageReport
 *
 * Based on your current UI usage, the request field used is reportTextForImage.
 */
export interface ImageReport {
  reportTextForImage: string;
}

export interface UpdateImageNotesResponse {
  id?: number;
  imageId?: number;
  reportTextForImage?: string;
  message?: string;
  success?: boolean;
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

export const updateRadiologyImageNotes = async (
  imageId: string | number,
  payload: UpdateImageNotesRequest
): Promise<UpdateImageNotesResponse> => {
  const response = await fetchApi<unknown>(`/RadiologyExam/UpdateImageNotes/${imageId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return extractPayload<UpdateImageNotesResponse>(response) || {};
};

export const deleteRadiologyImageByUpdateNotesEndpoint = async (
  imageId: string | number
): Promise<void> => {
  await fetchApi(`/RadiologyExam/UpdateImageNotes/${imageId}`, {
    method: "DELETE",
  });
};

export const getImagesByExam = async (
  examId: string | number
): Promise<RadiologyImageDto[]> => {
  const response = await fetchApi<unknown>(`/RadiologyExam/GetImagesByExam/${examId}`, {
    method: "GET",
  });

  const payload = extractPayload<unknown>(response);
  return ensureArray<RadiologyImageDto>(payload);
};