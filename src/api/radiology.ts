// src/api/radiology.ts
import { fetchApi } from './config';

/**
 * Fetch available radiology tests.
 */
export const getAvailableRadiologyTests = async () => {
    return await fetchApi<any[]>('/Radiology/catalog/available', {
        method: 'GET',
    });
};
/**
 * Create a new radiology request.
 */
export const createRadiologyRequest = async (payload: any) => {
    return await fetchApi('/Radiology/requests', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
};
