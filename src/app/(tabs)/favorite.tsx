import { getLikesByUser, unLikeShopApi } from "@/utils/customer.api";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, TouchableOpacity, View } from "react-native";
import { ActivityIndicator, Card, IconButton, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";



type IUserWithDistance = IUser & ISellerProfile & { distance: number }

export default function FavoriteScreen() {
    const [shops, setShops] = useState<IUserWithDistance[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const pageSize = 10;

    const fetchFavorites = useCallback(
        async (pageNumber = 1, replace = false) => {
            if (loading) return;
            setLoading(true);
            try {
                const res = await getLikesByUser(pageNumber, pageSize);
                const { result, meta } = res.data as IModelPaginate<IUserWithDistance>;
                if (replace) {
                    setShops(result);
                } else {
                    setShops((prev) => [...prev, ...result]);
                }
                setHasMore(meta.current < meta.pages);
            } catch (err) {
                console.error("❌ Lỗi khi tải danh sách yêu thích:", err);
            } finally {
                setLoading(false);
            }
        },
        [loading]
    );

    // Lần đầu load
    useEffect(() => {
        fetchFavorites(1, true);
    }, []);

    // Kéo để refresh
    const onRefresh = async () => {
        setRefreshing(true);
        setPage(1);
        await fetchFavorites(1, true);
        setRefreshing(false);
    };

    // Load thêm khi scroll
    const loadMore = async () => {
        if (loading || !hasMore) return;
        const nextPage = page + 1;
        setPage(nextPage);
        await fetchFavorites(nextPage);
    };

    // Render từng item
    const renderItem = ({ item }: { item: IUserWithDistance }) => (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push(`/(stack)/shop/${item._id}`)}
        >
            <Card key={item._id} style={{ marginBottom: 12 }

            }>
                <Card.Cover
                    source={{
                        uri: `${process.env.EXPO_PUBLIC_API_URL}/public/images/users/${item.avatar}`,
                    }}
                />
                <Card.Title
                    title={item.name}
                    subtitle={
                        item.distance
                            ? `Cách bạn ${item.distance.toFixed(2)} km`
                            : "Không xác định khoảng cách"
                    }
                    right={() => (
                        <IconButton
                            icon="heart"
                            iconColor="#ff6d00"
                            onPress={async () => {
                                await unLikeShopApi(item._id);
                                await fetchFavorites(1, true);
                            }}
                        />

                    )}
                />
            </Card>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
            <View style={{ paddingHorizontal: 12, paddingTop: 8 }}>
                <Text
                    variant="titleLarge"
                    style={{ fontWeight: "bold", marginBottom: 12 }}
                >
                    Yêu thích của bạn
                </Text>
            </View>

            <FlatList
                data={shops}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={{ paddingHorizontal: 12 }}
                onEndReached={loadMore}
                onEndReachedThreshold={0.3}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListFooterComponent={
                    loading ? (
                        <ActivityIndicator
                            style={{ marginVertical: 16 }}
                            animating={true}
                        />
                    ) : null
                }
                ListEmptyComponent={
                    !loading ? (
                        <Text style={{ textAlign: "center", marginTop: 40 }}>
                            Bạn chưa thích quán nào cả 😢
                        </Text>
                    ) : null
                }

            />
        </SafeAreaView>
    );
}
