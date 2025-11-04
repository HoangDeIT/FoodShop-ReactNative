import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Card, IconButton, TextInput } from "react-native-paper";
import { WebView } from "react-native-webview";

interface Props {
    address: string;
    setAddress: (val: string) => void;
    lat: string;
    lng: string;
    setLat: (val: string) => void;
    setLng: (val: string) => void;
}

export default function MapAddress({
    address,
    setAddress,
    lat,
    lng,
    setLat,
    setLng,
}: Props) {
    const [loading, setLoading] = useState(false);
    const webRef = useRef<WebView>(null);

    const fetchAddress = async (latitude: number, longitude: number) => {
        try {
            setLoading(true);
            const [addr] = await Location.reverseGeocodeAsync({ latitude, longitude });
            const formattedAddress =
                addr?.formattedAddress ||
                [addr?.name, addr?.street, addr?.subregion, addr?.region, addr?.country]
                    .filter(Boolean)
                    .join(", ") ||
                "Không xác định được địa chỉ";
            setAddress(formattedAddress);
        } catch (err) {
            console.error("❌ Reverse geocode error:", err);
            setAddress("Không thể xác định địa chỉ");
        } finally {
            setLoading(false);
        }
    };

    // 🧭 Lấy vị trí hiện tại nếu chưa có
    useEffect(() => {
        (async () => {
            if (!lat || !lng) {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== "granted") return;
                const pos = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High,
                });
                setLat(pos.coords.latitude.toString());
                setLng(pos.coords.longitude.toString());
                await fetchAddress(pos.coords.latitude, pos.coords.longitude);
            }
        })();
    }, []);

    const handleMessage = (event: any) => {
        try {
            const { lat, lng } = JSON.parse(event.nativeEvent.data);
            setLat(lat.toString());
            setLng(lng.toString());
            fetchAddress(lat, lng);
        } catch (err) {
            console.error("📨 handleMessage error:", err);
        }
    };

    const latNum = parseFloat(lat) || 10.0301;
    const lngNum = parseFloat(lng) || 105.7722;

    // 🧩 HTML hiển thị Leaflet map (OpenStreetMap)
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
      <style>
        html, body, #map { height: 100%; margin: 0; padding: 0; }
        .marker {
          width: 20px; height: 20px;
          background-color: #ff6d00;
          border: 2px solid white;
          border-radius: 50%;
        }
      </style>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    </head>
    <body>
      <div id="map"></div>
      <script>
        const map = L.map('map').setView([${latNum}, ${lngNum}], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        const marker = L.marker([${latNum}, ${lngNum}], { draggable: true }).addTo(map);

        marker.on('dragend', function (e) {
          const pos = marker.getLatLng();
          window.ReactNativeWebView.postMessage(JSON.stringify(pos));
        });

        map.on('click', function (e) {
          marker.setLatLng(e.latlng);
          window.ReactNativeWebView.postMessage(JSON.stringify(e.latlng));
        });
      </script>
    </body>
    </html>
  `;

    return (
        <Card style={styles.card}>
            <Card.Title
                title="Chọn vị trí trên bản đồ"
                subtitle="Bản đồ OpenStreetMap (Leaflet – chạy 100% trong Expo)"
                left={(p) => <IconButton {...p} icon="map-marker" />}
            />
            <Card.Content style={{ gap: 10 }}>
                <View style={styles.mapContainer}>
                    <WebView
                        ref={webRef}
                        originWhitelist={["*"]}
                        source={{ html }}
                        onMessage={handleMessage}
                        style={styles.map}
                    />
                    {loading && (
                        <View style={styles.overlay}>
                            <ActivityIndicator size="small" color="#ff6d00" />
                        </View>
                    )}
                </View>

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
            </Card.Content>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: { borderRadius: 18, elevation: 1 },
    mapContainer: {
        height: 240,
        borderRadius: 14,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#ddd",
    },
    map: { flex: 1 },
    overlay: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.4)",
    },
});
