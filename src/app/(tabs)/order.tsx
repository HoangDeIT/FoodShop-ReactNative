import { getOrdersApi } from "@/utils/customer.api";
import { MaterialIcons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    LayoutAnimation,
    Platform,
    ScrollView,
    TouchableOpacity,
    UIManager,
    View,
} from "react-native";
import { RefreshControl } from "react-native-gesture-handler";
import { Button, Card, Chip, Divider, Text } from "react-native-paper";

// ⚙️ Cho phép animation mượt trên Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const statusTags = ["pending", "confirmed", "preparing", "delivering", "completed", "cancelled"];

export default function OrderScreen() {
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState("pending");
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
    const [orders, setOrders] = useState<IOrderR[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const LIMIT = 5; // mỗi lần tải 5 đơn

    /** 🧾 Gọi API */
    const fetchOrders = useCallback(async (reset = false) => {
        try {
            const targetPage = reset ? 1 : page;
            const res = await getOrdersApi(targetPage, LIMIT, selectedStatus);
            if (!res.error && res.data) {
                const newOrders = res.data.result;
                const total = res.data.meta.total;
                const totalLoaded = reset
                    ? newOrders.length
                    : orders.length + newOrders.length;

                // Cập nhật danh sách
                setOrders((prev) => (reset ? newOrders : [...prev, ...newOrders]));
                setPage(targetPage + 1);
                setHasMore(totalLoaded < total);
            } else {
                console.error("❌ Lỗi khi lấy đơn hàng:", res);
            }
        } catch (err) {
            console.error("❌ Lỗi fetchOrders:", err);
        }
    }, [page, selectedStatus, orders.length]);

    /** 🧭 Load lần đầu */
    useEffect(() => {
        fetchOrders(true);
    }, [selectedStatus]);

    /** 🧩 Thu gọn khi đổi filter */
    useEffect(() => {
        setExpandedOrderId(null);
        setPage(1);
        setOrders([]);
    }, [selectedStatus]);

    const toggleExpand = (id: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedOrderId((prev) => (prev === id ? null : id));
    };

    /** 📜 Sự kiện cuộn cuối trang */
    const handleScroll = useCallback(
        async (event: any) => {
            const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
            const isBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 50;
            if (isBottom && !loadingMore && hasMore) {
                setLoadingMore(true);
                await new Promise((r) => setTimeout(r, 1000)); // delay 1s
                await fetchOrders();
                setLoadingMore(false);
            }
        },
        [loadingMore, hasMore, fetchOrders],
    );

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: "#fff", padding: 12 }}
            onScroll={handleScroll}
            scrollEventThrottle={200}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={async () => {
                        setRefreshing(true);
                        await fetchOrders(true);
                        setRefreshing(false);
                    }}
                    colors={["#ff6d00"]}
                />
            }
        >
            <Text variant="titleLarge" style={{ fontWeight: "bold", marginBottom: 12 }}>
                Đơn hàng gần đây
            </Text>

            {/* 🔖 Filter theo trạng thái */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 16 }}>
                {statusTags.map((tag) => (
                    <Chip
                        key={tag}
                        selected={selectedStatus === tag}
                        onPress={() => {
                            setSelectedStatus(tag);
                            setPage(1);
                            setOrders([]);
                        }}
                        style={{
                            marginRight: 8,
                            marginBottom: 8,
                            backgroundColor: selectedStatus === tag ? "#ff6d00" : "#f2f2f2",
                        }}
                        textStyle={{ color: selectedStatus === tag ? "#fff" : "#333" }}
                    >
                        {tag}
                    </Chip>
                ))}
            </View>

            {/* 🧾 Danh sách đơn hàng */}
            {orders.map((item) => {
                const isExpanded = expandedOrderId === item._id;
                return (
                    <Card key={item._id} style={{ marginBottom: 10 }}>
                        <TouchableOpacity onPress={() => toggleExpand(item._id)}>
                            <Card.Title
                                title={item.shop.name}
                                subtitle={`Tổng: ${item.totalPrice.toLocaleString()}đ`}
                                right={(props) => (
                                    <MaterialIcons
                                        {...props}
                                        name={isExpanded ? "expand-less" : "expand-more"}
                                        size={28}
                                    />
                                )}
                            />
                        </TouchableOpacity>

                        <Card.Content>
                            <Text style={{ color: "#777" }}>Trạng thái: {item.orderStatus}</Text>

                            {isExpanded && (
                                <View style={{ marginTop: 10 }}>
                                    <Divider style={{ marginBottom: 8 }} />
                                    <Text style={{ fontWeight: "bold", marginBottom: 4 }}>Người nhận</Text>
                                    <Text>{item.receiverName}</Text>
                                    <Text>{item.receiverPhone}</Text>
                                    <Text style={{ marginBottom: 6 }}>{item.deliveryAddress?.address}</Text>

                                    <Text style={{ fontWeight: "bold", marginBottom: 4 }}>Sản phẩm</Text>
                                    {item.items.map((p, idx) => (
                                        <View
                                            key={idx}
                                            style={{
                                                flexDirection: "row",
                                                justifyContent: "space-between",
                                                marginBottom: 4,
                                            }}
                                        >
                                            <Text>
                                                {p.productName} × {p.quantity}
                                            </Text>
                                            <Text>{p.totalPrice.toLocaleString()}đ</Text>
                                        </View>
                                    ))}

                                    <Divider style={{ marginVertical: 8 }} />
                                    <Text style={{ textAlign: "right", fontWeight: "bold" }}>
                                        Tổng cộng: {item.totalPrice.toLocaleString()}đ
                                    </Text>
                                </View>
                            )}
                        </Card.Content>

                        <Card.Actions>
                            <Button textColor="#ff6d00" onPress={() => toggleExpand(item._id)}>
                                {isExpanded ? "Thu gọn" : "Xem chi tiết"}
                            </Button>
                        </Card.Actions>
                    </Card>
                );
            })}

            {/* 🌀 Loading khi cuộn cuối */}
            {loadingMore && (
                <View style={{ paddingVertical: 16 }}>
                    <ActivityIndicator color="#ff6d00" size="small" />
                    <Text style={{ textAlign: "center", marginTop: 6, color: "#999" }}>Đang tải thêm...</Text>
                </View>
            )}

            {/* 🧩 Khi hết dữ liệu */}
            {!hasMore && !loadingMore && orders.length > 0 && (
                <Text style={{ textAlign: "center", color: "#999", marginTop: 8 }}>
                    — Hết đơn hàng —
                </Text>
            )}
        </ScrollView>
    );
}
