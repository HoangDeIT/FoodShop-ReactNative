import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { ActivityIndicator, Card, IconButton, Text, TextInput } from "react-native-paper";
import { WebView } from "react-native-webview";

interface Props {
    address: string;
    setAddress: (val: string) => void;
    lat: string;
    lng: string;
    setLat: (val: string) => void;
    setLng: (val: string) => void;
}

export default function SearchAddress({
    address,
    setAddress,
    lat,
    lng,
    setLat,
    setLng,
}: Props) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [debouncedQuery, setDebouncedQuery] = useState(query);
    const webRef = useRef<WebView>(null);

    // 🕓 Debounce
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedQuery(query), 600);
        return () => clearTimeout(handler);
    }, [query]);

    // 🔍 Tìm kiếm qua Nominatim (OpenStreetMap)
    useEffect(() => {
        if (debouncedQuery.length < 3) {
            setResults([]);
            return;
        }

        const search = async () => {
            try {
                setLoading(true);
                const res = await axios.get("https://nominatim.openstreetmap.org/search", {
                    params: {
                        q: debouncedQuery,
                        format: "json",
                        addressdetails: 1,
                        limit: 6,
                        countrycodes: "vn",
                    },
                    headers: { "User-Agent": "FoodShopApp/1.0 (expo.dev)" },
                });
                setResults(res.data || []);
            } catch (err) {
                console.error("❌ Lỗi tìm kiếm:", err);
            } finally {
                setLoading(false);
            }
        };

        search();
    }, [debouncedQuery]);

    // 🗺️ Khi chọn địa chỉ
    const handleSelect = (item: any) => {
        const { lat, lon, display_name } = item;
        setLat(lat.toString());
        setLng(lon.toString());
        setAddress(display_name);
        setResults([]);
        setQuery(display_name);

        // Gửi lệnh di chuyển marker tới WebView
        webRef.current?.postMessage(JSON.stringify({ lat, lng: lon }));
    };

    const latNum = parseFloat(lat) || 10.0301;
    const lngNum = parseFloat(lng) || 105.7722;

    // 🧩 HTML hiển thị Leaflet map
    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
        <style>
          html, body, #map { height: 100%; margin: 0; padding: 0; }
          .leaflet-control-attribution { display: none; }
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
          const map = L.map('map').setView([${latNum}, ${lngNum}], 15);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          const marker = L.marker([${latNum}, ${lngNum}], { draggable: true }).addTo(map);
          
          marker.on('dragend', (e) => {
            const pos = marker.getLatLng();
            window.ReactNativeWebView.postMessage(JSON.stringify(pos));
          });

          map.on('click', (e) => {
            marker.setLatLng(e.latlng);
            window.ReactNativeWebView.postMessage(JSON.stringify(e.latlng));
          });

          // Nhận lệnh từ React Native để di chuyển marker
          document.addEventListener('message', function(event) {
            try {
              const { lat, lng } = JSON.parse(event.data);
              marker.setLatLng([lat, lng]);
              map.flyTo([lat, lng], 15);
            } catch (err) {
              console.error('Parse message error:', err);
            }
          });
        </script>
      </body>
    </html>
  `;

    // 📩 Nhận tọa độ từ WebView
    const handleMessage = (event: any) => {
        try {
            const { lat, lng } = JSON.parse(event.nativeEvent.data);
            setLat(lat.toString());
            setLng(lng.toString());
        } catch (err) {
            console.error("handleMessage error:", err);
        }
    };

    return (
        <Card style={styles.card}>
            <Card.Title
                title="Tìm địa chỉ"
                subtitle="Dữ liệu từ OpenStreetMap (Leaflet, không cần SDK Google)"
                left={(p) => <IconButton {...p} icon="map-search" />}
            />
            <Card.Content style={{ gap: 10 }}>
                {/* Ô tìm kiếm */}
                <View style={{ zIndex: 20 }}>
                    <TextInput
                        placeholder="Nhập địa chỉ hoặc địa điểm (VD: Bệnh viện, quán ăn...)"
                        mode="outlined"
                        value={query}
                        onChangeText={setQuery}
                        style={{ backgroundColor: "#fff" }}
                        right={
                            loading ? (
                                <TextInput.Icon icon={() => <ActivityIndicator size="small" />} />
                            ) : undefined
                        }
                    />
                    {/* Danh sách kết quả */}
                    {results.length > 0 && (
                        <ScrollView style={styles.suggestionBox}>
                            {results.map((item) => (
                                <TouchableOpacity
                                    key={item.place_id}
                                    onPress={() => handleSelect(item)}
                                    style={styles.suggestionItem}
                                >
                                    <Text>{item.display_name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>

                {/* Lat/Lng hiển thị */}
                <TextInput label="Địa chỉ" mode="outlined" value={address} onChangeText={setAddress} />
                <View style={{ flexDirection: "row", gap: 8 }}>
                    <TextInput label="Lat" mode="outlined" style={{ flex: 1 }} value={lat} editable={false} />
                    <TextInput label="Lng" mode="outlined" style={{ flex: 1 }} value={lng} editable={false} />
                </View>

                {/* Map View */}
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
    suggestionBox: {
        backgroundColor: "#fff",
        borderRadius: 10,
        marginTop: 4,
        elevation: 3,
        maxHeight: 180,
        borderWidth: 1,
        borderColor: "#eee",
    },
    suggestionItem: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: "#eee",
    },
    mapContainer: {
        height: 240,
        borderRadius: 14,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#ddd",
    },
    map: { flex: 1 },
});
