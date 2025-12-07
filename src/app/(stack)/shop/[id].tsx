import ProductOptionsSheet from "@/components/products/product.option.sheet";
import { useCurrentApp } from "@/context/app.context";
import { addToCart } from "@/db/services/cartService";
import { createConversation } from "@/utils/chats.api";
import { checkLikeStatus, getProducts, getProfileSeller, likeShopApi, unLikeShopApi } from "@/utils/customer.api";
import { calculateDistance } from "@/utils/function";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, View } from "react-native";
import { Card, Chip, Divider, IconButton, Snackbar, Text } from "react-native-paper";

export default function RestaurantScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [menu, setMenu] = useState<IProductR[]>([]);
    const [meta, setMeta] = useState<IMeta>();
    const [seller, setSeller] = useState<IUserR>();
    const [isFavorite, setIsFavorite] = useState(false);
    // ✅ State quản lý sheet
    const [visible, setVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<IProductR>();
    const [snackbar, setSnackbar] = useState<{ visible: boolean; message: string }>({
        visible: false,
        message: "",
    });
    const { appState } = useCurrentApp();
    const fetchMenu = async () => {
        const res = await getProducts(1, 100, id as string);
        const res2 = await getProfileSeller(id as string);
        const res3 = await checkLikeStatus(id as string);
        if (!res.error && res.data && res.data.result && !res2.error && res2.data) {
            setMenu(res.data.result);
            setMeta(res.data.meta);
            setSeller(res2.data);
            setIsFavorite(Boolean(res3.data?.isLiked));
        }
    }
    useEffect(() => {
        fetchMenu();
    }, [id]);


    const handleAddPress = async (product: IProductR) => {
        const hasOptions =
            (product.sizes && product.sizes.length > 0) ||
            (product.toppings && product.toppings.length > 0);

        if (hasOptions) {
            setSelectedProduct(product);
            setTimeout(() => setVisible(true), 300);
            return;
        }

        try {

            await addToCart({
                shopId: seller?._id!,
                shopName: seller!.name,
                productId: product._id,
                productName: product.name,
                basePrice: product.basePrice,
                quantity: 1,
                image: product.image,
                sizeId: null,
                sizeName: "",
                toppingIds: [],
                toppingNames: [],
                note: "",
                sizePrice: 0,
                toppingPrice: 0,
            });

            // ✅ Hiển thị snackbar thông báo thành công
            setSnackbar({ visible: true, message: `Đã thêm "${product.name}" vào giỏ hàng 🛒` });
        } catch (error) {
            console.error("❌ Lỗi khi thêm vào giỏ:", error);
            setSnackbar({ visible: true, message: "Thêm sản phẩm thất bại ❌" });
        }
    };
    const toggleFavorite = async () => {
        setIsFavorite((prev) => !prev);
        if (isFavorite) await unLikeShopApi(id as string)
        else await likeShopApi(id as string)
        // TODO: Gọi API backend sau này:
        // if (!isFavorite) await api.post(`/favorites/${seller._id}`)
        // else await api.delete(`/favorites/${seller._id}`)
    };

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: "#fff" }}
            contentContainerStyle={{ paddingBottom: 20 }}
        >
            {/* Header */}
            <Card mode="contained" style={{ margin: 10, borderRadius: 12 }}>
                <Card.Cover
                    source={{
                        uri: `${process.env.EXPO_PUBLIC_API_URL}/public/images/users/${seller?.avatar}`,
                    }}
                />
                <IconButton
                    icon={isFavorite ? "heart" : "heart-outline"}
                    iconColor={isFavorite ? "#ff3b30" : "#fff"}
                    size={28}
                    onPress={toggleFavorite}
                    style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        backgroundColor: "rgba(0,0,0,0.3)",
                    }}
                />

                {/* 💬 Nút chat */}
                <IconButton
                    icon="chat-outline"
                    iconColor="#fff"
                    size={26}
                    onPress={async () => {
                        const res = await createConversation(id as string);
                        if (res.error) setSnackbar({ visible: true, message: res.message })
                        router.push(`/(stack)/chat/${res?.data?._id}`)
                    }}
                    style={{
                        position: "absolute",
                        bottom: 10,
                        right: 10,
                        backgroundColor: "#1677ff",
                    }}
                />

                <Card.Content style={{ marginTop: 10 }}>
                    <Text variant="titleLarge" style={{ fontWeight: "bold" }}>
                        {seller?.name}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                        <Text>⭐ {seller?.rating} ({seller?.reviewsCount} Bình luận) · </Text>
                        <Text>

                            {
                                //@ts-ignore
                                seller?.location?.latitude && seller?.location?.longitude
                                    ? calculateDistance(
                                        appState?.location?.latitude ?? 0,
                                        appState?.location?.longitude ?? 0,
                                        //@ts-ignore
                                        seller.location.latitude, seller.location.longitude
                                    ).toFixed(1) + " km"
                                    : "Đang cập nhật"}
                        </Text>
                    </View>
                </Card.Content>
            </Card>

            <Divider style={{ marginVertical: 10 }} />

            {/* Danh mục */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 10 }}>
                {["Cơm gà", "Nước uống", "Gà rán", "Mỳ cay", "Pizza"].map((cat) => (
                    <Chip
                        key={cat}
                        style={{ marginRight: 8, backgroundColor: "#f6f6f6" }}
                        textStyle={{ fontWeight: "bold" }}
                    >
                        {cat}
                    </Chip>
                ))}
            </ScrollView>

            <Divider style={{ marginVertical: 10 }} />

            {/* Danh sách món */}
            <View style={{ paddingHorizontal: 10 }}>
                <Text variant="titleMedium" style={{ fontWeight: "bold", marginBottom: 8 }}>
                    Cơm gà
                </Text>

                {menu.map((item) => (
                    <Card key={item._id} style={{ marginBottom: 14, borderRadius: 10, elevation: 2 }}
                        onPress={() => router.push(`/(stack)/product/${item._id}`)}
                    >
                        <View style={{ flexDirection: "row" }}>
                            <Image
                                source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}/public/images/products/${item.image}` }}
                                style={{
                                    width: 100,
                                    height: 100,
                                    borderTopLeftRadius: 10,
                                    borderBottomLeftRadius: 10,
                                }}
                            />
                            <View style={{ flex: 1, padding: 10 }}>
                                <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
                                <Text style={{ color: "#555", fontSize: 13 }}>{item.description}</Text>
                                <Text style={{ color: "#999", marginTop: 2 }}>{item.sold} đã bán</Text>
                                <View
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        marginTop: 6,
                                    }}
                                >
                                    <Text style={{ fontWeight: "bold", color: "#ff6d00" }}>
                                        {item.basePrice.toLocaleString("vi-VN")}đ
                                    </Text>
                                    <IconButton icon="plus" size={22} iconColor="#ff6d00"
                                        onPress={() => handleAddPress(item)}
                                    />
                                </View>
                            </View>
                        </View>
                    </Card>
                ))}
            </View>
            <Snackbar
                visible={snackbar.visible}
                onDismiss={() => setSnackbar({ visible: false, message: "" })}
                duration={2500}
                style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
            >
                {snackbar.message}
            </Snackbar>
            {selectedProduct && (
                <ProductOptionsSheet
                    visible={visible}
                    onClose={() => setVisible(false)}
                    product={selectedProduct}
                    sizes={selectedProduct.sizes || []}
                    toppings={selectedProduct.toppings || []}
                    seller={seller!}
                />
            )}

        </ScrollView>
    );
}
