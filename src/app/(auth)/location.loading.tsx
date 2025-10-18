import { useCurrentApp } from "@/context/app.context";
import { updateLocationApi } from "@/utils/api.auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function LocationLoading() {
    const router = useRouter();
    const { setAppState } = useCurrentApp();
    const [message, setMessage] = useState("🔍 Đang tìm vị trí của bạn...");
    useEffect(() => {
        (async () => {
            try {
                // 1️⃣ Xin quyền truy cập vị trí
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== "granted") {
                    setMessage("⚠️ Không có quyền truy cập vị trí.");
                    setTimeout(() => router.replace("/(tabs)"), 1500);
                    return;
                }

                // 2️⃣ Lấy vị trí hiện tại
                const pos = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High,
                });

                // 3️⃣ Lấy tên địa chỉ (reverse geocode)
                const [addr] = await Location.reverseGeocodeAsync({
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                });

                const address =
                    addr.formattedAddress ||
                    [
                        addr.name,
                        addr.street,
                        addr.subregion, // Quận, Huyện
                        addr.region,    // Tỉnh, Thành phố
                        addr.country,   // Quốc gia
                    ]
                        .filter(Boolean)
                        .join(", ");

                console.log("📍 Final address:", address);

                // 🟢 Gửi API cập nhật vị trí
                const payload = {
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                    address,
                };

                const res = await updateLocationApi(payload);
                console.log("Update location response:", res);
                if (!res.error && res.data) {
                    setMessage(`✅ Cập nhật vị trí thành công: ${address}`);
                    setAppState({
                        ...res.data,
                        access_token: await AsyncStorage.getItem("access_token") ?? ""
                    })
                } else {
                    setMessage("⚠️ Không thể cập nhật vị trí.");
                }

                // 5️⃣ Giữ 1 giây rồi chuyển qua trang chính
                setTimeout(() => router.replace("/(tabs)"), 1500);
            } catch (err) {
                console.log("Location error:", err);
                setMessage("❌ Không thể lấy hoặc gửi vị trí");
                setTimeout(() => router.replace("/(tabs)"), 1500);
            }
        })();
    }, []);
    return (
        <View style={styles.container}>
            {/* <Image
                source={require("@/assets/images/map-pin.png")} // 👉 thay bằng hình của bạn
                style={{ width: 120, height: 120, tintColor: "#ff6d00", marginBottom: 20 }}
            /> */}
            <Text style={styles.text}>{message}</Text>
            <ActivityIndicator size="large" color="#ff6d00" style={{ marginTop: 20 }} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
    },
    text: {
        fontSize: 16,
        color: "#555",
        textAlign: "center",
    },
});
