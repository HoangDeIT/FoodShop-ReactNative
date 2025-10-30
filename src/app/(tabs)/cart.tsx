import {
    addToCart,
    buildCartPayload,
    clearCart,
    getCartGrouped,
    getSelectedItems,
    removeItem,
    toggleItemSelect,
    toggleShopSelect,
    updateQuantity
} from "@/db/services/cartService"; // <-- Import service SQLite
import { syncCartValid } from "@/utils/customer.api";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Image, RefreshControl, ScrollView, View } from "react-native";
import {
    Button,
    Card,
    Checkbox,
    Divider,
    IconButton,
    Text,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

interface ICartGrouped {
    [shopId: string]: {
        shopName: string;
        total: number;
        selected: boolean;
        items: ICartItem[];
    };
}

interface ICartItem {
    id: number;
    productId: string;
    productName: string;
    image?: string;
    basePrice: number;
    quantity: number;
    totalPrice: number;
    sizeName?: string;
    toppingNames?: string[];
    shopRef: number;
    selected: boolean;
}

export default function CartScreen() {
    const router = useRouter();
    const [cartGrouped, setCartGrouped] = useState<ICartGrouped>({});
    const [refreshing, setRefreshing] = useState(false);

    // ✅ Load dữ liệu từ SQLite
    const loadCart = async () => {
        setRefreshing(true);
        //  await syncCartDB(); // đồng bộ với server
        const data = await getCartGrouped();
        setCartGrouped(data);
        setRefreshing(false);
    };

    useEffect(() => {
        loadCart();
    }, []);


    // ✅ Cập nhật số lượng
    const onChangeQuantity = async (itemId: number, delta: number) => {
        await updateQuantity(itemId, delta); // update DB
        await loadCart(); // reload
    };

    // ✅ Xoá sản phẩm
    const onRemoveItem = async (itemId: number) => {
        await removeItem(itemId);
        await loadCart();
    };

    // ✅ Tổng tiền tạm tính (chỉ item selected)
    const total = Object.values(cartGrouped).reduce((sum, shop) => {
        const shopSelectedItems = shop.items.filter((i) => i.selected);
        const shopTotal = shopSelectedItems.reduce(
            (acc, i) => acc + i.totalPrice * i.quantity,
            0
        );
        return sum + shopTotal;
    }, 0);

    // ✅ Đặt hàng (lấy item selected)
    const onCheckout = async () => {
        const selected = await getSelectedItems();
        if (selected.length === 0) return alert("Chưa chọn món nào 😅");
        router.push("/(stack)/checkout");
        console.log("🛍 Order items:", selected);


        await loadCart();
    };
    const syncCartDB = async () => {
        try {
            const payload = await buildCartPayload();

            // 1️⃣ Gửi lên server
            const res = await syncCartValid(payload);
            const newCart = res.data; // tuỳ response interceptor

            if (!newCart?.shopCarts) return;

            // 2️⃣ Nếu cart khác bản local → hỏi người dùng
            const local = await buildCartPayload();

            const localStr = JSON.stringify(local.shopCarts);
            const serverStr = JSON.stringify(newCart.shopCarts);
            if (localStr !== serverStr) {
                Alert.alert(
                    "Giỏ hàng đã thay đổi",
                    "Một số sản phẩm hoặc cửa hàng đã thay đổi, bạn có muốn cập nhật giỏ hàng mới không?",
                    [
                        { text: "Huỷ", style: "cancel" },
                        {
                            text: "Cập nhật",
                            onPress: async () => {
                                await clearCart();

                                // ✅ Ghi lại cart mới vào local DB
                                for (const shop of newCart.shopCarts) {
                                    for (const item of shop.items) {
                                        await addToCart({
                                            shopId: shop.shopId,
                                            shopName: shop.shopName,
                                            productId: item.productId,
                                            productName: item.productName,
                                            basePrice: item.basePrice,
                                            sizePrice: item.sizePrice || 0,
                                            toppingPrice: item.toppingPrice || 0,
                                            quantity: item.quantity,
                                            sizeId: item.sizeId!,
                                            sizeName: item.sizeName!,
                                            toppingIds: item.toppingIds!,
                                            toppingNames: item.toppingNames!,
                                            image: item.image,
                                        });
                                    }
                                }
                                await loadCart();
                                Alert.alert("✅ Đã cập nhật giỏ hàng thành công!");
                            },
                        },
                    ]
                );
            } else {
                console.log("🟢 Cart local đã khớp với server, không cần sync.");
            }
        } catch (error: any) {
            console.error("❌ Sync cart error:", error?.response?.data || error.message);
        }
    };
    // ✅ Toggle chọn món
    const onToggleSelect = async (itemId: number) => {
        try {
            // Service lo toàn bộ logic (gồm cả unselect shop khác)
            await toggleItemSelect(itemId, true); // toggleItemSelect tự xử lý toggle
            await loadCart();
        } catch (err: any) {
            Alert.alert("Lỗi", err.message || "Không thể chọn sản phẩm");
        }
    };

    // ✅ Toggle chọn shop
    const onToggleShopSelect = async (shopId: string, currentSelected: boolean) => {
        try {
            // currentSelected = shop.selected
            await toggleShopSelect(shopId, !currentSelected);
            await loadCart();
        } catch (err: any) {
            Alert.alert("Lỗi", err.message || "Không thể chọn cửa hàng");
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
            <ScrollView
                contentContainerStyle={{ padding: 10, paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={async () => {
                            await loadCart();
                            await syncCartDB();
                        }}
                        colors={["#ff6d00"]}
                    />
                }
            >
                {Object.entries(cartGrouped).map(([shopId, shop]) => (
                    <View key={shopId} style={{ marginBottom: 16 }}>
                        {/* Header cửa hàng */}
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginBottom: 6,
                            }}
                        >
                            <Checkbox
                                status={shop.selected ? "checked" : "unchecked"}
                                onPress={() => onToggleShopSelect(shopId, shop.selected)} // toggleShopSelect(shopId)}
                            />
                            <Image
                                source={{
                                    uri: shop.items[0]?.image || "https://via.placeholder.com/50",
                                }}
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    marginRight: 8,
                                }}
                            />
                            <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                                {shop.shopName}
                            </Text>
                        </View>

                        {/* Danh sách sản phẩm */}
                        {shop.items.map((item) => (
                            <Card
                                key={item.id}
                                style={{
                                    marginBottom: 10,
                                    borderRadius: 10,
                                    elevation: 2,
                                    padding: 8,
                                }}
                            >
                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    <Checkbox
                                        status={item.selected ? "checked" : "unchecked"}
                                        onPress={() => onToggleSelect(item.id)}
                                    />

                                    <Image
                                        source={{
                                            uri: `${process.env.EXPO_PUBLIC_API_URL}/public/images/products/${item.image}`,
                                        }}
                                        style={{
                                            width: 70,
                                            height: 70,
                                            borderRadius: 8,
                                            marginRight: 8,
                                        }}
                                    />

                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontWeight: "bold" }}>{item.productName}</Text>
                                        {item.sizeName && (
                                            <Text style={{ color: "#555", fontSize: 13 }}>
                                                Size: {item.sizeName}
                                            </Text>
                                        )}
                                        {item.toppingNames && item.toppingNames.length > 0 && (
                                            <Text style={{ color: "#555", fontSize: 13 }}>
                                                Topping: {item.toppingNames.join(", ")}
                                            </Text>
                                        )}
                                        <Text
                                            style={{
                                                color: "#ff6d00",
                                                fontWeight: "bold",
                                                marginTop: 2,
                                            }}
                                        >
                                            {item.totalPrice.toLocaleString("vi-VN")}đ
                                        </Text>
                                    </View>

                                    <View style={{ alignItems: "center" }}>
                                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                                            <IconButton
                                                icon="minus"
                                                size={20}
                                                onPress={() => onChangeQuantity(item.id, -1)}
                                            />
                                            <Text>{item.quantity}</Text>
                                            <IconButton
                                                icon="plus"
                                                size={20}
                                                onPress={() => onChangeQuantity(item.id, 1)}
                                            />
                                        </View>
                                        <IconButton
                                            icon="delete"
                                            size={20}
                                            iconColor="#ff3b30"
                                            onPress={() => onRemoveItem(item.id)}
                                        />
                                    </View>
                                </View>
                            </Card>
                        ))}

                        <Divider bold style={{ marginVertical: 6 }} />
                    </View>
                ))}
            </ScrollView>

            {/* Footer */}
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
                    <Text
                        style={{
                            fontWeight: "bold",
                            fontSize: 18,
                            color: "#ff6d00",
                        }}
                    >
                        {total.toLocaleString("vi-VN")}đ
                    </Text>
                </View>
                <Button mode="contained" onPress={onCheckout} disabled={total === 0}>
                    Thanh toán
                </Button>
            </View>
        </SafeAreaView>
    );
}
