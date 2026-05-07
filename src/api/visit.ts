// src/api/visit.ts
import { fetchApi } from './config';

export interface CreateVisitPayload {
  ChiefComplaint?: string;
  VisitType?: string;
  Notes?: string;
  'VitalSigns.Temperature'?: number;
  'VitalSigns.BloodPressureSystolic'?: number;
  'VitalSigns.BloodPressureDiastolic'?: number;
  'VitalSigns.HeartRate'?: number;
  'VitalSigns.RespiratoryRate'?: number;
  'VitalSigns.OxygenSaturation'?: number;
  'VitalSigns.Weight'?: number;
  'VitalSigns.Height'?: number;
  'VitalSigns.BloodGlucose'?: number;
  'VitalSigns.BMI'?: number;
  'VitalSigns.Notes'?: string;
  Attachments?: File[];
}

export const visitApi = {
  createVisit: async (appointmentId: number | string, payload: CreateVisitPayload) => {
    const formData = new FormData();
    
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'Attachments' && Array.isArray(value)) {
          value.forEach((file: File) => {
            formData.append('Attachments', file);
          });
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    return await fetchApi(`/Visit/${appointmentId}`, {
      method: 'POST',
      body: formData,
    });
  }
};
