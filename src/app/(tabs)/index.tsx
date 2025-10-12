import ProductHorizontalList from "@/components/hompage/horizontal.products.list";
import HorizontalShopList from "@/components/hompage/horizontal.shops.list";
import ProductList from "@/components/list/product.list";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, FlatList, Image, ScrollView, View } from "react-native";
import { Card, Searchbar, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

// ✅ Định nghĩa type theo API thật
type Category = {
    _id: string;
    name: string;
    description: string;
    image: string;
    icon: string;
    createdBy: { _id: string; email: string };
    updatedBy?: { _id: string; email: string };
    isDeleted: boolean;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
    __v: number;
};
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
    const [categories, setCategories] = useState<Category[]>([]);
    const [columns, setColumns] = useState<Category[][]>([]);

    useEffect(() => {
        // 🔹 Giả lập fetch API trả về cùng format như thật
        const fetchCategories = async () => {
            const data: Category[] = [
                {
                    _id: "68e762637d2985371f7fb721",
                    name: "Đồ ăn nhanh",
                    description: "Các món ăn nhanh như hamburger, pizza, gà rán...",
                    image: "https://example.com/images/fastfood.jpg",
                    icon: "https://example.com/icons/fastfood.png",
                    createdBy: { _id: "68d65a87cd330e1473d9ca11", email: "hoangde102004@gmail.com" },
                    updatedBy: { _id: "68d65a87cd330e1473d9ca11", email: "hoangde102004@gmail.com" },
                    isDeleted: false,
                    deletedAt: null,
                    createdAt: "2025-10-09T07:21:07.206Z",
                    updatedAt: "2025-10-09T07:34:03.243Z",
                    __v: 0,
                },
                {
                    _id: "68e762637d2985371f7fb722",
                    name: "Cơm trưa văn phòng",
                    description: "Cơm hộp tiện lợi, nhiều món hấp dẫn.",
                    image: "https://example.com/images/lunchbox.jpg",
                    icon: "https://example.com/icons/lunchbox.png",
                    createdBy: { _id: "68d65a87cd330e1473d9ca11", email: "hoangde102004@gmail.com" },
                    updatedBy: { _id: "68d65a87cd330e1473d9ca11", email: "hoangde102004@gmail.com" },
                    isDeleted: false,
                    deletedAt: null,
                    createdAt: "2025-10-09T07:21:07.206Z",
                    updatedAt: "2025-10-09T07:34:03.243Z",
                    __v: 0,
                },
                {
                    _id: "68e762637d2985371f7fb723",
                    name: "Trà sữa & nước ngọt",
                    description: "Các loại nước giải khát, trà sữa và cà phê.",
                    image: "https://example.com/images/drinks.jpg",
                    icon: "https://example.com/icons/drinks.png",
                    createdBy: { _id: "68d65a87cd330e1473d9ca11", email: "hoangde102004@gmail.com" },
                    updatedBy: { _id: "68d65a87cd330e1473d9ca11", email: "hoangde102004@gmail.com" },
                    isDeleted: false,
                    deletedAt: null,
                    createdAt: "2025-10-09T07:21:07.206Z",
                    updatedAt: "2025-10-09T07:34:03.243Z",
                    __v: 0,
                },
                {
                    _id: "68e762637d2985371f7fb724",
                    name: "Ăn vặt",
                    description: "Các món ăn nhẹ, snack, khoai chiên, bánh ngọt...",
                    image: "https://example.com/images/snack.jpg",
                    icon: "https://example.com/icons/snack.png",
                    createdBy: { _id: "68d65a87cd330e1473d9ca11", email: "hoangde102004@gmail.com" },
                    updatedBy: { _id: "68d65a87cd330e1473d9ca11", email: "hoangde102004@gmail.com" },
                    isDeleted: false,
                    deletedAt: null,
                    createdAt: "2025-10-09T07:21:07.206Z",
                    updatedAt: "2025-10-09T07:34:03.243Z",
                    __v: 0,
                },
                {
                    _id: "68e762637d2985371f7fb725",
                    name: "Bánh ngọt & cà phê",
                    description: "Bánh ngọt, donut, croissant cùng cà phê thơm ngon.",
                    image: "https://example.com/images/cake-coffee.jpg",
                    icon: "https://example.com/icons/cake-coffee.png",
                    createdBy: { _id: "68d65a87cd330e1473d9ca11", email: "hoangde102004@gmail.com" },
                    updatedBy: { _id: "68d65a87cd330e1473d9ca11", email: "hoangde102004@gmail.com" },
                    isDeleted: false,
                    deletedAt: null,
                    createdAt: "2025-10-09T07:21:07.206Z",
                    updatedAt: "2025-10-09T07:34:03.243Z",
                    __v: 0,
                },
                {
                    _id: "68e762637d2985371f7fb726",
                    name: "Lẩu & nướng",
                    description: "Buffet lẩu nướng, hải sản tươi ngon.",
                    image: "https://example.com/images/hotpot-bbq.jpg",
                    icon: "https://example.com/icons/hotpot-bbq.png",
                    createdBy: { _id: "68d65a87cd330e1473d9ca11", email: "hoangde102004@gmail.com" },
                    updatedBy: { _id: "68d65a87cd330e1473d9ca11", email: "hoangde102004@gmail.com" },
                    isDeleted: false,
                    deletedAt: null,
                    createdAt: "2025-10-09T07:21:07.206Z",
                    updatedAt: "2025-10-09T07:34:03.243Z",
                    __v: 0,
                },
                {
                    _id: "68e762637d2985371f7fb727",
                    name: "Món chay",
                    description: "Các món chay thanh đạm, tốt cho sức khỏe.",
                    image: "https://example.com/images/vegetarian.jpg",
                    icon: "https://example.com/icons/vegetarian.png",
                    createdBy: { _id: "68d65a87cd330e1473d9ca11", email: "hoangde102004@gmail.com" },
                    updatedBy: { _id: "68d65a87cd330e1473d9ca11", email: "hoangde102004@gmail.com" },
                    isDeleted: false,
                    deletedAt: null,
                    createdAt: "2025-10-09T07:21:07.206Z",
                    updatedAt: "2025-10-09T07:34:03.243Z",
                    __v: 0,
                },
                {
                    _id: "68e762637d2985371f7fb728",
                    name: "Hải sản",
                    description: "Các món hải sản tươi sống, hấp dẫn.",
                    image: "https://example.com/images/seafood.jpg",
                    icon: "https://example.com/icons/seafood.png",
                    createdBy: { _id: "68d65a87cd330e1473d9ca11", email: "hoangde102004@gmail.com" },
                    updatedBy: { _id: "68d65a87cd330e1473d9ca11", email: "hoangde102004@gmail.com" },
                    isDeleted: false,
                    deletedAt: null,
                    createdAt: "2025-10-09T07:21:07.206Z",
                    updatedAt: "2025-10-09T07:34:03.243Z",
                    __v: 0,
                },
                {
                    _id: "68e762637d2985371f7fb729",
                    name: "Mì & phở",
                    description: "Mì quảng, phở bò, hủ tiếu, bún chả cá...",
                    image: "https://example.com/images/noodles.jpg",
                    icon: "https://example.com/icons/noodles.png",
                    createdBy: { _id: "68d65a87cd330e1473d9ca11", email: "hoangde102004@gmail.com" },
                    updatedBy: { _id: "68d65a87cd330e1473d9ca11", email: "hoangde102004@gmail.com" },
                    isDeleted: false,
                    deletedAt: null,
                    createdAt: "2025-10-09T07:21:07.206Z",
                    updatedAt: "2025-10-09T07:34:03.243Z",
                    __v: 0,
                },
                {
                    _id: "68e762637d2985371f7fb72a",
                    name: "Đồ nướng đường phố",
                    description: "Xiên nướng, thịt nướng vỉa hè, bánh tráng nướng...",
                    image: "https://example.com/images/street-grill.jpg",
                    icon: "https://example.com/icons/street-grill.png",
                    createdBy: { _id: "68d65a87cd330e1473d9ca11", email: "hoangde102004@gmail.com" },
                    updatedBy: { _id: "68d65a87cd330e1473d9ca11", email: "hoangde102004@gmail.com" },
                    isDeleted: false,
                    deletedAt: null,
                    createdAt: "2025-10-09T07:21:07.206Z",
                    updatedAt: "2025-10-09T07:34:03.243Z",
                    __v: 0,
                },
                {
                    _id: "68e762637d2985371f7fb72b",
                    name: "Pizza & Pasta",
                    description: "Các món pizza Ý, pasta, spaghetti...",
                    image: "https://example.com/images/pizza-pasta.jpg",
                    icon: "https://example.com/icons/pizza-pasta.png",
                    createdBy: { _id: "68d65a87cd330e1473d9ca11", email: "hoangde102004@gmail.com" },
                    updatedBy: { _id: "68d65a87cd330e1473d9ca11", email: "hoangde102004@gmail.com" },
                    isDeleted: false,
                    deletedAt: null,
                    createdAt: "2025-10-09T07:21:07.206Z",
                    updatedAt: "2025-10-09T07:34:03.243Z",
                    __v: 0,
                },
                {
                    _id: "68e762637d2985371f7fb72c",
                    name: "Cơm tấm & bún thịt nướng",
                    description: "Cơm tấm sườn bì chả, bún thịt nướng, nem nướng.",
                    image: "https://example.com/images/comtam.jpg",
                    icon: "https://example.com/icons/comtam.png",
                    createdBy: { _id: "68d65a87cd330e1473d9ca11", email: "hoangde102004@gmail.com" },
                    updatedBy: { _id: "68d65a87cd330e1473d9ca11", email: "hoangde102004@gmail.com" },
                    isDeleted: false,
                    deletedAt: null,
                    createdAt: "2025-10-09T07:21:07.206Z",
                    updatedAt: "2025-10-09T07:34:03.243Z",
                    __v: 0,
                },
                {
                    _id: "68e762637d2985371f7fb72d",
                    name: "Cơm gia đình",
                    description: "Món cơm nhà nấu, canh chua, cá kho, rau luộc...",
                    image: "https://example.com/images/home-meal.jpg",
                    icon: "https://example.com/icons/home-meal.png",
                    createdBy: { _id: "68d65a87cd330e1473d9ca11", email: "hoangde102004@gmail.com" },
                    updatedBy: { _id: "68d65a87cd330e1473d9ca11", email: "hoangde102004@gmail.com" },
                    isDeleted: false,
                    deletedAt: null,
                    createdAt: "2025-10-09T07:21:07.206Z",
                    updatedAt: "2025-10-09T07:34:03.243Z",
                    __v: 0,
                },
                {
                    _id: "68e762637d2985371f7fb72e",
                    name: "Bún, miến, cháo",
                    description: "Các món bún bò, miến gà, cháo cá, cháo sườn...",
                    image: "https://example.com/images/vermicelli.jpg",
                    icon: "https://example.com/icons/vermicelli.png",
                    createdBy: { _id: "68d65a87cd330e1473d9ca11", email: "hoangde102004@gmail.com" },
                    updatedBy: { _id: "68d65a87cd330e1473d9ca11", email: "hoangde102004@gmail.com" },
                    isDeleted: false,
                    deletedAt: null,
                    createdAt: "2025-10-09T07:21:07.206Z",
                    updatedAt: "2025-10-09T07:34:03.243Z",
                    __v: 0,
                },
                {
                    _id: "68e762637d2985371f7fb72f",
                    name: "Đồ ăn Hàn Quốc",
                    description: "Tokbokki, kimbap, canh kim chi, BBQ Hàn...",
                    image: "https://example.com/images/korean.jpg",
                    icon: "https://example.com/icons/korean.png",
                    createdBy: { _id: "68d65a87cd330e1473d9ca11", email: "hoangde102004@gmail.com" },
                    updatedBy: { _id: "68d65a87cd330e1473d9ca11", email: "hoangde102004@gmail.com" },
                    isDeleted: false,
                    deletedAt: null,
                    createdAt: "2025-10-09T07:21:07.206Z",
                    updatedAt: "2025-10-09T07:34:03.243Z",
                    __v: 0,
                },
                {
                    _id: "68e762637d2985371f7fb730",
                    name: "Đồ ăn Nhật Bản",
                    description: "Sushi, sashimi, udon, tempura...",
                    image: "https://example.com/images/japanese.jpg",
                    icon: "https://example.com/icons/japanese.png",
                    createdBy: { _id: "68d65a87cd330e1473d9ca11", email: "hoangde102004@gmail.com" },
                    updatedBy: { _id: "68d65a87cd330e1473d9ca11", email: "hoangde102004@gmail.com" },
                    isDeleted: false,
                    deletedAt: null,
                    createdAt: "2025-10-09T07:21:07.206Z",
                    updatedAt: "2025-10-09T07:34:03.243Z",
                    __v: 0,
                },
                {
                    _id: "68e762637d2985371f7fb731",
                    name: "Đồ ăn Trung Quốc",
                    description: "Dimsum, vịt quay Bắc Kinh, hoành thánh...",
                    image: "https://example.com/images/chinese.jpg",
                    icon: "https://example.com/icons/chinese.png",
                    createdBy: { _id: "68d65a87cd330e1473d9ca11", email: "hoangde102004@gmail.com" },
                    updatedBy: { _id: "68d65a87cd330e1473d9ca11", email: "hoangde102004@gmail.com" },
                    isDeleted: false,
                    deletedAt: null,
                    createdAt: "2025-10-09T07:21:07.206Z",
                    updatedAt: "2025-10-09T07:34:03.243Z",
                    __v: 0,
                },
                {
                    _id: "68e762637d2985371f7fb732",
                    name: "Bánh mì & sandwich",
                    description: "Bánh mì thịt, sandwich kẹp trứng, pate, salad...",
                    image: "https://example.com/images/sandwich.jpg",
                    icon: "https://example.com/icons/sandwich.png",
                    createdBy: { _id: "68d65a87cd330e1473d9ca11", email: "hoangde102004@gmail.com" },
                    updatedBy: { _id: "68d65a87cd330e1473d9ca11", email: "hoangde102004@gmail.com" },
                    isDeleted: false,
                    deletedAt: null,
                    createdAt: "2025-10-09T07:21:07.206Z",
                    updatedAt: "2025-10-09T07:34:03.243Z",
                    __v: 0,
                },
                {
                    _id: "68e762637d2985371f7fb733",
                    name: "Tráng miệng & kem",
                    description: "Kem tươi, chè, yogurt, pudding, bánh flan...",
                    image: "https://example.com/images/dessert.jpg",
                    icon: "https://example.com/icons/dessert.png",
                    createdBy: { _id: "68d65a87cd330e1473d9ca11", email: "hoangde102004@gmail.com" },
                    updatedBy: { _id: "68d65a87cd330e1473d9ca11", email: "hoangde102004@gmail.com" },
                    isDeleted: false,
                    deletedAt: null,
                    createdAt: "2025-10-09T07:21:07.206Z",
                    updatedAt: "2025-10-09T07:34:03.243Z",
                    __v: 0,
                },
                {
                    _id: "68e762637d2985371f7fb734",
                    name: "Đồ uống có cồn",
                    description: "Bia, rượu vang, cocktail nhẹ.",
                    image: "https://example.com/images/alcohol.jpg",
                    icon: "https://example.com/icons/alcohol.png",
                    createdBy: { _id: "68d65a87cd330e1473d9ca11", email: "hoangde102004@gmail.com" },
                    updatedBy: { _id: "68d65a87cd330e1473d9ca11", email: "hoangde102004@gmail.com" },
                    isDeleted: false,
                    deletedAt: null,
                    createdAt: "2025-10-09T07:21:07.206Z",
                    updatedAt: "2025-10-09T07:34:03.243Z",
                    __v: 0,
                },
                {
                    _id: "68e762637d2985371f7fb735",
                    name: "Combo ưu đãi",
                    description: "Set ăn tiết kiệm cho 2-4 người, giá tốt nhất.",
                    image: "https://example.com/images/combo.jpg",
                    icon: "https://example.com/icons/combo.png",
                    createdBy: { _id: "68d65a87cd330e1473d9ca11", email: "hoangde102004@gmail.com" },
                    updatedBy: { _id: "68d65a87cd330e1473d9ca11", email: "hoangde102004@gmail.com" },
                    isDeleted: false,
                    deletedAt: null,
                    createdAt: "2025-10-09T07:21:07.206Z",
                    updatedAt: "2025-10-09T07:34:03.243Z",
                    __v: 0,
                },
            ];

            setCategories(data);

            // 🔹 Chia nhóm 2 hàng (2 category mỗi cột)
            const grouped = data.reduce((acc: Category[][], _, i) => {
                if (i % 2 === 0) acc.push(data.slice(i, i + 2));
                return acc;
            }, []);
            setColumns(grouped);
        };

        fetchCategories();
    }, []);

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

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
            <ScrollView style={{ flex: 1, backgroundColor: "#fff" }}>
                {/* Header */}
                <View style={{ backgroundColor: "#ff6d00", padding: 12 }}>
                    <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
                        Giao đến:
                    </Text>
                    <Text style={{ color: "white", fontWeight: "bold" }}>
                        a11 - 10 Đ. Số 6, Phường 7, Vị Thanh, Hậu Giang
                    </Text>
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
                <FlatList
                    data={columns}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    decelerationRate="fast"
                    keyExtractor={(_, i) => i.toString()}
                    contentContainerStyle={{
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                    }}
                    renderItem={({ item }) => (
                        <View
                            style={{
                                flexDirection: "column",
                                alignItems: "center",
                                marginHorizontal: 10,
                            }}
                        >
                            {item.map((cat) => (
                                <View
                                    key={cat._id}
                                    style={{
                                        alignItems: "center",
                                        marginVertical: 10,
                                        width: 80,       // 👈 Chiều rộng cố định để text không đẩy lệch
                                        height: 100,     // 👈 Chiều cao cố định để các hàng đều nhau
                                    }}
                                >
                                    {/* 🖼 icon URL từ API */}
                                    <Image
                                        source={{ uri: cat.icon }}
                                        style={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: 22,
                                            backgroundColor: "#ffecb3",
                                        }}
                                        resizeMode="cover"
                                    />
                                    <Text
                                        numberOfLines={2}               // 👈 Giới hạn hiển thị tối đa 2 dòng
                                        ellipsizeMode="tail"            // 👈 Nếu dài quá, thêm "..." ở cuối
                                        style={{
                                            width: 70,                    // 👈 Cố định chiều rộng để không kéo giãn
                                            lineHeight: 16,               // 👌 Cân đối khoảng cách giữa 2 dòng
                                            textAlign: "center",
                                            fontSize: 12,
                                            marginTop: 6,
                                            color: "#333",
                                        }}
                                    >
                                        {cat.name}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}
                />

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
                <ProductList
                    data={products}
                    scrollEnabled={false}
                />
            </ScrollView>
        </SafeAreaView>
    );
};

export default HomePage;
