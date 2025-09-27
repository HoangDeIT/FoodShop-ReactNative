export { };

declare global {
    interface IBackendRes<T> {
        error?: string | string[];
        message: string | string[];
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
}
