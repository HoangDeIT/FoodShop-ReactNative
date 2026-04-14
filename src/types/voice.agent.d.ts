interface IAction {
    id?: string;
    type: string;
    payload?: Record<string, any>;
    delay?: number;

    status?: "pending" | "success" | "failed";
    error?: string;
}
interface IVoicePlanResponse {
    message: string;
    feActions: IAction[];
    beActions: IAction[];
}
interface IVoiceExecuteRequest {
    message: string;
    currentPage: string;
    context?: Record<string, any>;
    feActions: IAction[];
    beActions: IAction[];
}

interface IVoiceExecuteResponse {
    message: string;
    actions: IAction[];
}
interface IVoiceRequest {
    message: string;
    currentPage: string;
    context?: Record<string, any>;
}