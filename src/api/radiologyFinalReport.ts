import { fetchApi } from "./config";

export interface CreateDraftRadiologyReportDto {
  examId: number;
  reportType?: string;
  findingsAr?: string;
  findingsEn: string;
  recommendationsAr?: string;
  recommendationsEn?: string;
  measurements?: string;
  differentialDiagnosis?: string;
  icdCodes: string;
}

export interface CreateDraftRadiologyReportResponse {
  id?: number;
  reportId?: number;
  examId?: number;
  findingsAr?: string;
  findingsEn?: string;
  recommendationsAr?: string;
  recommendationsEn?: string;
  measurements?: string;
  differentialDiagnosis?: string;
  icdCodes?: string;
  status?: string;
  message?: string;
}

const extractPayload = <T>(response: unknown): T => {
  const res = response as any;

  if (res?.data !== undefined) return res.data as T;
  if (res?.result !== undefined) return res.result as T;
  if (res?.items !== undefined) return res.items as T;

  return response as T;
};

export const createDraftRadiologyReport = async (
  payload: CreateDraftRadiologyReportDto
): Promise<CreateDraftRadiologyReportResponse> => {
  const response = await fetchApi<unknown>(`/RadiologyExam/CreateDraftReport`, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return extractPayload<CreateDraftRadiologyReportResponse>(response) || {};
};