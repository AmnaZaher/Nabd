import { fetchApi, BASE_URL } from "./config";

export interface RadiologyExamDetailsDto {
  id?: number;
  examId?: number;
  reportId?: number;
  patientId?: number;
  patientName?: string;
  patientFileNumber?: string;
  fileNumber?: string;
  examType?: string;
  modality?: string;
  bodyPart?: string;
  studyDescription?: string;
  radiologistName?: string;
  priority?: string;
  status?: string;
  reportStatus?: string;
  approvalStatus?: string;
  age?: number;
  gender?: string;
  examDate?: string;
  scheduledTime?: string;
  reportContent?: string;
  clinicalIndication?: string;
  technique?: string;
  findings?: string;
  impression?: string;
  images?: Array<{
    id?: number;
    fileName?: string;
    imageUrl?: string;
    url?: string;
    notes?: string;
    createdAt?: string;
    type?: string;
  }>;
  history?: Array<{
    title?: string;
    date?: string;
    doctor?: string;
    status?: string;
  }>;
}

const extractPayload = <T>(response: unknown): T => {
  const res = response as any;
  if (res?.data !== undefined) return res.data as T;
  if (res?.result !== undefined) return res.result as T;
  if (res?.items !== undefined) return res.items as T;
  return response as T;
};

export const getExamDetails = async (
  examId: string | number
): Promise<RadiologyExamDetailsDto> => {
  const response = await fetchApi<unknown>(`/RadiologyExam/ExamDetails/${examId}`, {
    method: "GET",
  });

  return extractPayload<RadiologyExamDetailsDto>(response) || {};
};

export const verifyReport = async (reportId: string | number): Promise<void> => {
  await fetchApi(`/RadiologyExam/VerifyReport/${reportId}`, {
    method: "PATCH",
  });
};

export const exportReportPdf = async (reportId: string | number): Promise<void> => {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(`${BASE_URL}/RadiologyExam/ExportReportPdf/${reportId}`, {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!response.ok) {
    throw new Error(`Failed to download PDF (${response.status})`);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `radiology-report-${reportId}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};