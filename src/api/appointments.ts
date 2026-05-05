import { fetchApi } from './config';

// ----- Types -----
export type AppointmentStatus = 1 | 2 | 3 | 4 | 5 | 6; // 1=Scheduled, 2=InProgress, 3=Completed, 4=NoShow, 5=Cancelled, 6=WaitingList

export interface Appointment {
    id: number;
    appointmentCode?: string;
    patientId: number;
    patientName: string;
    patientAvatar?: string;
    doctorId: number;
    doctorName: string;
    clinicId?: number;
    clinicName?: string;
    clinicWing?: string;
    dateTime?: string;        // legacy / some backends
    appointmentDate?: string; // backend field from CreateAppointmentDto
    [key: string]: any;       // allow any extra fields the backend returns
    status: AppointmentStatus;
    notes?: string;
    appointmentType?: number;
    fileNumber?: string;
}

export interface BookAppointmentDto {
    fileNumber?: string;
    doctorId: number;
    clinicId?: number;
    appointmentDate: string; // ISO string – matches CreateAppointmentDto
    appointmentType?: number;
    notes?: string;
}

export interface AppointmentListParams {
    PageIndex?: number;
    PageSize?: number;
    FileNumber?: string;
    DoctorId?: number | string;
    ClinicId?: number | string;
    Status?: number | string;
    /** Exact date filter the backend accepts (maps to DateAppointment query param) */
    DateAppointment?: string;
    /** Convenience alias – will be sent as DateAppointment */
    StartDate?: string;
    /** Convenience alias – currently unused by backend (no range support) */
    EndDate?: string;
    AppointmentType?: number;
    SearchKey?: string;
    search?: string;
}

// ----- API Calls -----

export const bookAppointment = async (payload: BookAppointmentDto) => {
    return await fetchApi('/Appointment/Book', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
};

export const getAppointmentDetails = async (id: number | string) => {
    return await fetchApi<any>(`/Appointment/Details/${id}`, {
        method: 'GET',
    });
};

export const updateAppointment = async (id: number | string, payload: Partial<BookAppointmentDto>) => {
    return await fetchApi(`/Appointment/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
};

export const changeAppointmentStatus = async (id: number | string, status: AppointmentStatus) => {
    return await fetchApi(`/Appointment/status/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    });
};

export const deleteAppointment = async (id: number | string) => {
    return await fetchApi(`/Appointment/${id}`, {
        method: 'DELETE',
    });
};

export const listAppointments = async (params?: AppointmentListParams) => {
    const q = new URLSearchParams();
    if (params?.PageIndex !== undefined) q.append('PageIndex', params.PageIndex.toString());
    if (params?.PageSize !== undefined) q.append('PageSize', params.PageSize.toString());
    if (params?.FileNumber) q.append('FileNumber', params.FileNumber);
    if (params?.DoctorId) q.append('DoctorId', params.DoctorId.toString());
    if (params?.ClinicId) q.append('ClinicId', params.ClinicId.toString());
    if (params?.Status !== undefined && params.Status !== '') q.append('Status', params.Status.toString());
    if (params?.AppointmentType !== undefined) q.append('AppointmentType', params.AppointmentType.toString());

    // Backend only supports DateAppointment (single date). StartDate is mapped to it.
    const dateFilter = params?.DateAppointment || params?.StartDate;
    if (dateFilter) q.append('DateAppointment', dateFilter);

    if (params?.SearchKey) q.append('SearchKey', params.SearchKey);
    if (params?.search) q.append('search', params.search);

    const qs = q.toString();
    const res = await fetchApi<any>(`/Appointment/Appointments${qs ? `?${qs}` : ''}`);

    // Debug: log first item to identify date field name
    const firstItem = (res as any)?.data?.data?.[0] ||
                      (res as any)?.data?.appointments?.[0] ||
                      (res as any)?.data?.items?.[0] ||
                      (Array.isArray((res as any)?.data) ? (res as any).data[0] : null);
    if (firstItem) {
        console.log('[appointments] First item keys:', Object.keys(firstItem));
        console.log('[appointments] First item sample:', JSON.stringify(firstItem, null, 2).slice(0, 500));
    }

    return res;
};
