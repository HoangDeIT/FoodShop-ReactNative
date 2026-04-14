import AutoAddress from "@/components/address/auto.address";
import MapAddress from "@/components/address/map.address";
import SearchAddress from "@/components/address/search.address";
import { useCurrentApp } from "@/context/app.context";
import { clearSelectedItems, getSelectedItems, getShopIdFromItem } from "@/db/services/cartService";
import { createOrderApi, getProfileSeller } from "@/utils/customer.api";
import { eventBus } from "@/utils/eventBus";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Divider, SegmentedButtons, Text, TextInput, useTheme } from "react-native-paper";

export default function CheckoutScreen() {
    const theme = useTheme();
    const router = useRouter();
    const { appState } = useCurrentApp();

    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [method, setMethod] = useState("auto");

    // 🧭 Thông tin người nhận
    const [receiverName, setReceiverName] = useState("");
    const [receiverPhone, setReceiverPhone] = useState("");

    // 📍 Địa chỉ
    const [address, setAddress] = useState("");
    const [lat, setLat] = useState("");
    const [lng, setLng] = useState("");

    // 🚚 Ship info
    const [distance, setDistance] = useState<number | null>(null);
    const [shipCost, setShipCost] = useState<number | null>(null);

    // ⚙️ Hằng số tạm (hardcode)
    const SHIPPING_RATE = 4000; // đ/km (hardcode, sau này lấy từ server)
    const MAX_DISTANCE = 10; // km (hardcode)

    // 🧾 Load sản phẩm đã chọn
    useEffect(() => {
        (async () => {
            try {
                const selected = await getSelectedItems();
                setItems(selected);
            } catch (err: any) {
                console.error("❌ Lỗi khi load selected items:", err);
                setMessage(err.message);
            }
        })();
    }, []);

    // ✅ Tổng tiền sản phẩm
    const subtotal = items.reduce((sum, i) => sum + i.totalPrice, 0);

    // ✅ Load vị trí người dùng
    useEffect(() => {
        const loc = appState?.location;
        if (loc) {
            setAddress(loc.address ?? "");
            setLat(loc.latitude?.toString() ?? "");
            setLng(loc.longitude?.toString() ?? "");
        }
    }, []);

    // 🧮 Tính khoảng cách giữa 2 điểm (Haversine)
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371; // Bán kính Trái Đất (km)
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // ✅ Tính phí ship khi có vị trí
    const handleCalculateShipping = async () => {
        try {
            if (!lat || !lng || !items.length) return;

            const shopId = await getShopIdFromItem(items[0].id);
            const sellerRes = await getProfileSeller(shopId);
            const shop = sellerRes.data;

            if (!shop?.profile?.location) {
                Alert.alert("⚠️ Lỗi", "Không tìm thấy vị trí cửa hàng.");
                return;
            }
            const shopLocation = shop.profile.location as ILocation;
            const shopLat = shopLocation.latitude;
            const shopLng = shopLocation.longitude;

            const dist = calculateDistance(shopLat, shopLng, parseFloat(lat), parseFloat(lng));
            if (dist > MAX_DISTANCE) {
                Alert.alert("❌ Quá xa", "Khoảng cách giao hàng vượt quá 10km, vui lòng chọn cửa hàng gần hơn.");
                setDistance(null);
                setShipCost(null);
                return;
            }

            const cost = Math.round(dist * SHIPPING_RATE); // hardcode: a * distance
            setDistance(Number(dist.toFixed(2)));
            setShipCost(cost);
        } catch (err) {
            console.error("❌ Lỗi khi tính ship:", err);
        }
    };

    // 🔔 Tự tính lại phí ship khi đổi vị trí
    useEffect(() => {
        if (lat && lng) handleCalculateShipping();
    }, [lat, lng, items]);

    // ✅ Đặt hàng
    const handleCheckout = useCallback(async () => {
        if (!receiverName || !receiverPhone) {
            Alert.alert("⚠️ Thiếu thông tin", "Vui lòng nhập họ tên và số điện thoại.");
            return;
        }
        if (!lat || !lng || !address) {
            Alert.alert("⚠️ Thiếu địa chỉ", "Vui lòng chọn địa chỉ giao hàng.");
            return;
        }
        if (!shipCost || !distance) {
            Alert.alert("⚠️", "Không thể tính được phí ship, vui lòng kiểm tra lại địa chỉ.");
            return;
        }

        setLoading(true);
        const shopId = await getShopIdFromItem(items[0].id);

        try {
            const payload = {
                shopId,
                items: items.map((i) => ({
                    productId: i.productId,
                    quantity: i.quantity,
                    sizeId: i.sizeId ?? null,
                    toppingIds: i.toppingIds ?? [],
                })),
                location: {
                    latitude: parseFloat(lat),
                    longitude: parseFloat(lng),
                    address,
                },
                receiverName,
                receiverPhone,
                note: "",
            };

            const res = await createOrderApi(payload);
            if (!res?.error) {
                await clearSelectedItems();
                eventBus.emit("ORDER_UPDATED", { type: "created" });
                Alert.alert("🎉 Thành công", "Đặt hàng thành công!");
                router.replace("/(tabs)/order");
            } else {
                Alert.alert("⚠️ Thất bại", "Không thể tạo đơn hàng, vui lòng thử lại.");
            }
        } catch (err) {
            console.error("❌ Checkout error:", err);
            Alert.alert("❌ Lỗi", "Không thể đặt hàng lúc này.");
        } finally {
            setLoading(false);
        }
    }, [receiverName, receiverPhone, lat, lng, address, shipCost, distance, items, router]);
    useEffect(() => {
        const onSetCheckoutInfo = (payload: { receiverName?: string; receiverPhone?: string }) => {
            if (payload.receiverName) setReceiverName(payload.receiverName);
            if (payload.receiverPhone) setReceiverPhone(payload.receiverPhone);
        };
        const onSubmitOrder = async () => {
            try {
                await handleCheckout();
                eventBus.emit("ORDER_UPDATED", { type: "created" });
            } catch (err) {
                console.error("SUBMIT_ORDER error:", err);
            }
        };

        eventBus.on("SET_CHECKOUT_INFO", onSetCheckoutInfo);
        eventBus.on("SUBMIT_ORDER", onSubmitOrder);

        return () => {
            eventBus.off("SET_CHECKOUT_INFO", onSetCheckoutInfo);
            eventBus.off("SUBMIT_ORDER", onSubmitOrder);
        };
    }, [handleCheckout]);
    const total = subtotal + (shipCost || 0);

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                    Thông tin người nhận
                </Text>

                <TextInput
                    label="Họ và tên"
                    value={receiverName}
                    onChangeText={setReceiverName}
                    style={styles.input}
                    mode="outlined"
                />
                <TextInput
                    label="Số điện thoại"
                    value={receiverPhone}
                    onChangeText={setReceiverPhone}
                    keyboardType="phone-pad"
                    style={styles.input}
                    mode="outlined"
                />

                <Divider style={{ marginVertical: 10 }} />

                <Text variant="titleMedium" style={styles.sectionTitle}>
                    Sản phẩm đã chọn
                </Text>

                {items.map((item) => (
                    <Card key={item.id} style={styles.itemCard}>
                        <View style={styles.itemRow}>
                            <Image
                                source={{
                                    uri: `${process.env.EXPO_PUBLIC_API_URL}/public/images/products/${item.image}`,
                                }}
                                style={styles.image}
                            />
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontWeight: "bold" }}>{item.productName}</Text>
                                {item.sizeName ? <Text style={{ color: "#666" }}>Size: {item.sizeName}</Text> : null}
                                {item.toppingNames?.length ? (
                                    <Text style={{ color: "#666" }}>Topping: {item.toppingNames.join(", ")}</Text>
                                ) : null}
                                <Text style={{ color: "#ff6d00", fontWeight: "bold", marginTop: 2 }}>
                                    {item.totalPrice.toLocaleString("vi-VN")}đ × {item.quantity}
                                </Text>
                            </View>
                        </View>
                    </Card>
                ))}

                <Divider style={{ marginVertical: 16 }} />

                <Text variant="titleMedium" style={styles.sectionTitle}>
                    Địa chỉ giao hàng
                </Text>
                <SegmentedButtons
                    value={method}
                    onValueChange={setMethod}
                    buttons={[
                        { value: "auto", label: "Tự động", icon: "crosshairs-gps" },
                        { value: "map", label: "Bản đồ", icon: "map-marker" },
                        { value: "search", label: "Tìm kiếm", icon: "magnify" },
                    ]}
                    style={{ marginBottom: 12 }}
                />
                {method === "auto" && (
                    <AutoAddress
                        address={address}
                        setAddress={setAddress}
                        lat={lat}
                        lng={lng}
                        setLat={setLat}
                        setLng={setLng}
                    />
                )}
                {method === "map" && (
                    <MapAddress
                        address={address}
                        setAddress={setAddress}
                        lat={lat}
                        lng={lng}
                        setLat={setLat}
                        setLng={setLng}
                    />
                )}
                {method === "search" && (
                    <SearchAddress
                        address={address}
                        setAddress={setAddress}
                        lat={lat}
                        lng={lng}
                        setLat={setLat}
                        setLng={setLng}
                    />
                )}

                {/* 🚚 Thông tin vận chuyển */}
                {distance && shipCost ? (
                    <View style={styles.shippingInfo}>
                        <Text>Khoảng cách: {distance} km</Text>
                        <Text>Phí ship: {shipCost.toLocaleString("vi-VN")}đ</Text>
                    </View>
                ) : null}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, { backgroundColor: theme.colors.background }]}>
                <View style={{ flex: 1 }}>
                    <Text>Tổng cộng</Text>
                    <Text style={{ color: "#ff6d00", fontWeight: "bold", fontSize: 18 }}>
                        {total.toLocaleString("vi-VN")}đ
                    </Text>
                </View>
                <Button
                    mode="contained"
                    onPress={handleCheckout}
                    disabled={loading || !items.length}
                    loading={loading}
                    style={styles.orderButton}
                >
                    Đặt hàng
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    scroll: {
        padding: 16,
        gap: 10,
    },
    sectionTitle: {
        fontWeight: "bold",
        marginBottom: 8,
    },
    itemCard: {
        padding: 10,
        borderRadius: 10,
        marginBottom: 8,
    },
    itemRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    image: {
        width: 70,
        height: 70,
        borderRadius: 8,
    },
    footer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderTopWidth: 0.5,
        borderTopColor: "#ddd",
    },
    orderButton: {
        borderRadius: 12,
        backgroundColor: "#ff6d00",
        paddingVertical: 6,
    },
    input: {
        marginBottom: 10,
    },
    shippingInfo: {
        marginTop: 10,
        backgroundColor: "#fafafa",
        padding: 12,
        borderRadius: 8,
    },
});
