export { };

declare global {
    interface IBackendRes<T> {
        error?: string | string[];
        message: string
        statusCode: number | string;
        data?: T;
    }
    type IProfile = {
        name: string;
        email: string;
        role: "admin" | "seller" | "customer";
    };

    interface IUserLogin extends IProfile {
        access_token: string;
    }
    interface IUserR {
        avatar?: string;
        _id: string;
        name: string;
        email: string;
        role: "admin" | "seller" | "customer"; // nếu role chỉ có 3 giá trị này
        createdBy: string | null;
        isDeleted: boolean;
        deletedAt: string | null;
        createdAt: string;
        updatedAt: string;
        __v: number;
        OTP?: string;
        OTPExpired?: string;
        status: "active" | "inactive";
    }
}
