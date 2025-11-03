import { Dimensions, Image, Text, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";

const { width } = Dimensions.get("window");

const localImages = [
    { id: 1, image: require("src/assets/images/banner-1.webp"), title: "Cơm chiên chay" },
    { id: 2, image: require("src/assets/images/banner-2.jpg"), title: "Bún riêu chay" },
    { id: 3, image: require("src/assets/images/banner-3.webp"), title: "Salad healthy" },
];

export default function AppCarousel() {
    return (
        <View style={{ flex: 1, justifyContent: "center" }}>
            <Carousel
                loop
                width={width}
                height={250}
                autoPlay={true}
                data={localImages}
                scrollAnimationDuration={1000}
                renderItem={({ item }) => (
                    <View
                        style={{
                            flex: 1,
                            borderRadius: 16,
                            overflow: "hidden",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <Image
                            source={item.image}
                            style={{ width: "100%", height: "100%" }}
                            resizeMode="cover"
                        />
                        <View
                            style={{
                                position: "absolute",
                                bottom: 0,
                                width: "100%",
                                backgroundColor: "rgba(0,0,0,0.4)",
                                padding: 12,
                            }}
                        >
                            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
                                {item.title}
                            </Text>
                        </View>
                    </View>
                )}
            />
        </View>
    );
}
