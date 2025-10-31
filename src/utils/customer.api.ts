import axios from "@/utils/axios.customize";

export const getAllCategories = async () => {
    const url = "/api/v1/categories/all";
    return await axios.get<IBackendRes<ICategory[]>>(url);
};

export const getSellers = async (radius: number, current: number, pageSize: number, categoryId?: string) => {
    let url = "";
    if (!categoryId) url = `/api/v1/users/sellers/nearby?current=${current}&pageSize=${pageSize}&radius=${radius}&categoryId=${categoryId}`;
    else url = `/api/v1/users/sellers/nearby?current=${current}&pageSize=${pageSize}&radius=${radius}`;
    return await axios.get<IBackendRes<IModelPaginate<ISellerNearby>>>(url);
};
export const getProfileSeller = async (seller: string) => {
    const url = `/api/v1/users/${seller}`;
    return await axios.get<IBackendRes<IUserR>>(url);
};

export const getProductById = async (productId: string) => {
    const url = `/api/v1/products/${productId}`;
    return await axios.get<IBackendRes<IProductR>>(url);
}


export const getProducts = async (current: number, pageSize: number, seller: string) => {
    const url = `/api/v1/products?seller=${seller}&current=${current}&pageSize=${pageSize}`;
    return await axios.get<IBackendRes<IModelPaginate<IProductR>>>(url);
};

export const syncCartValid = async (payload: any) => {
    const url = `/api/v1/cart/validate`;
    return await axios.post<IBackendRes<ICartValidatedResponse>>(url, payload);
};

export const createOrderApi = async (payload: ICreateOrder) => {
    const url = `/api/v1/orders`;
    return await axios.post<IBackendRes<IOrder>>(url, payload);
}

export const getOrdersApi = async (current: number, pageSize: number, status?: string) => {
    const url = `/api/v1/orders/customer?current=${current}&pageSize=${pageSize}&status=${status || ""}`;
    return await axios.get<IBackendRes<IModelPaginate<IOrderR>>>(url);
}

export const postReviewApi = async (data: {
    product: string;
    order: string;
    rating: number;
    comment: string;
    images?: string[];
}) => {
    const url = `/api/v1/reviews`;
    return await axios.post<IBackendRes<IReviewR[]>>(url, data);
};

export const postReplyApi = async (reviewId: string, data: { comment: string }) => {
    const url = `/api/v1/reviews/${reviewId}/reply`;
    return await axios.post<IBackendRes<IReviewR>>(url, data);
};


export const getReviewsApi = async (productId: string) => {
    const url = `/api/v1/reviews/product/${productId}`;
    return await axios.get<IBackendRes<IReviewR[]>>(url);
};
interface RNFile {
    uri: string;
    name: string;
    type: string;
}

export const uploadFile = async (files: RNFile[], folder: string) => {
    try {
        const formData = new FormData();

        files.forEach((file) => {
            // 👇 Trong React Native, file phải append dưới dạng object có uri, name, type
            formData.append("filesUpload", {
                uri: file.uri,
                name: file.name,
                type: file.type,
            } as any);
        });

        const res = await axios.post<IBackendRes<{ fileName: string[] }>>(
            `/api/v1/files/upload-multiple`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                    folder_type: folder,
                },
            }
        );

        return res;
    } catch (error: any) {
        console.error("❌ Lỗi upload file:", error);
        throw error;
    }
};
export const checkCanCommentApi = async (productId: string) => {
    const url = `/api/v1/reviews/check/${productId}`;
    return await axios.get<IBackendRes<{
        canComment: boolean;
        totalPurchased: number;
        totalReviewed: number;
        remaining: number;
    }>>(url);
};

export const uploadFilesApi = async (files: File[], folder: string) => {
    const url = `/api/v1/files/upload-multiple`;
    const formData = new FormData();
    files.forEach((file) => {
        formData.append("filesUpload", file); // backend nhận nhiều file cùng field name
    });
    return await axios.post<IBackendRes<{ fileNames: string[] }>>(url, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
            folder_type: folder,
        },
    });
};
export const deleteReviewApi = async (reviewId: string) => {
    const url = `/api/v1/reviews/${reviewId}`;
    return await axios.delete<IBackendRes<IReviewR>>(url);
};
export const deleteReplyApi = async (reviewId: string, replyId: string) => {
    const url = `/api/v1/reviews/${reviewId}/replies/${replyId}`;
    return await axios.delete<IBackendRes<IReviewR>>(url);
};