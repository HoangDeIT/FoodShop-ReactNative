import { Image, ScrollView, View } from "react-native";
import { Card, Chip, Divider, IconButton, Text } from "react-native-paper";

export default function RestaurantScreen() {
    const menu = [
        {
            id: 1,
            name: "Cơm gà chiên nước mắm",
            desc: "Cánh/đùi/ức gà, cơm chiên, rau, súp",
            price: 50000,
            sold: 98,
            image:
                "https://cdn.tgdd.vn/2020/08/CookProduct/comga-1200x676-1.jpg",
        },
        {
            id: 2,
            name: "Cơm gà xối mỡ",
            desc: "Cánh/đùi/ức gà, cơm chiên, rau, súp",
            price: 50000,
            sold: 13,
            image:
                "https://cdn.tgdd.vn/2021/06/CookRecipe/Avatar/com-ga-xoi-mo-thumbnail.jpg",
        },
        {
            id: 3,
            name: "Cơm chiên cá mặn",
            desc: "Cơm chiên cá mặn, lạp xưởng, trứng, rau, súp",
            price: 45000,
            sold: 11,
            image:
                "https://cdn.tgdd.vn/2021/04/CookProduct/comchien-thumbnail-620x620.jpg",
        },
    ];

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: "#fff" }}
            contentContainerStyle={{ paddingBottom: 20 }}
        >
            {/* Header */}
            <Card mode="contained" style={{ margin: 10, borderRadius: 12 }}>
                <Card.Cover
                    source={{
                        uri: "https://cdn.tgdd.vn/2022/07/CookDish/pizza-thumbnail.jpg",
                    }}
                />
                <Card.Content style={{ marginTop: 10 }}>
                    <Text variant="titleLarge" style={{ fontWeight: "bold" }}>
                        Pizza Vị Thanh
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                        <Text>⭐ 4.5 (100+ Bình luận) · </Text>
                        <Text>30 phút</Text>
                    </View>

                    {/* Ưu đãi */}
                    <View style={{ marginTop: 8, flexDirection: "column", gap: 4 }}>
                        <Chip icon="tag" compact>
                            Giảm 19% cho đơn từ 300.000đ
                        </Chip>
                        <Chip icon="tag" compact>
                            Giảm 21% cho đơn từ 400.000đ
                        </Chip>
                    </View>
                </Card.Content>
            </Card>

            <Divider style={{ marginVertical: 10 }} />

            {/* Danh mục */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 10 }}>
                {["Cơm gà", "Nước uống", "Gà rán", "Mỳ cay", "Pizza"].map((cat) => (
                    <Chip
                        key={cat}
                        style={{ marginRight: 8, backgroundColor: "#f6f6f6" }}
                        textStyle={{ fontWeight: "bold" }}
                    >
                        {cat}
                    </Chip>
                ))}
            </ScrollView>

            <Divider style={{ marginVertical: 10 }} />

            {/* Danh sách món */}
            <View style={{ paddingHorizontal: 10 }}>
                <Text variant="titleMedium" style={{ fontWeight: "bold", marginBottom: 8 }}>
                    Cơm gà
                </Text>

                {menu.map((item) => (
                    <Card key={item.id} style={{ marginBottom: 14, borderRadius: 10, elevation: 2 }}>
                        <View style={{ flexDirection: "row" }}>
                            <Image
                                source={{ uri: item.image }}
                                style={{
                                    width: 100,
                                    height: 100,
                                    borderTopLeftRadius: 10,
                                    borderBottomLeftRadius: 10,
                                }}
                            />
                            <View style={{ flex: 1, padding: 10 }}>
                                <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
                                <Text style={{ color: "#555", fontSize: 13 }}>{item.desc}</Text>
                                <Text style={{ color: "#999", marginTop: 2 }}>{item.sold} đã bán</Text>
                                <View
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        marginTop: 6,
                                    }}
                                >
                                    <Text style={{ fontWeight: "bold", color: "#ff6d00" }}>
                                        {item.price.toLocaleString("vi-VN")}đ
                                    </Text>
                                    <IconButton icon="plus" size={22} iconColor="#ff6d00" />
                                </View>
                            </View>
                        </View>
                    </Card>
                ))}
            </View>
        </ScrollView>
    );
}
