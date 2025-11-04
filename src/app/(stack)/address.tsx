import AutoAddress from "@/components/address/auto.address";
import MapAddress from "@/components/address/map.address";
import SearchAddress from "@/components/address/search.address";
import { useCurrentApp } from "@/context/app.context";
import { updateLocationApi } from "@/utils/api.auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, SegmentedButtons, useTheme } from "react-native-paper";
export default function AddressScreen() {
    const router = useRouter();
    const theme = useTheme();
    const { setAppState, appState } = useCurrentApp();

    const [method, setMethod] = React.useState("auto");
    const [address, setAddress] = React.useState("");
    const [lat, setLat] = React.useState("");
    const [lng, setLng] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState("");
    React.useEffect(() => {
        const location = appState?.location;
        if (location) {
            setAddress(location.address ?? "");
            setLat(location.latitude?.toString() ?? "");
            setLng(location.longitude?.toString() ?? "");
        } else {
            // nếu chưa có location (null hoặc undefined) => reset rỗng
            setAddress("");
            setLat("");
            setLng("");
        }
    }, []);
    // 🧾 Hàm lưu vị trí
    const handleSave = async () => {
        if (!lat || !lng || !address) {
            setMessage("⚠️ Vui lòng chọn hoặc nhập địa chỉ trước khi lưu.");
            return;
        }

        try {
            setLoading(true);
            setMessage("🔄 Đang cập nhật địa chỉ...");

            const payload = {
                latitude: parseFloat(lat),
                longitude: parseFloat(lng),
                address,
            };

            const res = await updateLocationApi(payload);
            if (!res.error && res.data) {
                const token = (await AsyncStorage.getItem("access_token")) ?? "";
                setAppState({ ...res.data, access_token: token });
                setMessage("✅ Cập nhật địa chỉ thành công!");
                setTimeout(() => router.replace("/(tabs)"), 1500);
            } else {
                setMessage("⚠️ Không thể cập nhật vị trí lên server.");
            }
        } catch (err) {
            console.error("❌ Lỗi khi lưu địa chỉ:", err);
            setMessage("❌ Đã xảy ra lỗi khi lưu địa chỉ.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <SegmentedButtons
                    value={method}
                    onValueChange={setMethod}
                    style={{ marginBottom: 12 }}
                    buttons={[
                        { value: "auto", label: "Tự động", icon: "crosshairs-gps" },
                        { value: "map", label: "Bản đồ", icon: "map-marker" },
                        { value: "search", label: "Tìm kiếm", icon: "magnify" },
                    ]}
                />

                {method === "auto" && (
                    <AutoAddress
                        address={address}
                        setAddress={setAddress}
                        lat={lat}
                        lng={lng}
                        setLat={setLat}
                        setLng={setLng}
                    />
                )}
                {method === "map" && (
                    <MapAddress
                        address={address}
                        setAddress={setAddress}
                        lat={lat}
                        lng={lng}
                        setLat={setLat}
                        setLng={setLng}
                    />
                )}
                {method === "search" && (
                    <SearchAddress
                        address={address}
                        setAddress={setAddress}
                        lat={lat}
                        lng={lng}
                        setLat={setLat}
                        setLng={setLng}
                    />
                )}

                {message ? (
                    <View style={{ marginTop: 10 }}>
                        <Button mode="text" textColor="#777">
                            {message}
                        </Button>
                    </View>
                ) : null}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Nút Lưu vị trí cố định dưới đáy */}
            <View style={[styles.footer, { backgroundColor: theme.colors.background }]}>
                <Button
                    mode="contained"
                    style={styles.saveButton}
                    onPress={handleSave}
                    disabled={loading}
                    loading={loading}
                >
                    Lưu địa chỉ
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        padding: 16,
        gap: 16,
    },
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        borderTopWidth: 0.5,
        borderTopColor: "#ddd",
        backgroundColor: "#fff",
    },
    saveButton: {
        borderRadius: 12,
        backgroundColor: "#ff6d00",
        paddingVertical: 6,
    },
});
