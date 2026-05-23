import { apiSlice } from './apiSlice';
import type { LabResult } from '../../types/labs.types';

export const labApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getLabOrders: builder.query<LabResult[], void>({
            query: () => '/Lab/LabOrders',
            providesTags: ['LabOrder'],
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
    useGetLabResultsQuery,
    useApproveLabResultMutation,
} = labApiSlice;
