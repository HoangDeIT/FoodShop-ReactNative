import { Image, View } from "react-native";
import { Text } from "react-native-paper";

export default function MessageProductList({ data }: any) {
    console.log(data);
    return (
        <View>
            <Text style={{ marginBottom: 4, color: "#000" }}>{data.message}</Text>
            {data.data?.map((p: any, i: number) => (
                <View
                    key={i}
                    style={{
                        backgroundColor: "#fff",
                        borderRadius: 10,
                        padding: 8,
                        marginBottom: 8,
                        shadowColor: "#000",
                        shadowOpacity: 0.05,
                        shadowRadius: 3,
                        elevation: 1,
                        flexDirection: "row",
                    }}
                >
                    <Image
                        source={{
                            uri: `${process.env.EXPO_PUBLIC_API_URL}/public/images/products/${p.productImage}`,
                        }}
                        style={{ width: 70, height: 70, borderRadius: 6, marginRight: 8 }}
                    />
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: "bold" }}>{p.productName}</Text>
                        <Text style={{ color: "#888", fontSize: 12 }}>🏪 {p.shopName}</Text>
                        <Text style={{ color: "#999", fontSize: 12 }}>📍 {p.address}</Text>
                        <Text style={{ color: "#0b93f6", fontWeight: "bold" }}>
                            💰 {p.price.toLocaleString()}đ
                        </Text>
                        <Text style={{ color: "#999", fontSize: 12 }}>
                            🚶‍♂️ {p.distanceKm} km
                        </Text>
                    </View>
                </View>
            ))}
        </View>
    );
}
