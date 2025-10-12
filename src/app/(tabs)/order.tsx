import { ScrollView } from "react-native";
import { Button, Card, Text } from "react-native-paper";

const orders = [
    { id: 1, shop: "Cơm Tấm 36", total: "85.000đ", status: "Đang giao" },
    { id: 2, shop: "Trà Sữa Gongcha", total: "42.000đ", status: "Hoàn thành" },
    { id: 3, shop: "Phở Hà Nội", total: "55.000đ", status: "Đã hủy" },
];

export default function OrderScreen() {
    return (
        <ScrollView style={{ flex: 1, backgroundColor: "#fff", padding: 12 }}>
            <Text variant="titleLarge" style={{ fontWeight: "bold", marginBottom: 12 }}>
                Đơn hàng gần đây
            </Text>

            {orders.map((item) => (
                <Card key={item.id} style={{ marginBottom: 10 }}>
                    <Card.Title title={item.shop} subtitle={`Tổng: ${item.total}`} />
                    <Card.Content>
                        <Text style={{ color: "#777" }}>Trạng thái: {item.status}</Text>
                    </Card.Content>
                    <Card.Actions>
                        <Button textColor="#ff6d00">Xem chi tiết</Button>
                    </Card.Actions>
                </Card>
            ))}
        </ScrollView>
    );
}
