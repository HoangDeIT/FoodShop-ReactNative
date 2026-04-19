import { useCurrentApp } from "@/context/app.context";
import {
    checkCanCommentApi,
    deleteReplyApi,
    deleteReviewApi,
    getReviewsApi,
    postReplyApi,
    postReviewApi,
    uploadFile,
} from "@/utils/customer.api";
import { eventBus } from "@/utils/eventBus";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    Dimensions,
    Image,
    RefreshControl,
    ScrollView,
    View,
} from "react-native";
import {
    ActivityIndicator,
    Avatar,
    Button,
    Card,
    Divider,
    IconButton,
    List,
    Text,
    TextInput,
} from "react-native-paper";

const screenWidth = Dimensions.get("window").width;

interface ReviewSectionProps {
    productId: string;
}

interface LocalImage {
    uri: string;
    name: string;
    type: string;
}

export default function ReviewSection({ productId }: ReviewSectionProps) {
    const [reviews, setReviews] = useState<IReviewR[]>([]);
    const [canComment, setCanComment] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [replyTo, setReplyTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState("");
    const [images, setImages] = useState<LocalImage[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const { appState } = useCurrentApp();

    const ratingRef = useRef(0);
    const commentRef = useRef("");

    const setReviewRating = useCallback((value: number) => {
        ratingRef.current = value;
        setRating(value);
    }, []);

    const setReviewComment = useCallback((value: string) => {
        commentRef.current = value;
        setComment(value);
    }, []);

    const fetchReviews = useCallback(async () => {
        try {
            const res = await getReviewsApi(productId);
            setReviews(res.data ?? []);
        } catch (err) {
            console.error("❌ Lỗi tải review:", err);
        }
    }, [productId]);

    const checkCommentPermission = useCallback(async () => {
        try {
            const res = await checkCanCommentApi(productId);
            setCanComment(res.data?.canComment ?? false);
        } catch {
            setCanComment(false);
        }
    }, [productId]);

    const loadAll = useCallback(async () => {
        await Promise.all([fetchReviews(), checkCommentPermission()]);
    }, [checkCommentPermission, fetchReviews]);

    useEffect(() => {
        loadAll();
    }, [loadAll]);

    const handleSendComment = useCallback(async () => {
        const finalComment = commentRef.current.trim();
        const finalRating = ratingRef.current;

        if (!canComment) {
            alert("Bạn chưa thể đánh giá sản phẩm này ❌");
            return;
        }

        if (!finalComment || finalRating === 0) {
            alert("Vui lòng nhập nội dung và chọn sao 🌟");
            return;
        }

        try {
            setLoading(true);
            let uploadedNames: string[] = [];

            if (images.length > 0) {
                const res = await uploadFile(images, "reviews");
                uploadedNames = res.data?.fileName ?? [];
            }

            await postReviewApi({
                product: productId,
                order: "",
                rating: finalRating,
                comment: finalComment,
                images: uploadedNames,
            });

            setReviewComment("");
            setReviewRating(0);
            setImages([]);
            await loadAll();
        } catch (err) {
            console.error("❌ Lỗi gửi review:", err);
            alert("Không thể gửi đánh giá");
        } finally {
            setLoading(false);
        }
    }, [canComment, images, loadAll, productId, setReviewComment, setReviewRating]);

    useEffect(() => {
        const onSetReviewText = (payload: { productId: string; text: string }) => {
            if (payload.productId !== productId) return;
            setReviewComment(payload.text);
        };

        const onSetReviewRating = (payload: { productId: string; rating: number }) => {
            if (payload.productId !== productId) return;
            setReviewRating(payload.rating);
        };

        const onSubmitReview = async (payload: { productId: string }) => {
            if (payload.productId !== productId) return;
            await handleSendComment();
        };

        eventBus.on("SET_REVIEW_TEXT", onSetReviewText);
        eventBus.on("SET_REVIEW_RATING", onSetReviewRating);
        eventBus.on("SUBMIT_REVIEW", onSubmitReview);

        return () => {
            eventBus.off("SET_REVIEW_TEXT", onSetReviewText);
            eventBus.off("SET_REVIEW_RATING", onSetReviewRating);
            eventBus.off("SUBMIT_REVIEW", onSubmitReview);
        };
    }, [handleSendComment, productId, setReviewComment, setReviewRating]);

    const pickImages = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.7,
        });

        if (!result.canceled) {
            const selected = result.assets.map((asset) => {
                const uri = asset.uri;
                const name = uri.split("/").pop() ?? "photo.jpg";
                const match = /\.(\w+)$/.exec(name);
                const type = match ? `image/${match[1]}` : "image";
                return { uri, name, type };
            });
            setImages(selected);
        }
    };

    const handleReply = async (reviewId: string) => {
        if (!replyText.trim()) return;
        try {
            await postReplyApi(reviewId, { comment: replyText });
            setReplyText("");
            setReplyTo(null);
            await fetchReviews();
        } catch (err) {
            console.error("❌ Lỗi gửi phản hồi:", err);
            alert("Không thể gửi phản hồi");
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadAll();
        setRefreshing(false);
    };

    const handleDeleteReview = async (reviewId: string) => {
        try {
            await deleteReviewApi(reviewId);
            await fetchReviews();
        } catch (err) {
            console.error("❌ Lỗi xóa review:", err);
            alert("Không thể xóa đánh giá");
        }
    };

    const handleDeleteReply = async (reviewId: string, replyId: string) => {
        try {
            await deleteReplyApi(reviewId, replyId);
            await fetchReviews();
        } catch (err) {
            console.error("❌ Lỗi xóa phản hồi:", err);
            alert("Không thể xóa phản hồi");
        }
    };

    if (!reviews && !canComment) {
        return (
            <View style={{ padding: 16 }}>
                <ActivityIndicator />
            </View>
        );
    }

    return (
        <ScrollView
            contentContainerStyle={{ paddingBottom: 60 }}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {canComment && (
                <Card style={{ margin: 12, borderRadius: 16 }}>
                    <Card.Content>
                        <Text variant="titleMedium" style={{ fontWeight: "600" }}>
                            Viết đánh giá của bạn
                        </Text>

                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "center",
                                marginVertical: 10,
                            }}
                        >
                            {Array.from({ length: 5 }).map((_, i) => (
                                <IconButton
                                    key={i}
                                    icon={i < rating ? "star" : "star-outline"}
                                    iconColor={i < rating ? "#ffb300" : "#ccc"}
                                    size={32}
                                    onPress={() => setReviewRating(i + 1)}
                                />
                            ))}
                        </View>

                        <TextInput
                            mode="outlined"
                            placeholder="Nhập bình luận..."
                            value={comment}
                            onChangeText={setReviewComment}
                            multiline
                        />

                        <Button
                            icon="image"
                            mode="outlined"
                            style={{ marginTop: 8, borderColor: "#ff6d00" }}
                            textColor="#ff6d00"
                            onPress={pickImages}
                        >
                            Chọn ảnh
                        </Button>

                        {images.length > 0 && (
                            <View
                                style={{
                                    flexDirection: "row",
                                    flexWrap: "wrap",
                                    gap: 8,
                                    marginTop: 10,
                                    justifyContent: "center",
                                }}
                            >
                                {images.map((img, i) => (
                                    <Image
                                        key={i}
                                        source={{ uri: img.uri }}
                                        style={{
                                            width: screenWidth * 0.3,
                                            height: screenWidth * 0.3,
                                            borderRadius: 8,
                                        }}
                                    />
                                ))}
                            </View>
                        )}

                        <Button
                            mode="contained"
                            onPress={handleSendComment}
                            loading={loading}
                            style={{
                                marginTop: 12,
                                backgroundColor: "#ff6d00",
                                borderRadius: 8,
                            }}
                        >
                            Gửi đánh giá
                        </Button>
                    </Card.Content>
                </Card>
            )}

            <View style={{ paddingHorizontal: 12 }}>
                <Text variant="titleLarge" style={{ fontWeight: "700" }}>
                    Bình luận ({reviews.length})
                </Text>
            </View>

            {reviews.map((r) => (
                <Card key={r._id} style={{ margin: 12, borderRadius: 16 }}>
                    <List.Item
                        title={() => (
                            <View>
                                <Text style={{ fontWeight: "600", fontSize: 16 }}>
                                    {typeof r.user === "object" ? (r.user as IUser).name : "Ẩn danh"}
                                </Text>
                                <Text style={{ color: "gray", fontSize: 12 }}>
                                    {new Date(r.createdAt).toLocaleString("vi-VN")}
                                </Text>
                                <View style={{ flexDirection: "row", marginTop: 4 }}>
                                    {Array.from({ length: r.rating }).map((_, i) => (
                                        <IconButton
                                            key={i}
                                            icon="star"
                                            size={18}
                                            iconColor="#ffb300"
                                            style={{ margin: 0, padding: 0 }}
                                        />
                                    ))}
                                </View>
                            </View>
                        )}
                        left={() => (
                            <Avatar.Text
                                label={
                                    typeof r.user === "object"
                                        ? (r.user as IUser).name[0]
                                        : "?"
                                }
                                size={40}
                            />
                        )}
                        right={() =>
                            typeof r.user === "object" &&
                            r.user._id === appState?._id && (
                                <IconButton
                                    icon="delete"
                                    iconColor="#ff1744"
                                    size={22}
                                    onPress={() => handleDeleteReview(r._id)}
                                />
                            )
                        }
                    />

                    <Divider />
                    <View style={{ padding: 12 }}>
                        <Text>{r.comment}</Text>

                        {r.images?.length > 0 && (
                            <View
                                style={{
                                    flexDirection: "row",
                                    flexWrap: "wrap",
                                    gap: 8,
                                    marginTop: 8,
                                }}
                            >
                                {r.images.map((img, i) => (
                                    <Image
                                        key={i}
                                        source={{
                                            uri: `${process.env.EXPO_PUBLIC_API_URL}/public/images/reviews/${img}`,
                                        }}
                                        style={{
                                            width: screenWidth * 0.4,
                                            height: screenWidth * 0.4,
                                            borderRadius: 10,
                                        }}
                                        resizeMode="cover"
                                    />
                                ))}
                            </View>
                        )}

                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Button
                                icon="reply"
                                mode="text"
                                textColor="#ff6d00"
                                onPress={() => setReplyTo(replyTo === r._id ? null : r._id)}
                            >
                                Trả lời
                            </Button>
                        </View>

                        {replyTo === r._id && (
                            <View style={{ marginLeft: 20 }}>
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
                                        marginTop: 6,
                                        backgroundColor: "#ff6d00",
                                        borderRadius: 8,
                                        alignSelf: "flex-start",
                                    }}
                                    onPress={() => handleReply(r._id)}
                                >
                                    Gửi
                                </Button>
                            </View>
                        )}

                        {r.replies?.length > 0 && (
                            <View
                                style={{
                                    marginLeft: 40,
                                    marginTop: 8,
                                    borderLeftWidth: 2,
                                    borderLeftColor: "#ffe0b2",
                                    paddingLeft: 12,
                                }}
                            >
                                {r.replies.map((rep) => (
                                    <View
                                        key={rep._id}
                                        style={{
                                            marginBottom: 6,
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            alignItems: "flex-start",
                                        }}
                                    >
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontWeight: "600", color: "#ff6d00" }}>
                                                {typeof rep.user === "object"
                                                    ? (rep.user as IUser).name
                                                    : "Ẩn danh"}
                                            </Text>
                                            <Text>{rep.comment}</Text>
                                            <Text style={{ color: "gray", fontSize: 12 }}>
                                                {new Date(rep.createdAt).toLocaleString("vi-VN")}
                                            </Text>
                                        </View>

                                        {typeof rep.user === "object" &&
                                            rep.user._id === appState?._id && (
                                                <IconButton
                                                    icon="delete"
                                                    iconColor="#ff1744"
                                                    size={20}
                                                    onPress={() => handleDeleteReply(r._id, rep._id)}
                                                />
                                            )}
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                </Card>
            ))}
        </ScrollView>
    );
}
