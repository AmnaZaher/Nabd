import { fetchApi } from "./config";

export type RadiologyReportStatus =
  | "Draft"
  | "Finalized"
  | "Verified"
  | "Amended"
  | string;

export interface GetAllReportsParams {
  PageSize?: number;
  PageIndex?: number;
  searchTerm?: string;
  RadiologistId?: number;
  PatientId?: number;
  ReportStatus?: RadiologyReportStatus;
  FromDate?: string;
  ToDate?: string;
}

export interface GetAllReportsApiItem {
  id?: number;
  reportId?: number;
  examId?: number;
  requestId?: number;
  requestNumber?: string;
  patientId?: number | string;
  patientName?: string;
  patientFileNumber?: string;
  modality?: string;
  examType?: string;
  testName?: string;
  bodyPart?: string;
  studyDate?: string;
  studyTime?: string;
  reportStatus?: string;
  status?: string;
  radiologistName?: string;
  radiologist?: string;
  doctorName?: string;
  previewUrl?: string;
  imageUrl?: string;
  createdAt?: string;
}

export interface GetAllReportsResponse {
  data?: GetAllReportsApiItem[];
  items?: GetAllReportsApiItem[];
  result?: GetAllReportsApiItem[];
  results?: GetAllReportsApiItem[];
  value?: GetAllReportsApiItem[];
  totalCount?: number;
  count?: number;
  total?: number;
  pageIndex?: number;
  pageSize?: number;
}

const extractPayload = <T>(response: unknown): T => {
  const res = response as any;

  if (res?.data !== undefined) return res.data as T;
  if (res?.result !== undefined) return res.result as T;
  if (res?.items !== undefined) return res.items as T;

  return response as T;
};

export const ensureArray = <T>(data: unknown): T[] => {
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

export const getAllRadiologyReports = async (
  params: GetAllReportsParams = {}
): Promise<GetAllReportsResponse> => {
  const searchParams = new URLSearchParams();

  if (params.PageSize !== undefined) searchParams.append("PageSize", String(params.PageSize));
  if (params.PageIndex !== undefined) searchParams.append("PageIndex", String(params.PageIndex));
  if (params.searchTerm) searchParams.append("searchTerm", params.searchTerm);
  if (params.RadiologistId !== undefined) searchParams.append("RadiologistId", String(params.RadiologistId));
  if (params.PatientId !== undefined) searchParams.append("PatientId", String(params.PatientId));
  if (params.ReportStatus) searchParams.append("ReportStatus", params.ReportStatus);
  if (params.FromDate) searchParams.append("FromDate", params.FromDate);
  if (params.ToDate) searchParams.append("ToDate", params.ToDate);

  const query = searchParams.toString();
  const url = `/RadiologyExam/GetAllReports${query ? `?${query}` : ""}`;

  const response = await fetchApi<unknown>(url, {
    method: "GET",
  });

  const payload = extractPayload<unknown>(response);

  if (Array.isArray(payload)) {
    return {
      data: payload as GetAllReportsApiItem[],
      totalCount: payload.length,
      pageIndex: params.PageIndex ?? 1,
      pageSize: params.PageSize ?? payload.length,
    };
  }

  return (payload as GetAllReportsResponse) || {};
};