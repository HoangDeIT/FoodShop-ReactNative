import axios from "@/utils/axios.customize";



export const voicePlan = async (data: IVoiceRequest) => {
    const url = "/api/v1/voice";
    return await axios.post<IBackendRes<IVoicePlanResponse>>(url, data);
};

export const voiceExecute = async (data: IVoiceExecuteRequest) => {
    const url = "/api/v1/voice/execute";
    return await axios.post<IBackendRes<IVoiceExecuteResponse>>(url, data);
};