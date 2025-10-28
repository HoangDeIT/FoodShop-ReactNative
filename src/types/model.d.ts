export { };

declare global {
    interface IBackendRes<T> {
        error?: string | string[];
        message: string
        statusCode: number | string;
        data?: T;
    }
    interface IModelPaginate<T> {
        meta: IMeta;
        result: T[]
    }
    interface IMeta {
        current: number;
        pageSize: number;
        pages: number;
        total: number;
    }
    type IProfile = {
        name: string;
        email: string;
        role: "admin" | "seller" | "customer";
    };
    interface ILocation {
        latitude: number;
        longitude: number;
        address?: string;
    }

    interface IUserLogin extends IUserR {
        access_token: string;
        location: ILocation;
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
    export interface IUpdateLocationReq {
        latitude: number;
        longitude: number;
        address?: string;
    }

    export interface IUserRef {
        _id: Types.ObjectId | string;
        email: string;
    }

    export interface ICategory {
        _id: Types.ObjectId | string;
        name: string;
        description?: string;
        image?: string;
        icon?: string;
        createdBy?: IUserRef;
        updatedBy?: IUserRef;
        isDeleted: boolean;
        deletedAt?: Date | null;
        createdAt: Date;
        updatedAt: Date;
        __v?: number;
    }

    export interface IUserMini {
        _id: string;
        name: string;
        email: string;
        role: string;
        avatar?: string;
        description?: string;
        location: string; // ObjectId dưới dạng string
    }

    export interface ISellerNearby {
        address: string;
        user: IUserMini;
        distance: number; // đơn vị: km
    }
    interface IProductR {
        _id: string;

        // 🧋 Thông tin cơ bản
        name: string;
        description?: string;
        image?: string;

        // 💰 Giá cơ bản
        basePrice: number;

        // 📦 Phân loại
        category: string | ICategoryR; // nếu populate thì là object
        seller: string | IUserR;        // nếu populate thì là object

        // 🧩 Biến thể sản phẩm
        sizes?: IProductSize[];
        toppings?: IProductTopping[];

        // ⚙️ Trạng thái
        inStock?: boolean;
        sold?: number;
        isDeleted?: boolean;
        deletedAt?: string | null;

        // 📅 Metadata
        createdBy?: {
            _id: string;
            email: string;
        } | null;
        createdAt?: string;
        updatedAt?: string;
        __v?: number;
    }

    // ✅ Sub-types
    interface IProductSize {
        _id: string;
        name: string;
        price: number;
        isDefault?: boolean;
        isDeleted?: boolean;
        deletedAt?: string | null;
    }

    interface IProductTopping {
        _id: string;
        name: string;
        price: number;
        isDeleted?: boolean;
        deletedAt?: string | null;
    }
}
