import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { MapPressEvent, Marker } from "react-native-maps";
import { ActivityIndicator, Card, IconButton, Text, TextInput } from "react-native-paper";

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
    const [region, setRegion] = useState({
        latitude: lat ? parseFloat(lat) : 10.0301,
        longitude: lng ? parseFloat(lng) : 105.7722,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    });

    // 🧭 Reverse geocode khi lat/lng thay đổi
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

    // Khi user chạm chọn vị trí mới trên map
    const handleMapPress = async (e: MapPressEvent) => {
        const { latitude, longitude } = e.nativeEvent.coordinate;
        setLat(latitude.toString());
        setLng(longitude.toString());
        setRegion({
            ...region,
            latitude,
            longitude,
        });
        await fetchAddress(latitude, longitude);
    };

    // Khi vào trang mà chưa có lat/lng, tự động lấy vị trí hiện tại
    useEffect(() => {
        (async () => {
            if (!lat || !lng) {
                try {
                    const { status } = await Location.requestForegroundPermissionsAsync();
                    if (status !== "granted") return;

                    const pos = await Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.High,
                    });

                    const { latitude, longitude } = pos.coords;
                    setLat(latitude.toString());
                    setLng(longitude.toString());
                    setRegion({
                        ...region,
                        latitude,
                        longitude,
                    });
                    await fetchAddress(latitude, longitude);
                } catch (err) {
                    console.error("📍 Error getting current location:", err);
                }
            }
        })();
    }, []);

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    const hasCoords = !isNaN(latNum) && !isNaN(lngNum);

    return (
        <Card style={styles.card}>
            <Card.Title
                title="Chọn vị trí trên bản đồ"
                subtitle="Chạm để đặt ghim, địa chỉ sẽ tự điền"
                left={(p) => <IconButton {...p} icon="map-marker" />}
            />
            <Card.Content style={{ gap: 10 }}>
                <View style={styles.mapContainer}>
                    {hasCoords ? (
                        <MapView
                            style={styles.map}
                            region={region}
                            onPress={handleMapPress}
                            showsUserLocation
                            showsMyLocationButton={true}
                        >
                            <Marker
                                coordinate={{ latitude: latNum, longitude: lngNum }}
                                draggable
                                onDragEnd={(e) => {
                                    const { latitude, longitude } = e.nativeEvent.coordinate;
                                    setLat(latitude.toString());
                                    setLng(longitude.toString());
                                    fetchAddress(latitude, longitude);
                                }}
                                title="Vị trí đã chọn"
                                description={address || "Chạm vào bản đồ để chọn vị trí"}
                            />
                        </MapView>
                    ) : (
                        <View style={styles.mapPlaceholder}>
                            <IconButton icon="map-marker" size={28} />
                            <Text style={{ color: "#777" }}>Đang tải bản đồ...</Text>
                        </View>
                    )}
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
        height: 200,
        borderRadius: 14,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#ddd",
    },
    map: {
        width: "100%",
        height: "100%",
    },
    button: { borderRadius: 12, backgroundColor: "#ff6d00" },
    mapPlaceholder: {
        height: 200,
        borderWidth: 1,
        borderColor: "#ddd",
        borderStyle: "dashed",
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    overlay: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.5)",
    },
});
