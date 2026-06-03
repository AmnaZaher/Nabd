// src/api/labs.ts
import { fetchApi, BASE_URL } from './config';
import type {
  LabTest,
  CreateLabTestDto,
  PaginatedResponse,
  LabResult,
  LabResultDetail,
  FinalResultDto,
} from '../types/labs.types';

/**
 * Fetch the full lab test catalog.
 */
export const getLabCatalog = async (pageIndex = 1, pageSize = 5) => {
  return await fetchApi<PaginatedResponse<LabTest>>(`/Lab/LabCatologs?pageIndex=${pageIndex}&pageSize=${pageSize}`, {
    method: 'GET',
  });
};

/**
 * Fetch available lab tests for a visit.
 */
export const getAvailableLabTests = async () => {
  return await fetchApi<any[]>('/Lab/AvaliableLabTest', {
    method: 'GET',
  });
};

/**
 * Fetch details for a specific lab test from the catalog.
 * @param id The ID of the test.
 */
export const getLabTestDetails = async (id: number | string) => {
  return await fetchApi<LabTest>(`/Lab/LabCatalogDetails/${id}`, {
    method: 'GET',
  });
};

/**
 * Create a new lab test in the catalog.
 */
export const createLabTest = async (payload: CreateLabTestDto) => {
  return await fetchApi('/Lab/CreateLabTest', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

/**
 * Approve a lab result.
 * Note: The backend expects finalResul as a QUERY PARAM, not a body.
 */
export const approveLabResult = async (resultId: number | string) => {
  return await fetchApi(`/Lab/Approve?id=${resultId}`, {
    method: 'POST',
  });
};

/**
 * Get all lab results list.
 * Returns array of LabResult objects.
 */
export const getLabResults = async () => {
  return await fetchApi<LabResult[]>('/Lab/GetResults', {
    method: 'GET',
  });
};

/**
 * Get detailed info for a specific lab result.
 * @param id The result ID.
 */
export const getLabResultDetails = async (id: number | string) => {
  return await fetchApi<LabResultDetail>(`/Lab/GetResultDetails?id=${id}`, {
    method: 'GET',
  });
};

/**
 * Get detailed info for a result to approve.
 */
export const getLabResultApprovalDetails = async (id: number | string) => {
  return await fetchApi<LabResultDetail>(`/Lab/LabResultApprovalDetails?id=${id}`, {
    method: 'GET',
  });
};

/**
 * Reject a lab result.
 */
export const rejectLabResult = async (resultId: number | string) => {
  return await fetchApi(`/Lab/RejectResult?id=${resultId}`, {
    method: 'POST',
  });
};

/**
 * Get lab test details for a specific request (used before a result is created).
 * @param requestId The request ID.
 */
export const getLabTestRequestDetails = async (requestId: number | string) => {
  return await fetchApi<any>(`/Lab/LabTecnican/LabTestDetails/${requestId}`, {
    method: 'GET',
  });
};

/**
 * Get parameters for a specific lab request.
 * @param requestId The request ID.
 */
export const getLabParameters = async (requestId: number | string) => {
  return await fetchApi<any>(`/Lab/GetParamret?RequestId=${requestId}`, {
    method: 'GET',
  });
};

/**
 * Get analysis data for a specific result.
 * @param id The result ID.
 */
export const getLabAnalysis = async (id: number | string) => {
  return await fetchApi<any>(`/Lab/GetAnalysis?id=${id}`, {
    method: 'GET',
  });
};

/**
 * Submit final results for a lab request.
 * @param payload FinalResultDto with requestId and array of parameter results.
 */
export const createLabResult = async (payload: FinalResultDto) => {
  return await fetchApi('/Lab/CreateResult', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

/**
 * Export a lab result as PDF.
 * @param idOrRequestId The final lab result ID or the request ID.
 */
export const exportLabPDF = async (idOrRequestId: number | string) => {
  const token = localStorage.getItem('accessToken');
  let finalLabResultId = idOrRequestId;

  try {
    // Try to lookup the FinalLabResultId using the request ID
    const resultsResponse = await fetchApi<any[]>('/Lab/GetResults', { method: 'GET' });
    const results = (resultsResponse as any)?.data || resultsResponse;
    const list = Array.isArray(results) ? results : [];
    
    // Find the result where requestId matches the provided ID
    const match = list.find((r: any) => r.requestId == idOrRequestId || r.request?.id == idOrRequestId);
    
    if (match && match.id) {
        finalLabResultId = match.id;
    }
  } catch (err) {
    console.warn("Could not fetch lab results to verify finalLabResultId. Proceeding with provided ID.", err);
  }

  const url = `${BASE_URL}/Lab/${finalLabResultId}/exportLabPDF`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to download PDF: ${response.statusText}`);
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `LabResult_${finalLabResultId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Error exporting PDF:", error);
    alert("Could not export PDF. Please ensure the result is completed.");
  }
};

/**
 * Get the full catalog list without pagination (for dropdowns).
 */
export const getLabCatalogFull = async () => {
  return await fetchApi<LabTest[]>('/Lab/GetCataliog', {
    method: 'GET',
  });
};

/**
 * Get patient and visit info for a specific visit.
 * @param visitId The visit ID.
 */
export const getPatientVisitLabRequestsInfo = async (visitId: number | string) => {
  return await fetchApi<any>(`/Lab/PatientVisitLabRequestsInfo/${visitId}`, {
    method: 'GET',
  });
};

/**
 * Get lab requests/tests for a specific visit.
 * @param visitId The visit ID.
 */
export const getVisitLabRequests = async (visitId: number | string) => {
  return await fetchApi<any[]>(`/Lab/VisitLabRequests/${visitId}`, {
    method: 'GET',
  });
};
