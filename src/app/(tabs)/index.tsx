import AppCarousel from "@/components/hompage/carousel";
import CategoriesList from "@/components/hompage/categories.list";
import HorizontalShopList from "@/components/hompage/horizontal.shops.list";
import ProductSearch from "@/components/hompage/search.bar";
import ShopList from "@/components/list/shop.list";
import { useCurrentApp } from "@/context/app.context";
import { getSellers, getSellersType } from "@/utils/customer.api";
import { convertToShops, IShop } from "@/utils/function";
import { listenNotificationEvents, registerForPushNotificationsAsync } from "@/utils/notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, RefreshControl, ScrollView, View } from "react-native";
import { ActivityIndicator, Snackbar, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
const transformSellers = (data: any[]) => {
    return data.map((item, index) => ({
        id: `${item.seller?._id}`, // tạo id tuần tự r1, r2, r3...
        name: item.seller?.name || "Không rõ tên",
        image: item.seller?.avatar
            ? `${item.seller.avatar}`
            : "https://via.placeholder.com/640x400?text=No+Image",
        distance: `${item.distance.toFixed(1)} km`,
    }));
}
// 🍔 Fake data cho sản phẩm

const HomePage = () => {
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const { setAppState, appState } = useCurrentApp();
    const [shops, setShops] = useState<IShop[]>([]);
    const [meta, setMeta] = useState<IMeta | null>(null);
    const [snackbar, setSnackbar] = useState({
        visible: false,
        message: "",
    });
    const [typeSeller, setTypeSeller] = useState<ISellerWithProductType>();
    // ✅ Đăng xuất
    const handleLogout = () => {
        Alert.alert("Đăng xuất", "Bạn chắc chắn đăng xuất người dùng ?", [
            { text: "Hủy", style: "cancel" },
            {
                text: "Xác nhận",
                onPress: async () => {
                    await AsyncStorage.clear();
                    router.replace("/(auth)/login");
                },
            },
        ]);
    };
    const fetchSellers = async () => {
        try {
            // Gọi API
            const res = await getSellers(5, 1, 10); // ví dụ: bán kính 5km, trang 1, 10 seller mỗi trang
            const res2 = await getSellersType();
            // Kiểm tra kết quả trả về
            if (res?.data && res?.data?.result && res2?.data) {
                setShops(convertToShops(res.data.result));  // danh sách seller
                setMeta(res.data.meta);        // phân trang
                setTypeSeller(res2.data);
            } else {
                setShops([]);
                setMeta(null);
            }
        } catch (error: any) {
            console.error("Lỗi khi lấy danh sách seller:", error);
            setShops([]);
        }
    };
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchSellers();
        setRefreshing(false);
    }
    const handleScroll = async (e: any) => {
        const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;

        const isEndReached =
            layoutMeasurement.height + contentOffset.y >= contentSize.height - 30;

        // Nếu chưa tới đáy hoặc đang load thì bỏ qua
        if (!isEndReached || loadingMore || !meta) return;

        // Nếu đã tới trang cuối thì ngưng
        if (meta.current >= meta.pages) return;

        setLoadingMore(true);

        try {
            const nextPage = meta.current + 1;
            const res = await getSellers(5, nextPage, 10);

            if (res?.data && res?.data?.result) {
                const newShops = convertToShops(res.data.result);
                setShops((prev) => [...prev, ...newShops]);
                setMeta(res.data.meta);
            }
        } catch (error) {
            console.error("Lỗi khi tải thêm:", error);
        } finally {
            await new Promise((r) => setTimeout(r, 2000));
            setLoadingMore(false);
        }
    };
    useEffect(() => {
        fetchSellers();
    }, []);
    useEffect(() => {

        if (!appState?.access_token) return;
        registerForPushNotificationsAsync(appState!.access_token!);
        listenNotificationEvents();
    }, [appState]);
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
            <ScrollView style={{ flex: 1, backgroundColor: "#fff" }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#4CAF50']} // 🎨 màu xoay vòng trên Android
                        tintColor="#4CAF50"  // 🎨 màu spinner trên iOS
                        title="Đang làm mới..." // hiển thị text trên iOS
                    />
                }
                onScroll={handleScroll}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View style={{ backgroundColor: "#ff6d00", padding: 12 }}>
                    <Pressable onPress={() => router.push("/(stack)/address")}>
                        <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
                            Giao đến:
                        </Text>
                        <Text style={{ color: "white", fontWeight: "bold" }}>
                            {appState?.location?.address || "Đang tìm vị trí"}
                        </Text>
                    </Pressable>
                    <ProductSearch />
                </View>
                {/* Banner */}
                <AppCarousel />
                {/* ✅ Categories - 2 hàng cuộn ngang */}

                <CategoriesList />
                {/* ✅ Bộ sưu tập */}
                {/* <View style={{ paddingHorizontal: 12, marginTop: 10 }}>
                    <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 10 }}>
                        Bộ sưu tập
                    </Text>
                    <FlatList
                        data={[
                            {
                                id: 1,
                                title: "Mừng Ngày Chị Em, Giảm tới 50%",
                                image:
                                    "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-ly0nmg0we5x7a8",
                            },
                            {
                                id: 2,
                                title: "Đặt Đơn Nhóm, Nhiều Giảm Nhiều",
                                image:
                                    "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-ly0nmg0we5x7a9",
                            },
                            {
                                id: 3,
                                title: "Đặt Đơn Nhóm, Nhiều Giảm Nhiều",
                                image:
                                    "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-ly0nmg0we5x7a9",
                            },
                        ]}
                        keyExtractor={(item) => item.id.toString()}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <Card
                                style={{
                                    marginRight: 12,
                                    width: 200,
                                    borderRadius: 10,
                                    backgroundColor: "#fff",
                                }}
                            >
                                <Card.Cover source={{ uri: item.image }} style={{ height: 120 }} />
                                <Card.Content>
                                    <Text
                                        style={{
                                            fontSize: 13,
                                            fontWeight: "600",
                                            marginTop: 5,
                                        }}
                                    >
                                        {item.title}
                                    </Text>
                                </Card.Content>
                            </Card>
                        )}
                    />
                </View> */}

                {typeSeller && (
                    <>
                        <HorizontalShopList
                            name="Restaurants"
                            description="Quán ăn có top rating 🍜"
                            data={transformSellers(typeSeller?.topRated!)}
                            onSeeAll={() => console.log("Xem tất cả quán ăn")}
                        />
                        <HorizontalShopList
                            name="Restaurants"
                            description="Quán ăn bạn đã thích 🍜"
                            data={transformSellers(typeSeller?.liked!)}
                            onSeeAll={() => console.log("Xem tất cả quán ăn")}
                        />
                        <HorizontalShopList
                            name="Restaurants"
                            description="Quán ăn bạn đã đặt 🍜"
                            data={transformSellers(typeSeller?.ordered!)}
                            onSeeAll={() => console.log("Xem tất cả quán ăn")}
                        />
                        <HorizontalShopList
                            name="Restaurants"
                            description="Quán ăn bán chạy nhất 🍜"
                            data={transformSellers(typeSeller?.topSelling!)}
                            onSeeAll={() => console.log("Xem tất cả quán ăn")}
                        />
                    </>
                )}

                <ShopList
                    data={shops}

                />
                {loadingMore && (
                    <View style={{ paddingVertical: 16, alignItems: "center" }}>
                        <ActivityIndicator color="#4CAF50" size="small" />
                        <Text style={{ marginTop: 6, color: "#4CAF50" }}>Đang tải thêm...</Text>
                    </View>
                )}
            </ScrollView>
            <Snackbar
                visible={snackbar.visible}
                onDismiss={() => setSnackbar({ visible: false, message: "" })}
                duration={2500}
                style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
            >
                {snackbar.message}
            </Snackbar>
        </SafeAreaView>
    );
};

export default HomePage;
