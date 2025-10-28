import { useRouter } from "expo-router";
import { FlatList, Image, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";

export interface IProduct {
    id: string;
    name: string;
    image: string;
    price: number;
}

interface ProductListProps {
    data: IProduct[];
    scrollEnabled: boolean
}

export default function ProductList({ data, scrollEnabled }: ProductListProps) {
    const router = useRouter();
    return (
        <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 12 }}
            scrollEnabled={scrollEnabled}
            renderItem={({ item }) => (
                <TouchableOpacity
                    onPress={() => router.push(`/(stack)/product/${item.id}`)}
                    style={{
                        flexDirection: "row",
                        backgroundColor: "#fff",
                        borderRadius: 10,
                        elevation: 1,
                        marginBottom: 12,
                        borderWidth: 0.5,
                        borderColor: "#eee",
                        overflow: "hidden",
                    }}
                >
                    <Image
                        source={{ uri: item.image }}
                        style={{ width: 90, height: 90, borderRadius: 6, margin: 10 }}
                    />

                    <View style={{ flex: 1, justifyContent: "center", paddingRight: 10 }}>
                        <Text
                            style={{ fontSize: 15, fontWeight: "600", color: "#222" }}
                            numberOfLines={2}
                        >
                            {item.name}
                        </Text>

                        <Text
                            style={{
                                color: "#ff6d00",
                                fontWeight: "bold",
                                fontSize: 14,
                                marginTop: 6,
                            }}
                        >
                            {item.price.toLocaleString("vi-VN")}₫
                        </Text>
                    </View>
                </TouchableOpacity>
            )}
        />
    );
}
