import ReviewSection from "@/components/product_detail/product.detail.review";
import ProductOptionsSheet from "@/components/products/product.option.sheet";
import { addToCart } from "@/db/services/cartService";
import { getProductById } from "@/utils/customer.api";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Dimensions, ScrollView, TouchableOpacity, View } from "react-native";
import { Button, Card, Chip, Snackbar, Text } from "react-native-paper";

const screenWidth = Dimensions.get("window").width;

export default function ProductDetailScreen() {
    const { id } = useLocalSearchParams();
    const [product, setProduct] = useState<IProductR>();
    const [qty, setQty] = useState(1);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ visible: false, message: "" });

    // 🟢 option sheet state
    const [visible, setVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<IProductR | null>(null);

    const productId = id as string;

    const currency = (v: number) =>
        v.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

    // 🔹 Lấy sản phẩm
    useEffect(() => {
        fetchProduct();
    }, []);

    const fetchProduct = async () => {
        try {
            const res = await getProductById(productId);
            setProduct(res.data);
        } catch (err) {
            console.error("❌ Lỗi tải sản phẩm:", err);
        }
    };

    // 🛒 Thêm giỏ hàng (mặc định)
    const handleAddToCart = async () => {
        if (!product) return;

        // ⚡ Nếu có size hoặc topping thì mở sheet
        const hasOptions =
            (product.sizes && product.sizes.length > 0) ||
            (product.toppings && product.toppings.length > 0);

        if (hasOptions) {
            setSelectedProduct(product);
            setVisible(true);
            console.log("moc sheet");
            return
        }

        try {
            setLoading(true);
            const seller = product.seller as IUser;

            await addToCart({
                shopId: seller._id,
                shopName: seller.name,
                productId: product._id,
                productName: product.name,
                basePrice: product.basePrice,
                quantity: qty,
                image: product.image,
                sizeId: null,
                sizeName: "",
                toppingIds: [],
                toppingNames: [],
                note: "",
                sizePrice: 0,
                toppingPrice: 0,

            });

            setSnackbar({ visible: true, message: `Đã thêm "${product.name}" vào giỏ 🛒` });
        } catch (err) {
            console.error("❌ Lỗi thêm giỏ hàng:", err);
            setSnackbar({ visible: true, message: "Không thể thêm giỏ hàng ❌" });
        } finally {
            setLoading(false);
        }
    };

    // 🔢 Tăng giảm số lượng
    const handleIncrease = () => setQty((q) => q + 1);
    const handleDecrease = () => setQty((q) => (q > 1 ? q - 1 : 1));


    if (!product)
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text>Đang tải sản phẩm...</Text>
            </View>
        );

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <ScrollView contentContainerStyle={{ paddingBottom: 150 }}>
                {/* Ảnh và thông tin sản phẩm */}
                <Card style={{ margin: 12, borderRadius: 16 }}>
                    <Card.Cover
                        source={{
                            uri: `${process.env.EXPO_PUBLIC_API_URL}/public/images/products/${product.image}`,
                        }}
                        style={{ width: "100%", height: screenWidth * 0.6 }}
                        resizeMode="cover"
                    />
                    <Card.Content style={{ paddingVertical: 12 }}>
                        <Text variant="titleLarge" style={{ fontWeight: "700" }}>
                            {product.name}
                        </Text>
                        <Chip icon="fire" compact style={{ marginTop: 8 }}>
                            {product.sold ?? 1} đã bán
                        </Chip>
                        <Text
                            variant="headlineSmall"
                            style={{ color: "#ff6d00", fontWeight: "800", marginTop: 8 }}
                        >
                            {currency(product.basePrice)}
                        </Text>
                    </Card.Content>
                </Card>

                {/* 🔸 Review section */}
                <ReviewSection productId={productId} />

            </ScrollView>
            {selectedProduct && (
                <ProductOptionsSheet
                    visible={visible}
                    onClose={() => setVisible(false)}
                    product={selectedProduct}
                    sizes={selectedProduct.sizes || []}
                    toppings={selectedProduct.toppings || []}
                    seller={selectedProduct.seller as IUser}
                />
            )}
            {/* 🧡 Thanh thêm giỏ hàng */}
            <View
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: "#fff",
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderTopWidth: 0.5,
                    borderColor: "#eee",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                }}
            >
                {/* Nút tăng giảm */}
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TouchableOpacity
                        onPress={handleDecrease}
                        style={{
                            borderWidth: 1,
                            borderColor: "#ccc",
                            paddingHorizontal: 10,
                            borderRadius: 6,
                        }}
                    >
                        <Text style={{ fontSize: 18 }}>−</Text>
                    </TouchableOpacity>

                    <Text style={{ marginHorizontal: 14, fontSize: 16, fontWeight: "600" }}>
                        {qty}
                    </Text>

                    <TouchableOpacity
                        onPress={handleIncrease}
                        style={{
                            borderWidth: 1,
                            borderColor: "#ccc",
                            paddingHorizontal: 10,
                            borderRadius: 6,
                        }}
                    >
                        <Text style={{ fontSize: 18 }}>＋</Text>
                    </TouchableOpacity>
                </View>

                {/* Nút thêm giỏ hàng */}
                <Button
                    mode="contained"
                    icon="cart"
                    style={{
                        flex: 1,
                        borderRadius: 10,
                        backgroundColor: "#ff6d00",
                        paddingVertical: 6,
                    }}
                    labelStyle={{ fontSize: 16, fontWeight: "600" }}
                    loading={loading}
                    onPress={handleAddToCart}
                >
                    {`Thêm vào giỏ • ${currency(product.basePrice * qty)}`}
                </Button>
            </View>

            {/* Snackbar */}
            <Snackbar
                visible={snackbar.visible}
                onDismiss={() => setSnackbar({ visible: false, message: "" })}
                duration={2500}
            >
                {snackbar.message}
            </Snackbar>

            {/* 🧾 Product Option Sheet */}

        </View>
    );
}
