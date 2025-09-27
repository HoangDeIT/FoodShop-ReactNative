import axios from "@/utils/axios.customize";

export const loginApi = async (username: string, password: string) => {
    const url = "/api/v1/auth/login";
    return await axios.post<IBackendRes<IUserLogin>>(url, { username, password });
}
export const getAccountAPI = async () => {
    const url = `/api/v1/auth/get-profile`;
    return await axios.get<IBackendRes<IProfile>>(url)
}