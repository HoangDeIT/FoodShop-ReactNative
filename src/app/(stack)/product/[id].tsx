import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Image, ScrollView, View } from "react-native";
import {
    Avatar,
    Button,
    Card,
    Chip,
    Divider,
    IconButton,
    List,
    Text,
    TextInput
} from "react-native-paper";
const mockData = {
    name: "Pizza Hải Sản",
    price: 60000,
    sold: "200+",
    likes: 3,
    image:
        "https://images.unsplash.com/photo-1548365328-9f547fb095f4?q=80&w=1880&auto=format&fit=crop",
    reviews: [
        {
            id: "1",
            user: "Ẩn Danh",
            rating: 5,
            content: "Pizza ngon nóng hổi luôn, nhiều topping. Giao hàng nhanh.",
            time: "14-02-2025 19:59",
            photo:
                "https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=1200&auto=format&fit=crop",
            replies: [
                {
                    id: "r1",
                    user: "Chủ quán",
                    content: "Cảm ơn bạn đã ủng hộ quán nhé ❤️",
                    time: "15-02-2025 08:21",
                },
            ],
        },
    ],
};

export default function ProductDetailScreen() {
    const [qty, setQty] = useState(1);
    const [liked, setLiked] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [reviews, setReviews] = useState(mockData.reviews);
    const [replyTo, setReplyTo] = useState<string | null>(null); // id của bình luận đang trả lời
    const [replyText, setReplyText] = useState("");
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [showSheet, setShowSheet] = useState(false)
    const currency = (v: number) =>
        v.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

    const handleSendComment = () => {
        if (!comment.trim()) return;
        const newReview = {
            id: Date.now().toString(),
            user: "Bạn",
            rating,
            content: comment,
            time: new Date().toLocaleString("vi-VN"),
            photo: "",
            replies: [],
        };
        setReviews((prev) => [newReview, ...prev]);
        setComment("");
        setRating(0);
    };
    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };
    const handleReply = (id: string) => {
        if (!replyText.trim()) return;
        setReviews((prev) =>
            prev.map((r) =>
                r.id === id
                    ? {
                        ...r,
                        replies: [
                            ...r.replies,
                            {
                                id: Date.now().toString(),
                                user: "Bạn",
                                content: replyText,
                                time: new Date().toLocaleString("vi-VN"),
                            },
                        ],
                    }
                    : r
            )
        );
        setReplyTo(null);
        setReplyText("");
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>


            <ScrollView
                contentContainerStyle={{ paddingBottom: 180 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero image */}
                <Card style={{ margin: 12, borderRadius: 16 }}>
                    <Card.Cover source={{ uri: mockData.image }} />
                    <Card.Content style={{ paddingVertical: 12 }}>
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                            }}
                        >
                            <Text variant="titleLarge" style={{ fontWeight: "700", flex: 1 }}>
                                {mockData.name}
                            </Text>

                            {/* <IconButton
                                icon={liked ? "heart" : "heart-outline"}
                                iconColor={liked ? "#ff6d00" : "#999"}
                                size={28}
                                onPress={() => setLiked((v) => !v)}
                            /> */}
                        </View>

                        <View
                            style={{
                                flexDirection: "row",
                                gap: 8,
                                marginTop: 8,
                                flexWrap: "wrap",
                            }}
                        >
                            <Chip icon="fire" compact>
                                {mockData.sold} đã bán
                            </Chip>
                            <Chip icon="thumb-up" compact>
                                {mockData.likes} lượt thích
                            </Chip>
                        </View>

                        <View
                            style={{
                                marginTop: 12,
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <Text
                                variant="headlineSmall"
                                style={{
                                    fontWeight: "800",
                                    color: "#ff6d00",
                                }}
                            >
                                {currency(mockData.price)}
                            </Text>

                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <IconButton
                                    icon="minus"
                                    mode="contained-tonal"
                                    onPress={() => setQty((q) => Math.max(1, q - 1))}
                                />
                                <Text
                                    variant="titleMedium"
                                    style={{ width: 32, textAlign: "center" }}
                                >
                                    {qty}
                                </Text>
                                <IconButton
                                    icon="plus"
                                    mode="contained"
                                    onPress={() => setQty((q) => q + 1)}
                                />
                            </View>
                        </View>
                    </Card.Content>
                </Card>

                {/* Nhập bình luận mới */}
                <Card style={{ margin: 12, borderRadius: 16 }}>
                    <Card.Content>
                        <Text
                            variant="titleMedium"
                            style={{ fontWeight: "600", marginBottom: 8 }}
                        >
                            Viết bình luận của bạn
                        </Text>

                        {/* Chọn sao */}
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "center",
                                marginBottom: 12,
                            }}
                        >
                            {Array.from({ length: 5 }).map((_, i) => (
                                <IconButton
                                    key={i}
                                    icon={i < rating ? "star" : "star-outline"}
                                    iconColor={i < rating ? "#ffb300" : "#ccc"}
                                    size={32}
                                    onPress={() => setRating(i + 1)}
                                />
                            ))}
                        </View>

                        {/* Ô nhập bình luận */}
                        <TextInput
                            mode="outlined"
                            placeholder="Nhập bình luận..."
                            value={comment}
                            onChangeText={setComment}
                            multiline
                            style={{
                                backgroundColor: "#fafafa",
                                borderRadius: 8,
                                fontSize: 15,
                            }}
                        />

                        {/* Nút chọn ảnh */}
                        <Button
                            icon="image"
                            mode="outlined"
                            textColor="#ff6d00"
                            style={{
                                marginTop: 10,
                                borderColor: "#ff6d00",
                                borderRadius: 8,
                                alignSelf: "flex-start",
                            }}
                            onPress={pickImage}
                        >
                            Chọn ảnh
                        </Button>

                        {/* Preview ảnh + nút xóa */}
                        {imageUri && (
                            <View
                                style={{
                                    marginTop: 12,
                                    alignSelf: "flex-start",
                                    position: "relative",
                                }}
                            >
                                <Image
                                    source={{ uri: imageUri }}
                                    style={{
                                        width: 120,
                                        height: 120,
                                        borderRadius: 12,
                                        backgroundColor: "#eee",
                                    }}
                                />
                                <IconButton
                                    icon="close-circle"
                                    size={22}
                                    iconColor="#ff6d00"
                                    style={{
                                        position: "absolute",
                                        top: -10,
                                        right: -10,
                                        backgroundColor: "white",
                                        elevation: 3,
                                    }}
                                    onPress={() => setImageUri(null)}
                                />
                            </View>
                        )}

                        {/* Nút gửi */}
                        <Button
                            mode="contained"
                            style={{
                                marginTop: 16,
                                backgroundColor: "#ff6d00",
                                borderRadius: 12,
                                paddingVertical: 6,
                            }}
                            labelStyle={{ fontWeight: "600", fontSize: 16 }}
                            onPress={handleSendComment}
                        >
                            Gửi bình luận
                        </Button>
                    </Card.Content>
                </Card>

                {/* Danh sách bình luận */}
                <View style={{ paddingHorizontal: 12 }}>
                    <Text variant="titleLarge" style={{ fontWeight: "700" }}>
                        Bình luận ({reviews.length})
                    </Text>
                </View>

                {reviews.map((review) => (
                    <Card
                        key={review.id}
                        style={{ margin: 12, borderRadius: 16, backgroundColor: "#fff" }}
                    >
                        <List.Item
                            title={review.user}
                            description={review.time}
                            left={() => (
                                <Avatar.Text size={40} label={review.user[0]} style={{ marginTop: 6 }} />
                            )}
                            right={() => (
                                <View style={{ flexDirection: "row" }}>
                                    {Array.from({ length: review.rating }).map((_, i) => (
                                        <IconButton key={i} icon="star" size={18} iconColor="#ffb300" />
                                    ))}
                                </View>
                            )}
                        />
                        <Divider />
                        <View style={{ padding: 12, gap: 10 }}>
                            <Text>{review.content}</Text>
                            {review.photo ? (
                                <Image
                                    source={{ uri: review.photo }}
                                    style={{
                                        width: "100%",
                                        height: 160,
                                        borderRadius: 12,
                                        backgroundColor: "#eee",
                                    }}
                                    resizeMode="cover"
                                />
                            ) : null}

                            {/* Nút trả lời */}
                            <Button
                                mode="text"
                                icon="reply"
                                textColor="#ff6d00"
                                onPress={() =>
                                    setReplyTo(replyTo === review.id ? null : review.id)
                                }
                            >
                                Trả lời
                            </Button>

                            {/* Form nhập trả lời */}
                            {replyTo === review.id && (
                                <View style={{ marginLeft: 32, marginTop: 6 }}>
                                    <TextInput
                                        mode="outlined"
                                        placeholder="Nhập phản hồi..."
                                        value={replyText}
                                        onChangeText={setReplyText}
                                        multiline
                                    />
                                    <Button
                                        mode="contained"
                                        style={{
                                            backgroundColor: "#ff6d00",
                                            marginTop: 6,
                                            alignSelf: "flex-start",
                                            borderRadius: 8,
                                        }}
                                        onPress={() => handleReply(review.id)}
                                    >
                                        Gửi trả lời
                                    </Button>
                                </View>
                            )}

                            {/* Danh sách trả lời */}
                            {review.replies?.length > 0 && (
                                <View
                                    style={{
                                        marginLeft: 40,
                                        marginTop: 4,
                                        borderLeftWidth: 2,
                                        borderLeftColor: "#ffe0b2",
                                        paddingLeft: 12,
                                    }}
                                >
                                    {review.replies.map((r) => (
                                        <View key={r.id} style={{ marginBottom: 8 }}>
                                            <Text
                                                variant="titleSmall"
                                                style={{ fontWeight: "600", color: "#ff6d00" }}
                                            >
                                                {r.user}
                                            </Text>
                                            <Text variant="bodyMedium">{r.content}</Text>
                                            <Text
                                                variant="bodySmall"
                                                style={{ color: "gray", marginTop: 2 }}
                                            >
                                                {r.time}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    </Card>
                ))}

            </ScrollView>

            {/* Bottom CTA */}
            <View
                style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    padding: 12,
                    backgroundColor: "#fff",
                    borderTopWidth: 0.5,
                    borderColor: "#e8e8e8",
                }}
            >
                <Button
                    mode="contained"
                    icon="cart"
                    style={{
                        borderRadius: 12,
                        backgroundColor: "#ff6d00",
                        paddingVertical: 6,
                    }}
                    labelStyle={{ fontSize: 16, fontWeight: "600" }}
                    onPress={() => {
                        console.log("Add to cart");
                        setShowSheet(true);
                    }}
                >
                    Thêm vào giỏ • {currency(mockData.price * qty)}
                </Button>
            </View>
            {/* <Portal>
                <ProductOptionsSheet
                    visible={showSheet}
                    onClose={() => setShowSheet(false)}
                    product={{ name: "Cơm gà xối mỡ", image: "https://example.com/com-ga.jpg", basePrice: 50000 }}
                    sizes={[
                        { _id: "s", name: "Nhỏ", price: 0 },
                        { _id: "m", name: "Vừa", price: 5000 },
                        { _id: "l", name: "Lớn", price: 10000 },
                    ]}
                    toppings={[
                        { _id: "1", name: "Trứng chiên", price: 5000 },
                        { _id: "2", name: "Cơm thêm", price: 10000 },
                        { _id: "3", name: "Lạp xưởng", price: 15000 },
                        { _id: "4", name: "Rau trộn", price: 10000 },
                    ]}
                />
            </Portal> */}
        </View>
    );
}
