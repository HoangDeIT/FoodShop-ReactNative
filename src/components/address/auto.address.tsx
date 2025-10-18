import { useCurrentApp } from "@/context/app.context";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps"; // ✅ import map thật
import { ActivityIndicator, Button, Card, IconButton, Text, TextInput } from "react-native-paper";
interface Props {
    address: string;
    setAddress: (val: string) => void;
    lat: string;
    lng: string;
    setLat: (val: string) => void;
    setLng: (val: string) => void;
}

export default function AutoAddress({
    address,
    setAddress,
    lat,
    lng,
    setLat,
    setLng,
}: Props) {
    const { setAppState } = useCurrentApp();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string>("");

    // 🧭 Lấy vị trí thật
    // 🧭 Lấy vị trí thật
    const handleAutoLocate = async () => {
        try {
            setLoading(true);
            setMessage("🔍 Đang định vị...");

            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                setMessage("⚠️ Không có quyền truy cập vị trí.");
                setLoading(false);
                return;
            }

            const pos = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            const [addr] = await Location.reverseGeocodeAsync({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
            });

            const formattedAddress =
                addr?.formattedAddress ||
                [
                    addr?.name,
                    addr?.street,
                    addr?.subregion,
                    addr?.region,
                    addr?.country,
                ]
                    .filter(Boolean)
                    .join(", ") ||
                "Không xác định được địa chỉ";

            setAddress(formattedAddress);
            setLat(pos.coords.latitude.toString());
            setLng(pos.coords.longitude.toString());
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            setMessage("✅ Đã định vị thành công!");
        } catch (err) {
            console.error("📍 AutoLocate error:", err);
            setMessage("❌ Không thể lấy vị trí.");
        } finally {
            setLoading(false);
        }
    };

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    const hasCoords = !isNaN(latNum) && !isNaN(lngNum);

    return (
        <Card style={styles.card}>
            <Card.Title
                title="Lấy vị trí tự động"
                subtitle="Ứng dụng sẽ tự định vị GPS của bạn"
                left={(p) => <IconButton {...p} icon="crosshairs-gps" />}
            />
            <Card.Content style={{ gap: 10 }}>
                <Button
                    mode="contained-tonal"
                    icon="crosshairs-gps"
                    style={styles.button}
                    onPress={handleAutoLocate}
                    disabled={loading}
                >
                    {loading ? "Đang định vị..." : "Lấy vị trí hiện tại"}
                </Button>

                {message ? (
                    <Text style={{ color: "#666", textAlign: "center" }}>{message}</Text>
                ) : null}

                {loading && (
                    <ActivityIndicator
                        size="small"
                        color="#ff6d00"
                        style={{ marginTop: 6 }}
                    />
                )}

                <TextInput
                    label="Địa chỉ"
                    mode="outlined"
                    value={address}
                    onChangeText={setAddress}
                />
                <View style={{ flexDirection: "row", gap: 8 }}>
                    <TextInput label="Lat" mode="outlined" style={{ flex: 1 }} value={lat} editable={false} />
                    <TextInput label="Lng" mode="outlined" style={{ flex: 1 }} value={lng} editable={false} />
                </View>

                {/* 🗺️ Map thật hiển thị vị trí người dùng */}
                {hasCoords ? (
                    <View style={styles.mapContainer}>
                        <MapView
                            style={styles.map}
                            region={{
                                latitude: latNum,
                                longitude: lngNum,
                                latitudeDelta: 0.01,
                                longitudeDelta: 0.01,
                            }}
                            showsUserLocation
                            showsMyLocationButton={false}
                            scrollEnabled={false}
                            zoomEnabled={false}
                        >
                            <Marker
                                coordinate={{ latitude: latNum, longitude: lngNum }}
                                title="Vị trí của bạn"
                                description={address}
                            />
                        </MapView>
                    </View>
                ) : (
                    <View style={styles.mapPlaceholder}>
                        <IconButton icon="map-marker" size={28} />
                        <Text style={{ color: "#777" }}>Vị trí của bạn trên bản đồ</Text>
                    </View>
                )}
            </Card.Content>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: { borderRadius: 18, elevation: 1 },
    button: { borderRadius: 12, backgroundColor: "#ff6d00" },
    mapContainer: {
        borderRadius: 14,
        overflow: "hidden",
        height: 180,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    map: {
        width: "100%",
        height: "100%",
    },
    mapPlaceholder: {
        height: 160,
        borderWidth: 1,
        borderColor: "#ddd",
        borderStyle: "dashed",
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
});
