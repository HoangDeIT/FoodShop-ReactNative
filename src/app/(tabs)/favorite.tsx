import { ScrollView } from "react-native";
import { Card, IconButton, Text } from "react-native-paper";

const favorites = [
    {
        id: 1,
        name: "Trà Sữa Tocotoco",
        image: "https://images.foody.vn/res/g98/972617/prof/s640x400/file_restaurant_photo_lqjx_16280-54a14e61-220805145940.jpg",
        distance: "1.2 km",
    },
    {
        id: 2,
        name: "Bánh Mì PewPew",
        image: "https://images.foody.vn/res/g96/956148/prof/s640x400/file_restaurant_photo_4r8r_16043-9d8cc3fc-210731134839.jpg",
        distance: "0.8 km",
    },
];

export default function FavoriteScreen() {
    return (
        <ScrollView style={{ flex: 1, backgroundColor: "#fff", padding: 12 }}>
            <Text variant="titleLarge" style={{ fontWeight: "bold", marginBottom: 12 }}>
                Yêu thích của bạn
            </Text>

            {favorites.map((item) => (
                <Card key={item.id} style={{ marginBottom: 12 }}>
                    <Card.Cover source={{ uri: item.image }} />
                    <Card.Title
                        title={item.name}
                        subtitle={`Cách bạn ${item.distance}`}
                        right={() => (
                            <IconButton icon="heart" iconColor="#ff6d00" onPress={() => { }} />
                        )}
                    />
                </Card>
            ))}
        </ScrollView>
    );
}
