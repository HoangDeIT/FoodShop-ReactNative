import {
    clearAllCart,
    clearTable,
    getAllCartItems,
    getAllCartShops,
} from "@/db/services/sqliteDebugService";
import { useEffect, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { Button, Divider } from "react-native-paper";
export default function DebugSQLiteScreen() {
    const [rows, setRows] = useState<any[]>([]);
    const [shops, setShops] = useState<any[]>([]);

    // ✅ Load dữ liệu 2 bảng
    const loadData = async () => {
        try {
            const items = await getAllCartItems();
            const shops = await getAllCartShops();

            setRows(items);
            setShops(shops);
        } catch (err) {
            console.error("❌ Lỗi load DB:", err);
        }
    };

    // ✅ Hàm xóa toàn bộ dữ liệu trong bảng
    const clearTableHandler = async (tableName: string) => {
        try {
            await clearTable(tableName);
            Alert.alert("🧹 Dọn sạch", `Đã xoá ${tableName}`);
            await loadData();
        } catch (err) {
            console.error(err);
        }
    };

    // ✅ Xóa cả hai bảng (cart_items + cart_shops)
    const clearAll = async () => {
        Alert.alert("Xác nhận", "Xoá hết?", [
            { text: "Huỷ", style: "cancel" },
            {
                text: "Xoá",
                onPress: async () => {
                    await clearAllCart();
                    await loadData();
                },
            },
        ]);
    };
    useEffect(() => {
        loadData();
    }, []);

    return (
        <ScrollView style={{ padding: 12, backgroundColor: "#fff", flex: 1 }}>
            {/* Header */}
            <Text style={{ fontWeight: "bold", fontSize: 22, marginBottom: 8 }}>
                🧠 SQLite Debugger
            </Text>

            {/* Action Buttons */}
            <View
                style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    marginBottom: 10,
                }}
            >
                <Button mode="contained-tonal" onPress={loadData} style={{ marginVertical: 4 }}>
                    🔄 Tải lại
                </Button>
                <Button
                    mode="contained-tonal"
                    onPress={() => clearTableHandler("cart_items")}
                    style={{ marginVertical: 4 }}
                >
                    🧺 Xoá cart_items
                </Button>
                <Button
                    mode="contained-tonal"
                    onPress={() => clearTableHandler("cart_shops")}
                    style={{ marginVertical: 4 }}
                >
                    🏪 Xoá cart_shops
                </Button>
                <Button mode="contained" buttonColor="#ff3b30" onPress={clearAll} style={{ marginVertical: 4 }}>
                    💣 Xoá TẤT CẢ
                </Button>
            </View>

            <Divider bold style={{ marginVertical: 10 }} />

            {/* Bảng cart_shops */}
            <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 6 }}>
                🏪 Cart Shops ({shops.length})
            </Text>
            {shops.length === 0 ? (
                <Text style={{ color: "gray", marginBottom: 10 }}>Không có dữ liệu</Text>
            ) : (
                shops.map((r, i) => (
                    <View
                        key={`shop-${i}`}
                        style={{
                            borderBottomWidth: 1,
                            borderColor: "#eee",
                            marginVertical: 6,
                            paddingBottom: 4,
                        }}
                    >
                        <Text style={{ fontFamily: "monospace" }}>{JSON.stringify(r, null, 2)}</Text>
                    </View>
                ))
            )}

            <Divider bold style={{ marginVertical: 10 }} />

            {/* Bảng cart_items */}
            <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 6 }}>
                🧺 Cart Items ({rows.length})
            </Text>
            {rows.length === 0 ? (
                <Text style={{ color: "gray" }}>Không có dữ liệu</Text>
            ) : (
                rows.map((r, i) => (
                    <View
                        key={`item-${i}`}
                        style={{
                            borderBottomWidth: 1,
                            borderColor: "#eee",
                            marginVertical: 6,
                            paddingBottom: 4,
                        }}
                    >
                        <Text style={{ fontFamily: "monospace" }}>{JSON.stringify(r, null, 2)}</Text>
                    </View>
                ))
            )}
        </ScrollView>
    );
}
