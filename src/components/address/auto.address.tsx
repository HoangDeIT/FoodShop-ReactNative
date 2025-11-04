import { useCurrentApp } from "@/context/app.context";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Card, IconButton, Text, TextInput } from "react-native-paper";
import { WebView } from "react-native-webview";

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
    const webRef = useRef<WebView>(null);

    // 🧭 Lấy vị trí hiện tại
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

    // 🗺️ HTML hiển thị bản đồ OpenStreetMap qua Leaflet
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
      <style>
        html, body, #map { height: 100%; margin: 0; padding: 0; }
      </style>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    </head>
    <body>
      <div id="map"></div>
      <script>
        const lat = ${lat || 10.0301};
        const lng = ${lng || 105.7722};

        const map = L.map('map').setView([lat, lng], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
        marker.on('dragend', (e) => {
          const pos = marker.getLatLng();
          window.ReactNativeWebView.postMessage(JSON.stringify(pos));
        });

        map.on('click', function(e) {
          marker.setLatLng(e.latlng);
          window.ReactNativeWebView.postMessage(JSON.stringify(e.latlng));
        });
      </script>
    </body>
    </html>
  `;

    // 📨 Nhận tọa độ từ WebView
    const handleMessage = (event: any) => {
        try {
            const { lat, lng } = JSON.parse(event.nativeEvent.data);
            setLat(lat.toString());
            setLng(lng.toString());
        } catch (e) {
            console.error("Lỗi parse message từ webview:", e);
        }
    };

    return (
        <Card style={styles.card}>
            <Card.Title
                title="Lấy vị trí tự động"
                subtitle="Bản đồ OpenStreetMap (Leaflet – không cần Google SDK)"
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

                {/* 🗺️ Bản đồ OpenStreetMap qua Leaflet */}
                <View style={styles.mapContainer}>
                    <WebView
                        ref={webRef}
                        originWhitelist={["*"]}
                        source={{ html }}
                        onMessage={handleMessage}
                        style={styles.map}
                    />
                </View>
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
        height: 200,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    map: { flex: 1 },
});
