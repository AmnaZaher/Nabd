import { apiSlice } from './apiSlice';
import type { LabResult } from '../../types/labs.types';

export const labApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getLabOrders: builder.query<any, Record<string, any> | void>({
            query: (params) => {
                let url = '/Lab/LabOrders';
                const queryParams = new URLSearchParams();
                
                if (params) {
                    Object.entries(params).forEach(([key, value]) => {
                        if (value !== undefined && value !== null && value !== '') {
                            queryParams.append(key, value.toString());
                        }
                    });
                }
                
                // Add default PageSize if not provided
                if (!queryParams.has('PageSize')) {
                    queryParams.append('PageSize', '100');
                }
                
                return `${url}?${queryParams.toString()}`;
            },
            providesTags: ['LabOrder'],
        }),
        getLabDashboardStats: builder.query<any, void>({
            query: () => '/Lab/LabDashBoard',
        }),
        getLabResults: builder.query<any, Record<string, any> | void>({
            query: (params) => {
                let url = '/Lab/GetResults';
                const queryParams = new URLSearchParams();
                
                if (params) {
                    Object.entries(params).forEach(([key, value]) => {
                        if (value !== undefined && value !== null && value !== '') {
                            queryParams.append(key, value.toString());
                        }
                    });
                }
                
                if (!queryParams.has('PageSize')) {
                    queryParams.append('PageSize', '1000');
                }
                
                return `${url}?${queryParams.toString()}`;
            },
            transformResponse: (response: any) => {
                if (response && response.data) {
                    return response.data;
                }
                return response;
            },
            providesTags: ['LabResult'],
        }),
        approveLabResult: builder.mutation<void, number | string>({
            query: (id) => ({
                url: `/Lab/Approve?id=${id}`,
                method: 'POST',
            }),
            invalidatesTags: ['LabResult', 'LabOrder'],
        }),
        getResultsToApprove: builder.query<any, Record<string, any> | void>({
            query: (params) => {
                let url = '/Lab/GetResultsToApprove';
                const queryParams = new URLSearchParams();
                
                if (params) {
                    Object.entries(params).forEach(([key, value]) => {
                        if (value !== undefined && value !== null && value !== '') {
                            queryParams.append(key, value.toString());
                        }
                    });
                }
                
                if (!queryParams.has('PageSize')) {
                    queryParams.append('PageSize', '1000');
                }
                
                return `${url}?${queryParams.toString()}`;
            },
            transformResponse: (response: any) => {
                if (response && response.data) {
                    return response.data;
                }
                return response;
            },
            providesTags: ['LabResult'],
        }),
        getApprovalDashboardStats: builder.query<any, void>({
            query: () => '/Lab/ApprovalDashBoard',
            transformResponse: (response: any) => {
                if (response && response.data) {
                    return response.data;
                }
                return response;
            },
        }),
        rejectLabResult: builder.mutation<void, number | string>({
            query: (id) => ({
                url: `/Lab/RejectResult?id=${id}`,
                method: 'POST',
            }),
            invalidatesTags: ['LabResult', 'LabOrder'],
        }),
    }),
});

export const {
    useGetLabOrdersQuery,
    useGetLabDashboardStatsQuery,
    useGetLabResultsQuery,
    useApproveLabResultMutation,
    useGetResultsToApproveQuery,
    useGetApprovalDashboardStatsQuery,
    useRejectLabResultMutation,
} = labApiSlice;
