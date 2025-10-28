import { useMemo, useState } from "react";
import { Image, ScrollView, View } from "react-native";
import {
    Button,
    Card,
    Checkbox,
    Divider,
    IconButton,
    Text,
} from "react-native-paper";

interface ICartItem {
    _id: string;
    productId: string;
    productName: string;
    image: string;
    basePrice: number;
    quantity: number;
    totalPrice: number;
    size?: { id: string; name: string; price: number };
    toppings?: { id: string; name: string; price: number }[];
    shop: { _id: string; name: string; avatar: string };
}

// 🔧 Data mẫu
const MOCK_CART: ICartItem[] = [
    {
        _id: "a1-small",
        productId: "a1",
        productName: "Cơm gà xối mỡ",
        image: "https://via.placeholder.com/100",
        basePrice: 45000,
        quantity: 1,
        totalPrice: 45000,
        size: { id: "small", name: "Nhỏ", price: 0 },
        toppings: [],
        shop: { _id: "s1", name: "Cơm Gà A1", avatar: "https://via.placeholder.com/50" },
    },
    {
        _id: "a1-large-egg",
        productId: "a1",
        productName: "Cơm gà xối mỡ",
        image: "https://via.placeholder.com/100",
        basePrice: 45000,
        quantity: 1,
        totalPrice: 60000,
        size: { id: "large", name: "Lớn", price: 5000 },
        toppings: [{ id: "egg", name: "Trứng ốp la", price: 10000 }],
        shop: { _id: "s1", name: "Cơm Gà A1", avatar: "https://via.placeholder.com/50" },
    },
    {
        _id: "b1",
        productId: "b1",
        productName: "Trà sữa trân châu",
        image: "https://via.placeholder.com/100",
        basePrice: 25000,
        quantity: 2,
        totalPrice: 50000,
        shop: { _id: "s2", name: "Trà sữa Doraemon", avatar: "https://via.placeholder.com/50" },
    },
];

export default function CartScreen() {
    const [cart, setCart] = useState<ICartItem[]>(MOCK_CART);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [activeShop, setActiveShop] = useState<string | null>(null);

    // ✅ Gom cart theo shop
    const grouped = useMemo(() => {
        const result: Record<string, ICartItem[]> = {};
        cart.forEach((item) => {
            if (!result[item.shop._id]) result[item.shop._id] = [];
            result[item.shop._id].push(item);
        });
        return result;
    }, [cart]);

    // ✅ Xử lý chọn món
    const toggleSelect = (id: string, shopId: string) => {
        // chỉ cho phép chọn 1 shop duy nhất
        if (activeShop && activeShop !== shopId) {
            return alert("Bạn chỉ có thể chọn món từ 1 cửa hàng mỗi lần đặt hàng!");
        }
        if (!activeShop) setActiveShop(shopId);

        setSelectedItems((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    // ✅ Tăng giảm số lượng
    const updateQuantity = (id: string, delta: number) => {
        setCart((prev) =>
            prev.map((item) =>
                item._id === id
                    ? { ...item, quantity: Math.max(1, item.quantity + delta) }
                    : item
            )
        );
    };

    // ✅ Xóa món
    const removeItem = (id: string) => {
        setCart((prev) => prev.filter((item) => item._id !== id));
        setSelectedItems((prev) => prev.filter((x) => x !== id));
    };

    // ✅ Tổng tiền tạm tính
    const total = useMemo(() => {
        return cart
            .filter((item) => selectedItems.includes(item._id))
            .reduce((sum, item) => sum + item.totalPrice * item.quantity, 0);
    }, [cart, selectedItems]);

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <ScrollView contentContainerStyle={{ padding: 10, paddingBottom: 100 }}>
                {Object.entries(grouped).map(([shopId, items]) => (
                    <View key={shopId} style={{ marginBottom: 16 }}>
                        {/* Header cửa hàng */}
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginBottom: 6,
                            }}
                        >
                            <Image
                                source={{ uri: items[0].shop.avatar }}
                                style={{ width: 40, height: 40, borderRadius: 20, marginRight: 8 }}
                            />
                            <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                                {items[0].shop.name}
                            </Text>
                        </View>

                        {items.map((item) => (
                            <Card
                                key={item._id}
                                style={{
                                    marginBottom: 10,
                                    borderRadius: 10,
                                    elevation: 2,
                                    padding: 8,
                                }}
                            >
                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    {/* Checkbox */}
                                    <Checkbox
                                        status={selectedItems.includes(item._id) ? "checked" : "unchecked"}
                                        onPress={() => toggleSelect(item._id, item.shop._id)}
                                    />

                                    {/* Ảnh */}
                                    <Image
                                        source={{ uri: item.image }}
                                        style={{ width: 70, height: 70, borderRadius: 8, marginRight: 8 }}
                                    />

                                    {/* Thông tin */}
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontWeight: "bold" }}>{item.productName}</Text>
                                        {item.size && (
                                            <Text style={{ color: "#555", fontSize: 13 }}>
                                                Size: {item.size.name}
                                            </Text>
                                        )}
                                        {item.toppings && item.toppings.length > 0 && (
                                            <Text style={{ color: "#555", fontSize: 13 }}>
                                                Topping: {item.toppings.map((t) => t.name).join(", ")}
                                            </Text>
                                        )}
                                        <Text style={{ color: "#ff6d00", fontWeight: "bold", marginTop: 2 }}>
                                            {item.totalPrice.toLocaleString("vi-VN")}đ
                                        </Text>
                                    </View>

                                    {/* Tăng/giảm/xóa */}
                                    <View style={{ alignItems: "center" }}>
                                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                                            <IconButton
                                                icon="minus"
                                                size={20}
                                                onPress={() => updateQuantity(item._id, -1)}
                                            />
                                            <Text>{item.quantity}</Text>
                                            <IconButton
                                                icon="plus"
                                                size={20}
                                                onPress={() => updateQuantity(item._id, 1)}
                                            />
                                        </View>
                                        <IconButton
                                            icon="delete"
                                            size={20}
                                            iconColor="#ff3b30"
                                            onPress={() => removeItem(item._id)}
                                        />
                                    </View>
                                </View>
                            </Card>
                        ))}

                        <Divider bold style={{ marginVertical: 6 }} />
                    </View>
                ))}
            </ScrollView>

            {/* Thanh footer */}
            <View
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 12,
                    borderTopWidth: 1,
                    borderColor: "#eee",
                    backgroundColor: "#fff",
                }}
            >
                <View>
                    <Text style={{ color: "#555" }}>Tổng cộng</Text>
                    <Text style={{ fontWeight: "bold", fontSize: 18, color: "#ff6d00" }}>
                        {total.toLocaleString("vi-VN")}đ
                    </Text>
                </View>
                <Button
                    mode="contained"
                    onPress={() => console.log("Thanh toán")}
                    disabled={selectedItems.length === 0}
                >
                    Thanh toán ({selectedItems.length})
                </Button>
            </View>
        </View>
    );
}
