import { Image, View } from "react-native";
import { Text } from "react-native-paper";

export default function MessageStoreList({ data }: any) {
    return (
        <View>
            <Text style={{ marginBottom: 4, color: "#000" }}>{data.message}</Text>
            {data.data?.map((store: any, i: number) => (
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
                            uri: `${process.env.EXPO_PUBLIC_API_URL}/public/images/users/${store.shopAvatar}`,
                        }}
                        style={{ width: 45, height: 45, borderRadius: 6, marginRight: 8 }}
                    />
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: "bold" }}>{store.shopName}</Text>
                        <Text numberOfLines={2} style={{ color: "#666", fontSize: 12 }}>
                            {store.description}
                        </Text>
                        <Text style={{ color: "#888", fontSize: 12 }}>📍 {store.address}</Text>
                        <Text style={{ color: "#999", fontSize: 12 }}>
                            🚶‍♂️ Cách {store.distanceKm} km
                        </Text>
                    </View>
                </View>
            ))}
        </View>
    );
}
