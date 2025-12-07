import { findCategoryApi, findSellerWithProductsApi } from "@/utils/customer.api";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, TouchableOpacity, View } from "react-native";
import { Divider, Text } from "react-native-paper";

export default function DinnerDealsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>(); // Lấy categoryId từ URL
    const [category, setCategory] = useState<ICategory | null>(null);
    const [sellers, setSellers] = useState<ISellerWithProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                setLoading(true);

                // 🔹 Gọi song song 2 API
                const [catRes, sellerRes] = await Promise.all([
                    findCategoryApi(id as string),
                    findSellerWithProductsApi(id as string, "1", "100"),
                ]);

                if (!catRes.error) setCategory(catRes.data ?? null);
                if (!sellerRes.error)
                    setSellers(sellerRes?.data?.result ?? []);
            } catch (error) {
                console.error("Lỗi tải dữ liệu:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#fff",
                }}
            >
                <ActivityIndicator size="large" color="#ff6d00" />
                <Text style={{ marginTop: 10 }}>Đang tải dữ liệu...</Text>
            </View>
        );
    }

    if (!category) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text>Không tìm thấy danh mục.</Text>
            </View>
        );
    }

    return (
        <ScrollView style={{ flex: 1, backgroundColor: "#fff" }} showsVerticalScrollIndicator={false}>
            {/* Banner */}
            <Image
                source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}/public/images/categories/${category.image}` }}
                style={{ width: "100%", height: 200 }}
                resizeMode="cover"
            />

            {/* Tiêu đề danh mục */}
            <View style={{ padding: 16 }}>
                <Text variant="headlineSmall" style={{ fontWeight: "bold" }}>
                    {category.name}
                </Text>
                <Text
                    variant="bodyMedium"
                    style={{ color: "#555", marginTop: 4, lineHeight: 20 }}
                >
                    {category.description}
                </Text>
            </View>

            <Divider bold style={{ backgroundColor: "#eee" }} />

            {/* Danh sách quán */}
            {sellers.map((s, idx) => (
                <TouchableOpacity key={idx} activeOpacity={0.8} onPress={() => {
                    // Điều hướng đến trang quán
                    router.push(`/shop/${s.seller._id}`);
                }}>
                    <View
                        style={{
                            flexDirection: "row",
                            marginHorizontal: 16,
                            marginTop: 16,
                            borderRadius: 12,
                            backgroundColor: "#fff",
                            shadowColor: "#000",
                            shadowOpacity: 0.05,
                            shadowRadius: 4,
                            elevation: 1,
                            paddingBottom: 12,
                        }}
                    >
                        {/* Ảnh bên trái (sẽ dùng ảnh sản phẩm đầu tiên nếu có) */}
                        <Image
                            source={
                                s.seller.avatar
                                    ? { uri: `${process.env.EXPO_PUBLIC_API_URL}/public/images/users/${s.seller.avatar}` }
                                    : require("src/assets/images/banner-1.webp")
                            }
                            style={{
                                width: 100,
                                height: 100,
                                borderTopLeftRadius: 12,
                                borderBottomLeftRadius: 12,
                            }}
                        />

                        {/* Thông tin bên phải */}
                        <View style={{ flex: 1, paddingHorizontal: 12, paddingTop: 6 }}>
                            <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
                                {s.seller.name}
                            </Text>

                            {/* ⭐ Rating + 📍Distance */}
                            <View style={{ flexDirection: "row", marginTop: 4, alignItems: "center" }}>
                                <Text style={{ color: "#ff6d00", fontSize: 13 }}>
                                    ⭐ {s.averageRating.toFixed(1)}
                                </Text>
                                <Text style={{ color: "#777", fontSize: 13, marginLeft: 8 }}>
                                    {s.distance.toFixed(1)} km
                                </Text>
                                <Text style={{ color: "#777", fontSize: 13, marginLeft: 8 }}>
                                    ({s.totalReviews} đánh giá)
                                </Text>
                            </View>

                            {/* Hình ảnh món ăn nhỏ */}
                            <View
                                style={{
                                    flexDirection: "row",
                                    marginTop: 10,
                                    gap: 8,
                                }}
                            >
                                {s.products.slice(0, 3).map((item, index) => (
                                    <View key={index} style={{ alignItems: "center" }}>
                                        <Image
                                            source={
                                                item.image
                                                    ? { uri: `${process.env.EXPO_PUBLIC_API_URL}/public/images/products/${item.image}` }
                                                    : require("src/assets/images/banner-2.jpg")
                                            }
                                            style={{
                                                width: 50,
                                                height: 50,
                                                borderRadius: 8,
                                            }}
                                        />
                                        <Text
                                            style={{
                                                fontSize: 11,
                                                marginTop: 2,
                                                color: "#444",
                                                maxWidth: 55,
                                                textAlign: "center",
                                            }}
                                            numberOfLines={1}
                                        >
                                            {item.name}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            ))}

            {sellers.length === 0 && (
                <View style={{ alignItems: "center", marginTop: 20 }}>
                    <Text>Không có quán nào trong danh mục này.</Text>
                </View>
            )}

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}
