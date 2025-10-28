export interface IShop {
    _id: string;
    name: string;
    image: string;
    // rating: string;
    distance: string;
    time: string;
}
export const convertToShops = (sellers: ISellerNearby[]): IShop[] => {
    return sellers.map((s) => {
        const { user, distance } = s;

        // Giả lập thời gian giao hàng: 1 km ≈ 3 phút
        const minutes = Math.ceil(distance * 3);

        return {
            _id: user._id,
            name: user.name,
            image: user.avatar || "default-shop.jpg",
            distance: `${distance.toFixed(1)} km`,
            time: `${minutes} phút`,
        };
    });
};
