import axios from "@/utils/axios.customize";

export const loginApi = async (username: string, password: string) => {
    const url = "/api/v1/auth/login";
    return await axios.post<IBackendRes<IUserLogin>>(url, { username, password });
}
export const getAccountAPI = async () => {
    const url = `/api/v1/auth/get-profile`;
    return await axios.get<IBackendRes<IProfile>>(url)
}

export const registerApi = async (data: {
    name: string;
    email: string;
    password: string;
    role: string;
}) => {
    const url = "/api/v1/auth/register";
    return await axios.post<IBackendRes<IUserR>>(url, data);
};


export const forgotPasswordApi = async (email: string) => {
    const url = "/api/v1/auth/forget-password";
    return await axios.post<IBackendRes<IUserR>>(url, { email });
};

export const resetPasswordApi = async (data: {
    newPassword: string;
    otp: string;
    email: string;
}) => {
    const url = "/api/v1/auth/reset-password";
    return await axios.post<IBackendRes<IUserR>>(url, data);
};


export const verifyOtpApi = async (data: { email: string; otp: string }) => {
    const url = "/api/v1/auth/verify-otp";
    return await axios.post<IBackendRes<IUserR>>(url, data);
};


export const checkUserApi = async (data: { email: string; password: string }) => {
    const url = "/api/v1/auth/valid-user";
    return await axios.post<IBackendRes<any>>(url, data);
};

