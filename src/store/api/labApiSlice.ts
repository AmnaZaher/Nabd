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
        getLabResults: builder.query<LabResult[], void>({
            query: () => '/Lab/GetResults',
            providesTags: ['LabResult'],
        }),
        approveLabResult: builder.mutation<void, number | string>({
            query: (id) => ({
                url: `/Lab/Approve?finalResul=${id}`,
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
} = labApiSlice;
