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
 * Fetch details for a specific lab test from the catalog.
 * @param id The ID of the test.
 */
export const getLabTestDetails = async (id: number | string) => {
  return await fetchApi<LabTest>(`/Lab/LabCatologs?id=${id}`, {
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
  return await fetchApi(`/Lab/Approve?finalResul=${resultId}`, {
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
 * Opens the PDF in a new browser tab.
 * @param finalLabResultId The final lab result ID.
 */
export const exportLabPDF = (finalLabResultId: number | string) => {
  const token = localStorage.getItem('accessToken');
  const url = `${BASE_URL}/Lab/${finalLabResultId}/exportLabPDF`;
  // Open in new tab; the browser handles the PDF download
  const link = document.createElement('a');
  link.href = token ? `${url}?token=${token}` : url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.click();
};

/**
 * Get the full catalog list without pagination (for dropdowns).
 */
export const getLabCatalogFull = async () => {
  return await fetchApi<LabTest[]>('/Lab/GetCataliog', {
    method: 'GET',
  });
};
