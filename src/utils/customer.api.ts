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



export const getProducts = async (current: number, pageSize: number, seller: string) => {
    const url = `/api/v1/products?seller=${seller}&current=${current}&pageSize=${pageSize}`;
    return await axios.get<IBackendRes<IModelPaginate<IProductR>>>(url);
};

