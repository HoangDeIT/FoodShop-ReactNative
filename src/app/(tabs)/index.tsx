import CategoriesList from "@/components/hompage/categories.list";
import ProductHorizontalList from "@/components/hompage/horizontal.products.list";
import HorizontalShopList from "@/components/hompage/horizontal.shops.list";
import ShopList from "@/components/list/shop.list";
import { useCurrentApp } from "@/context/app.context";
import { getSellers } from "@/utils/customer.api";
import { convertToShops, IShop } from "@/utils/function";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, FlatList, Pressable, RefreshControl, ScrollView, View } from "react-native";
import { ActivityIndicator, Card, Searchbar, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

// ✅ Định nghĩa type theo API thật

const restaurants = [
    {
        id: "r1",
        name: "Trà Sữa Tocotoco - Lê Quý Đôn",
        image:
            "https://images.foody.vn/res/g107/1067096/prof/s640x400/file_restaurant_photo_2lrb_16602-1cf1f583-221111123503.jpg",
        distance: "0.8 km",
    },
    {
        id: "r2",
        name: "Pizza Vị Thanh",
        image:
            "https://images.foody.vn/res/g102/1016410/prof/s640x400/file_restaurant_photo_rjmk_16404-7e9472d3-220129112530.jpg",
        distance: "1.2 km",
    },
    {
        id: "r3",
        name: "Highlands Coffee - Vincom Vị Thanh",
        image:
            "https://images.foody.vn/res/g108/1072623/prof/s640x400/file_restaurant_photo_4urc_16608-7d9d4df3-221118095904.jpg",
        distance: "2.4 km",
    },
    {
        id: "r4",
        name: "Bánh Mì PewPew",
        image:
            "https://images.foody.vn/res/g96/956148/prof/s640x400/file_restaurant_photo_4r8r_16043-9d8cc3fc-210731134839.jpg",
        distance: "1.5 km",
    },
];

// 🍔 Fake data cho sản phẩm
const products = [
    {
        id: "p1",
        name: "Trà Sữa Truyền Thống",
        image:
            "https://images.foody.vn/res/g105/1045224/prof/s640x400/file_restaurant_photo_h4pt_16267-6324f365-220119121655.jpg",
        price: 30000,
    },
    {
        id: "p2",
        name: "Mì Cay Hàn Quốc Cấp 3",
        image:
            "https://images.foody.vn/res/g112/1111568/prof/s640x400/file_restaurant_photo_jt4a_16887-5ab7e72b-240526171018.jpg",
        price: 45000,
    },
    {
        id: "p3",
        name: "Cà Phê Sữa Đá",
        image:
            "https://images.foody.vn/res/g108/1072623/prof/s640x400/file_restaurant_photo_4urc_16608-7d9d4df3-221118095904.jpg",
        price: 25000,
    },
    {
        id: "p4",
        name: "Bánh Mì Thịt Nướng",
        image:
            "https://images.foody.vn/res/g111/1103629/prof/s640x400/file_restaurant_photo_kbxe_16847-1fd4180a-240515140512.jpg",
        price: 20000,
    },
    {
        id: "p5",
        name: "Trà Đào Cam Sả",
        image:
            "https://images.foody.vn/res/g110/1094742/prof/s640x400/file_restaurant_photo_5oer_16772-30b0acb3-230224151236.jpg",
        price: 39000,
    },
    {
        id: "p6",
        name: "Cơm Tấm Sườn Bì Chả",
        image:
            "https://images.foody.vn/res/g101/1006881/prof/s640x400/file_restaurant_photo_efav_16203-5c6a7333-220504141529.jpg",
        price: 55000,
    },
    {
        id: "p7",
        name: "Phở Bò Tái Nạm",
        image:
            "https://images.foody.vn/res/g100/997570/prof/s640x400/file_restaurant_photo_lbd0_16153-309e5426-210309105727.jpg",
        price: 60000,
    },
    {
        id: "p8",
        name: "Sinh Tố Bơ Sữa",
        image:
            "https://images.foody.vn/res/g96/958547/prof/s640x400/file_restaurant_photo_wz9j_16114-2c7342f0-210120094409.jpg",
        price: 35000,
    },
];

const HomePage = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const { setAppState, appState } = useCurrentApp();
    const [shops, setShops] = useState<IShop[]>([]);
    const [meta, setMeta] = useState<IMeta | null>(null);

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

            // Kiểm tra kết quả trả về
            if (res?.data && res?.data?.result) {
                setShops(convertToShops(res.data.result));  // danh sách seller
                setMeta(res.data.meta);        // phân trang
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
                    <Searchbar
                        placeholder="Cơm chay, Bún Thái Giảm 40.000đ"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        iconColor="#ff6d00"
                        style={{
                            marginTop: 10,
                            borderRadius: 10,
                            elevation: 0,
                        }}
                    />
                </View>
                {/* Banner */}
                <Card style={{ margin: 12, borderRadius: 10 }}>
                    <Card.Cover source={{ uri: "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-ly0nmg0we5x7a6", }} />
                    <Card.Content>
                        <Text style={{ marginTop: 6, fontWeight: "bold" }}> Thử ngay quán mới - Giảm tới 30.000đ </Text>
                    </Card.Content>
                </Card>
                {/* ✅ Categories - 2 hàng cuộn ngang */}

                <CategoriesList />
                {/* ✅ Bộ sưu tập */}
                <View style={{ paddingHorizontal: 12, marginTop: 10 }}>
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
                </View>
                <HorizontalShopList
                    name="Restaurants"
                    description="Quán ăn gần bạn 🍜"
                    data={restaurants}
                    onSeeAll={() => console.log("Xem tất cả quán ăn")}
                />

                <ProductHorizontalList
                    title="Danh sách sản phẩm"
                    subtitle="Món bán chạy nhất hôm nay 🍔"
                    data={products}
                    onSeeAll={() => console.log("Xem tất cả sản phẩm")}
                />
                {/* <ProductList
                    data={products}
                    scrollEnabled={false}
                /> */}
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
        </SafeAreaView>
    );
};

export default HomePage;
