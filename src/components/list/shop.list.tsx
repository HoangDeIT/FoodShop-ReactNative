import { useRouter } from "expo-router";
import { useEffect } from "react";
import { FlatList, Image, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";

export interface IShop {
    _id: string;
    name: string;
    image: string;
    rating: string;
    distance: string;
    time: string;
}

interface ShopListProps {
    data: IShop[];
}

export default function ShopList({ data }: ShopListProps) {
    const router = useRouter();
    useEffect(() => { console.log("Check ShopList", data) }, []);
    return (
        <FlatList
            data={data}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{ padding: 12 }}
            scrollEnabled={false}
            renderItem={({ item }) => (
                <TouchableOpacity
                    onPress={() => router.push(`/(stack)/shop/${item._id}`)}
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
                        source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}/public/images/users/${item.image}` }}
                        style={{ width: 90, height: 90, borderRadius: 6, margin: 10 }}
                    />

                    <View style={{ flex: 1, justifyContent: "center", paddingRight: 10 }}>
                        <Text
                            style={{ fontSize: 15, fontWeight: "600", color: "#222" }}
                            numberOfLines={2}
                        >
                            {item.name}
                        </Text>

                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginTop: 4,
                            }}
                        >
                            <Text style={{ fontSize: 12, color: "#777" }}>⭐ {item.rating}</Text>
                            <Text style={{ fontSize: 12, color: "#777", marginLeft: 8 }}>
                                {item.distance}
                            </Text>
                            <Text style={{ fontSize: 12, color: "#777", marginLeft: 8 }}>
                                {item.time}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            )}
        />
    );
}
