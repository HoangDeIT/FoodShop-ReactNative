import { useRouter } from "expo-router";
import { FlatList, Image, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";

export interface IProductItem {
    id: string;
    name: string;
    image: string;
    price: number;
}

interface ProductHorizontalListProps {
    title: string;
    subtitle?: string;
    data: IProductItem[];
    onSeeAll?: () => void;
}

export default function ProductHorizontalList({
    title,
    subtitle,
    data,
    onSeeAll,
}: ProductHorizontalListProps) {
    const router = useRouter();

    return (
        <View
            style={{
                backgroundColor: "#fff",
                borderRadius: 10,
                marginHorizontal: 12,
                marginTop: 12,
                padding: 12,
            }}
        >
            {/* Header */}
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <Text style={{ fontWeight: "bold", fontSize: 16, color: "#ff6d00" }}>
                    {title}
                </Text>
                {/* <TouchableOpacity onPress={onSeeAll}>
                    <Text style={{ color: "#555" }}>Xem tất cả ›</Text>
                </TouchableOpacity> */}
            </View>

            {subtitle && (
                <Text
                    style={{
                        color: "#777",
                        marginTop: 2,
                        marginBottom: 8,
                        fontSize: 13,
                    }}
                >
                    {subtitle}
                </Text>
            )}

            {/* Product list */}
            <FlatList
                data={data}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() =>
                            router.push({
                                pathname: "/(stack)/product/[id]",
                                params: { id: item.id },
                            })
                        }
                        style={{
                            width: 150,
                            marginRight: 12,
                        }}
                    >
                        <Image
                            source={{ uri: item.image }}
                            style={{
                                width: "100%",
                                height: 100,
                                borderRadius: 10,
                                backgroundColor: "#f0f0f0",
                            }}
                        />

                        <Text
                            style={{
                                fontSize: 13,
                                fontWeight: "600",
                                marginTop: 6,
                                color: "#333",
                            }}
                            numberOfLines={2}
                        >
                            {item.name}
                        </Text>

                        <Text
                            style={{
                                color: "#ff6d00",
                                fontSize: 13,
                                fontWeight: "bold",
                                marginTop: 4,
                            }}
                        >
                            {item.price.toLocaleString("vi-VN")}₫
                        </Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}
