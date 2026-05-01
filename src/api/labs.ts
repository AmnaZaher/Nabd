// src/api/labs.ts
import { fetchApi } from './config';
import type { LabTest, CreateLabTestDto } from '../types/labs.types';

/**
 * Fetch the full lab test catalog.
 * Note: The endpoint has a typo "GetCataliog".
 */
export const getLabCatalog = async () => {
  return await fetchApi<LabTest[]>('/Lab/GetCataliog', {
    method: 'GET',
  });
};

/**
 * Fetch details for a specific lab test from the catalog.
 * @param id The ID of the test.
 */
export const getLabTestDetails = async (id: number | string) => {
  return await fetchApi<LabTest>(`/Lab/GetAnalysis?id=${id}`, {
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
 */
export const approveLabResult = async (resultId: number | string) => {
  return await fetchApi('/Lab/Approve', {
    method: 'POST',
    body: JSON.stringify({ finalResul: resultId }),
  });
};

/**
 * Get results list.
 */
export const getLabResults = async () => {
  return await fetchApi('/Lab/GetResults', {
    method: 'GET',
  });
};
