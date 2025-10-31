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
        location: ILocation | string | null;
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
        seller: string | IUserR;
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
    interface ICartItemValidated {
        productId: string;
        productName: string;
        basePrice: number;
        sizePrice: number;
        toppingPrice: number;
        quantity: number;
        totalPrice: number;
        image?: string;

        sizeId?: string;
        sizeName?: string;

        toppingIds?: string[];
        toppingNames?: string[];
    }

    // 🏪 Một cửa hàng (shop) trong giỏ hàng
    interface IShopCartValidated {
        shopId: string;
        shopName: string;
        // avatar?: string;
        totalPrice: number;
        items: ICartItemValidated[];
    }

    // 🛒 Toàn bộ giỏ hàng sau khi validate
    interface ICartValidatedResponse {
        shopCarts: IShopCartValidated[];
        grandTotal: number;
    }
    export interface ICreateOrder {
        shopId: string;
        items: OrderItem[];
        receiverName: string;
        receiverPhone: string;
        location: OrderLocation;
        note?: string;
    }

    export interface IOrderItem {
        productId: string;
        quantity: number;
        sizeId?: string;              // optional — vì có thể sản phẩm không có size
        toppingIds?: string[];        // optional — vì có thể không có topping
    }

    export interface IOrderLocation {
        latitude: number;
        longitude: number;
        address: string;
    }
    export interface IOrder {
        _id: string;
        customer: string;
        shop: string;
        items: OrderItem[];
        totalPrice: number;
        orderStatus: "pending" | "confirmed" | "delivering" | "completed" | "cancelled"; // có thể mở rộng thêm trạng thái khác
        deliveryAddress: string;
        receiverName: string;
        receiverPhone: string;
        distance: number;
        shippingCost: number;
        note?: string;
        isDeleted: boolean;
        deletedAt: string | null;
        orderDate: string;      // ISO date string
        createdAt: string;      // ISO date string
        updatedAt: string;      // ISO date string
        __v: number;
    }

    export interface IOrderItem {
        _id: string;
        product: string;
        productName: string;
        basePrice: number;
        sizeId?: string;
        sizeName?: string;
        toppingIds?: string[];
        toppingNames?: string[];
        quantity: number;
        totalPrice: number;
        image?: string;
        isDeleted: boolean;
        deletedAt: string | null;
    }
    interface IOrderR {
        _id: string;
        customer: IUserR | null; // Có thể null nếu populate bị thiếu
        shop: IUserR; // hoặc IUserMini nếu chỉ trả về name/email
        items: IOrderItemR[]; // danh sách item trong đơn hàng
        totalPrice: number;
        orderStatus: "pending" | "confirmed" | "preparing" | "delivering" | "completed" | "cancelled";
        deliveryAddress: ILocationR;
        receiverName: string;
        receiverPhone: string;
        distance: number;
        shippingCost: number;
        note?: string;
        isDeleted: boolean;
        deletedAt: string | null;
        orderDate: string;
        createdAt: string;
        updatedAt: string;
        __v: number;
    }

    /** 🧩 Một sản phẩm trong đơn hàng */
    interface IOrderItemR {
        _id: string;
        product: string | IProductR;
        productName: string;
        basePrice: number;
        sizeId?: string;
        sizeName?: string;
        toppingIds?: string[];
        toppingNames?: string[];
        quantity: number;
        totalPrice: number;
        image?: string;
        isDeleted: boolean;
        deletedAt: string | null;
    }

    /** 📍 Địa chỉ giao hàng (được populate từ Location) */
    interface ILocationR {
        _id: string;
        latitude: number;
        longitude: number;
        address: string;
        coordinates: [number, number];
        isDeleted: boolean;
        deletedAt: string | null;
        createdAt: string;
        updatedAt: string;
        __v: number;

    }
    export interface IReviewR {
        _id: string;
        user: IUserR | string; // người viết review
        product: IProductR | string;
        rating: number; // 1–5 sao
        comment: string;
        images: string[];
        replies: IReviewReplyR[];
        isDeleted: boolean;
        createdAt: string;
        updatedAt: string;
    }
}
