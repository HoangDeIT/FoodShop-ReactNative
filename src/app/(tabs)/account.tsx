import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import * as SQLite from "expo-sqlite";
import { Alert, ScrollView, View } from "react-native";
import { Avatar, Divider, List, Text } from "react-native-paper";
export default function AccountScreen() {
    const router = useRouter();
    const handleLogout = () => {
        Alert.alert("Đăng xuất", "Bạn chắc chắn đăng xuất người dùng ?", [
            { text: "Hủy", style: "cancel" },
            {
                text: "Xác nhận",
                onPress: async () => {
                    await AsyncStorage.clear();
                    const db = await SQLite.openDatabaseAsync("app.db");
                    await db.execAsync("DELETE FROM cart_items;");
                    await db.execAsync("DELETE FROM cart_shops;");

                    router.replace("/(auth)/login");
                },
            },
        ]);
    };
    return (
        <ScrollView style={{ flex: 1, backgroundColor: "#fff" }}>
            <View style={{ alignItems: "center", marginTop: 20 }}>
                <Avatar.Image
                    size={80}
                    source={{ uri: "https://i.pravatar.cc/150?img=12" }}
                />
                <Text style={{ fontSize: 18, fontWeight: "bold", marginTop: 10 }}>
                    Nguyễn Hoàng Đệ
                </Text>
                <Text style={{ color: "#777" }}>hoangde@example.com</Text>
            </View>

            <Divider style={{ marginVertical: 20 }} />

            <List.Item
                title="Thông tin cá nhân"
                left={(props) => <List.Icon {...props} icon="account-edit" />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
            />
            <List.Item
                title="Phương thức thanh toán"
                left={(props) => <List.Icon {...props} icon="credit-card" />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
            />
            <List.Item
                title="Trung tâm trợ giúp"
                left={(props) => <List.Icon {...props} icon="help-circle" />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
            />
            <List.Item
                title="Dev option"
                onPress={() => router.push("/(stack)/dev")}
                left={(props) => <List.Icon {...props} icon="code-tags" color="#ff3b30" />}
            />
            <List.Item
                title="Đăng xuất"
                onPress={() => handleLogout()}
                left={(props) => <List.Icon {...props} icon="logout" color="#ff6d00" />}
            />
        </ScrollView>
    );
}
