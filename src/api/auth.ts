import { fetchApi } from './config';

export const login = async (username: string, password: string) => {
    return await fetchApi('/Account/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    });
};

export const forgetPassword = async (email: string) => {
    return await fetchApi('/Account/forget-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
    });
};

export const resetPassword = async (
    email: string,
    otp: string,
    newPassword: string,
    confirmPassword: string
) => {
    return await fetchApi('/Account/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, otp, newPassword, confirmPassword }),
    });
};

export const logout = async (refreshToken: string) => {
    return await fetchApi(`/Account/logout?RefreshToken=${refreshToken}`, {
        method: 'POST'
    });
};

export const registerPatient = async (payload: any) => {
    return await fetchApi('/Account/NewPatient', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
};

export const registerStaff = async (formData: FormData) => {
    return await fetchApi('/Account/NewStaff', {
        method: 'POST',
        body: formData,
    });
};

export const changePassword = async (formData: FormData) => {
    return await fetchApi('/Account/ChangePasswrod', {
        method: 'PATCH',
        body: formData,
    });
};
