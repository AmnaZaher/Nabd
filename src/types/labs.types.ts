// src/types/labs.types.ts

export interface LabParameter {
  id?: number;
  parameterNameEnglish: string; // Backend field name
  unit: string;
  referenceRangeMax: number | string;
  referenceRangeMin: number | string;
  gender: string; // "Male", "Female", "Both"
}

export interface PaginatedResponse<T> {
  pageIndex: number;
  pageSize: number;
  total: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  data: T[];
}

export interface LabTest {
  id: number;
  testCode: string;
  testNameArabic: string;
  testNameEnglish: string;
  category: string;
  sampleType: string;
  fasting_required: boolean;
  parameters: LabParameter[];

  // Fallbacks for /api/Lab/LabCatologs
  code?: string;
  testName?: string;
  fasting?: boolean;
  isActive?: boolean;
}

export interface CreateLabTestDto {
  testCode?: string;
  testNameArabic?: string;
  testNameEnglish?: string;
  category?: string;
  subCategory?: string;
  testMethod?: string;
  sampleType?: string;
  fasting_required?: boolean;
  fasting_hours?: number;
  isActive?: boolean;
  parameters?: Omit<LabParameter, 'id'>[];
}

// ─── Lab Result Types ──────────────────────────────────────────────────────────

/** A single parameter result value (used in CreateResult payload & result details) */
export interface ParamterResultDto {
  paramterId: number;
  paramterValue: number;
  comment?: string;
}

/** Payload for POST /api/Lab/CreateResult */
export interface FinalResultDto {
  requestId: number;
  results: ParamterResultDto[];
}

/** A lab result item returned by GET /api/Lab/GetResults */
export interface LabResult {
  id: number;
  requestId?: number;
  patientName?: string;
  patientId?: number;
  fileNumber?: string;
  testName?: string;
  testNameEnglish?: string;
  doctorName?: string;
  status?: string; // "Pending" | "Scheduled" | "In Progress" | "Completed" | "Approved"
  priority?: string; // "Urgent" | "Normal"
  isApproved?: boolean;
  createdAt?: string;
  approvedAt?: string;
  // Sometimes the backend wraps the nested test info
  labTest?: {
    testNameEnglish?: string;
    testNameArabic?: string;
    category?: string;
  };
  // Sometimes doctor info is nested
  doctor?: { name?: string };
  patient?: { name?: string; fileNumber?: string };
}

/** Detailed result returned by GET /api/Lab/GetResultDetails?id=... */
export interface LabResultDetail extends LabResult {
  parameters?: Array<{
    id: number;
    parameterNameEnglish: string;
    unit: string;
    referenceRangeMin: number;
    referenceRangeMax: number;
    value?: number;
    comment?: string;
  }>;
}

/** Derived stat counts computed from the results list */
export interface LabStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  critical: number;
}
