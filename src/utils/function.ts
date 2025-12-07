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
const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Bán kính Trái Đất (km)
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
