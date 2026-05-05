// src/api/schedules.ts
import { fetchApi } from './config';

// DayOfWeek enum: 0=Sunday,1=Monday,2=Tuesday,3=Wednesday,4=Thursday,5=Friday,6=Saturday
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface DoctorSchedule {
  id: number;
  doctorId: number;
  doctorName?: string;
  clinicId: number;
  clinicName?: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // "HH:mm:ss"
  endTime: string;   // "HH:mm:ss"
  isActive: boolean;
}

export interface CreateDoctorScheduleDto {
  doctorId: number;
  clinicId: number;
  dayOfWeek: DayOfWeek;
  startTime: string; // "HH:mm:ss"
  endTime: string;   // "HH:mm:ss"
  isActive?: boolean;
}

export interface UpdateDoctorScheduleDto {
  doctorId?: number;
  clinicId?: number;
  dayOfWeek?: DayOfWeek;
  startTime?: string;
  endTime?: string;
  isActive?: boolean;
}

export interface ScheduleListParams {
  PageSize?: number;
  PageIndex?: number;
  DoctorId?: number;
  ClinicId?: number;
  StartDate?: string; // "HH:mm:ss" date-span
  EndDate?: string;   // "HH:mm:ss" date-span
}

export const scheduleApi = {
  getSchedules: async (params?: ScheduleListParams) => {
    const q = new URLSearchParams();
    if (params?.PageSize !== undefined) q.append('PageSize', params.PageSize.toString());
    if (params?.PageIndex !== undefined) q.append('PageIndex', params.PageIndex.toString());
    if (params?.DoctorId !== undefined) q.append('DoctorId', params.DoctorId.toString());
    if (params?.ClinicId !== undefined) q.append('ClinicId', params.ClinicId.toString());
    if (params?.StartDate) q.append('StartDate', params.StartDate);
    if (params?.EndDate) q.append('EndDate', params.EndDate);

    const qs = q.toString();
    return fetchApi<any>(`/Schedule/Schedules${qs ? `?${qs}` : ''}`);
  },

  createSchedule: async (data: CreateDoctorScheduleDto) => {
    return fetchApi<DoctorSchedule>('/Schedule', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateSchedule: async (scheduleId: number, data: UpdateDoctorScheduleDto) => {
    return fetchApi<DoctorSchedule>(`/Schedule/${scheduleId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteSchedule: async (scheduleId: number) => {
    return fetchApi<void>(`/Schedule/${scheduleId}`, {
      method: 'DELETE',
    });
  },

  getAvailableSlots: async (params: { DoctorId?: number; ClinicId?: number; Specialization?: string; Date?: string }) => {
    const q = new URLSearchParams();
    if (params.DoctorId) q.append('DoctorId', params.DoctorId.toString());
    if (params.ClinicId) q.append('ClinicId', params.ClinicId.toString());
    if (params.Specialization) q.append('Specialization', params.Specialization);
    if (params.Date) q.append('Date', params.Date);

    const qs = q.toString();
    return fetchApi<any>(`/Schedule/AvaliableSlot${qs ? `?${qs}` : ''}`);
  },
};