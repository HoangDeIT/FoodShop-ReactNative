import ChangePasswordModal from "@/components/account/change.password.mocal";
import EditProfileModal from "@/components/account/edit.profile.modal";
import { getProfileApi } from "@/utils/customer.api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import * as SQLite from "expo-sqlite";
import { useEffect, useState } from "react";
import { Alert, RefreshControl, ScrollView, View } from "react-native";
import { Avatar, Divider, List, Text } from "react-native-paper";
export default function AccountScreen() {
    const router = useRouter();
    const [user, setUser] = useState<IUserR | null>(null);
    const [openEdit, setOpenEdit] = useState(false);
    const [openChangePass, setOpenChangePass] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const refreshUser = async () => {
        setRefreshing(true);
        try {
            const res = await getProfileApi();
            setUser(res.data!);
        } catch (err) {
            console.error("Load profile error:", err);
        } finally {
            setRefreshing(false);
        }
    };
    useEffect(() => {


        refreshUser();
    }, []);
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
        <ScrollView style={{ flex: 1, backgroundColor: "#fff" }}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={refreshUser}
                    colors={['#4CAF50']} // 🎨 màu xoay vòng trên Android
                    tintColor="#4CAF50"  // 🎨 màu spinner trên iOS
                    title="Đang làm mới..." // hiển thị text trên iOS
                />
            }
        >
            <View style={{ alignItems: "center", marginTop: 20 }}>
                <Avatar.Image
                    size={80}
                    source={{
                        uri:
                            user?.user.avatar
                                ? `${process.env.EXPO_PUBLIC_API_URL}/public/images/users/${user.user.avatar}`
                                : "https://i.pravatar.cc/150?img=12", // fallback
                    }}
                />

                <Text style={{ fontSize: 18, fontWeight: "bold", marginTop: 10 }}>
                    {user?.user.name || "Người dùng"}
                </Text>

                <Text style={{ color: "#777" }}>
                    {user?.user.email || "No email"}
                </Text>
            </View>


            <Divider style={{ marginVertical: 20 }} />
            <List.Item
                title="Thông tin cá nhân"
                onPress={() => setOpenEdit(true)} // 👈 thêm dòng này
                left={(props) => <List.Icon {...props} icon="account-edit" />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
            />

            <List.Item
                title="Đổi mật khẩu"
                onPress={() => setOpenChangePass(true)} // 👈 thêm dòng này
                left={(props) => <List.Icon {...props} icon="lock-reset" />}
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
            <EditProfileModal
                visible={openEdit}
                onClose={() => setOpenEdit(false)}
                user={user?.user!}
                onUpdated={refreshUser}
            />

            <ChangePasswordModal
                visible={openChangePass}
                onClose={() => setOpenChangePass(false)}
            />
        </ScrollView>
    );
}
