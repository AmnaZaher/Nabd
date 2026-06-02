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
  },

  listVisits: async (params?: Record<string, any>) => {
    const queryStr = params
      ? '?' +
        new URLSearchParams(
          Object.entries(params)
            .filter(([_, v]) => v !== undefined && v !== null && v !== '')
            .map(([k, v]) => [k, String(v)])
        ).toString()
      : '';

    return await fetchApi(`/Visit${queryStr}`);
  },

  getVisit: async (visitId: number | string) => {
    return await fetchApi(`/Visit/${visitId}`, {
      method: 'GET',
    });
  },

  markVisitComplete: async (visitId: number | string) => {
    return await fetchApi(`/Visit/${visitId}/MarkComplete`, {
      method: 'PATCH',
    });
  },

  updateVisit: async (visitId: number | string, payload: any) => {
    return await fetchApi(`/Visit/${visitId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  getVitalSigns: async (visitId: number | string) => {
    return await fetchApi(`/Visit/${visitId}/vital-signs`, {
      method: 'GET',
    });
  },

  getVitalSignsHistory: async (params?: Record<string, any>) => {
    const queryStr = params
      ? '?' +
        new URLSearchParams(
          Object.entries(params)
            .filter(([_, v]) => v !== undefined && v !== null && v !== '')
            .map(([k, v]) => [k, String(v)])
        ).toString()
      : '';

    return await fetchApi(`/Visit/vital-signs/history${queryStr}`, {
      method: 'GET',
    });
  },

  addPrescription: async (visitId: number | string, payload: any) => {
    return await fetchApi(`/Visit/${visitId}/prescriptions`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getPrescriptions: async (visitId: number | string) => {
    return await fetchApi(`/Visit/${visitId}/prescriptions`, {
      method: 'GET',
    });
  },

  getPrescriptionDetails: async (prescriptionId: number | string) => {
    return await fetchApi(`/Visit/prescriptions/${prescriptionId}`, {
      method: 'GET',
    });
  },

  addDiagnosis: async (visitId: number | string, payload: any) => {
    return await fetchApi(`/Visit/${visitId}/diagnoses`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getDiagnoses: async (visitId: number | string) => {
    return await fetchApi(`/Visit/${visitId}/diagnoses`, {
      method: 'GET',
    });
  },

  getDiagnosisDetails: async (visitId: number | string, diagnosisId: number | string) => {
    return await fetchApi(`/Visit/${visitId}/diagnosesDetails/${diagnosisId}`, {
      method: 'GET',
    });
  },

  checkMedicineAi: async (visitId: number | string) => {
    return await fetchApi(`/Ai/check-medicine/${visitId}`, {
      method: 'POST',
    });
  }
};