import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import MapView, { Marker, UrlTile } from "react-native-maps";
import { ActivityIndicator, Card, IconButton, Text, TextInput } from "react-native-paper";

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
    const mapRef = useRef<MapView>(null);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [debouncedQuery, setDebouncedQuery] = useState(query);

    // 🕓 Debounce mỗi 500ms
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedQuery(query), 500);
        return () => clearTimeout(handler);
    }, [query]);

    // ⚡ Gọi API khi debouncedQuery thay đổi
    useEffect(() => {
        if (debouncedQuery.length < 3) {
            setResults([]);
            return;
        }

        const search = async () => {
            try {
                setLoading(true);
                const latNum = parseFloat(lat) || 10.0452; // fallback Cần Thơ
                const lngNum = parseFloat(lng) || 105.7469;
                const delta = 0.5; // vùng tìm quanh 10km
                const viewbox = [
                    lngNum - delta,
                    latNum + delta,
                    lngNum + delta,
                    latNum - delta,
                ].join(",");

                // const res = await axios.get("https://nominatim.openstreetmap.org/search", {
                //     params: {
                //         format: "json",
                //         q: debouncedQuery,
                //         countrycodes: "vn",
                //         addressdetails: 1,
                //         limit: 8,
                //         viewbox,
                //         bounded: 0, // chỉ tìm trong viewbox
                //     },
                //     headers: { "User-Agent": "FoodShopApp/1.0 (https://expo.dev)" },
                // });
                const res = await axios.get("https://nominatim.openstreetmap.org/search", {
                    params: {
                        format: "json",
                        q: debouncedQuery,
                        countrycodes: "vn",
                        addressdetails: 1,
                        limit: 8,
                        lat: lat || undefined,
                        lon: lng || undefined, // chỉ bias nhẹ
                    },
                    headers: { "User-Agent": "FoodShopApp/1.0 (https://expo.dev)" },
                });

                setResults(res.data || []);
            } catch (err) {
                console.error("❌ Lỗi tìm địa chỉ:", err);
            } finally {
                setLoading(false);
            }
        };

        search();
    }, [debouncedQuery]);


    const handleSelect = (item: any) => {
        const { lat, lon, display_name } = item;
        setLat(lat.toString());
        setLng(lon.toString());
        setAddress(display_name);
        setResults([]);
        setQuery(display_name);
        mapRef.current?.animateToRegion({
            latitude: parseFloat(lat),
            longitude: parseFloat(lon),
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        });
    };

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    const hasCoords = !isNaN(latNum) && !isNaN(lngNum);

    return (
        <Card style={styles.card}>
            <Card.Title
                title="Tìm địa chỉ"
                subtitle="Dữ liệu từ OpenStreetMap (ưu tiên gần vị trí hiện tại)"
                left={(p) => <IconButton {...p} icon="map-search" />}
            />
            <Card.Content style={{ gap: 10 }}>
                {/* Ô nhập tìm kiếm */}
                <View style={{ zIndex: 10 }}>
                    <TextInput
                        placeholder="Nhập địa chỉ hoặc địa điểm (VD: bệnh viện, quán ăn...)"
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

                    {/* Kết quả gợi ý — dùng ScrollView để tránh cảnh báo VirtualizedList */}
                    {results.length > 0 && (
                        <ScrollView style={styles.suggestionBox} nestedScrollEnabled>
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

                {/* Lat/Lng */}
                <TextInput label="Địa chỉ" mode="outlined" value={address} onChangeText={setAddress} />
                <View style={{ flexDirection: "row", gap: 8 }}>
                    <TextInput label="Lat" mode="outlined" style={{ flex: 1 }} value={lat} editable={false} />
                    <TextInput label="Lng" mode="outlined" style={{ flex: 1 }} value={lng} editable={false} />
                </View>

                {/* Bản đồ */}
                {hasCoords ? (
                    <View style={styles.mapContainer}>
                        <MapView
                            ref={mapRef}
                            style={styles.map}
                            region={{
                                latitude: latNum,
                                longitude: lngNum,
                                latitudeDelta: 0.01,
                                longitudeDelta: 0.01,
                            }}
                            scrollEnabled={false}
                            zoomEnabled={false}
                        >
                            <UrlTile urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} />
                            <Marker coordinate={{ latitude: latNum, longitude: lngNum }} title={address} />
                        </MapView>
                    </View>
                ) : (
                    <View style={styles.mapPlaceholder}>
                        <IconButton icon="map" size={26} />
                        <Text style={{ color: "#777" }}>Nhập địa chỉ để hiển thị bản đồ</Text>
                    </View>
                )}
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
        height: 180,
        borderRadius: 14,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#ddd",
    },
    map: { width: "100%", height: "100%" },
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
