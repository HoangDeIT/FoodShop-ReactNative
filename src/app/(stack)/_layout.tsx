import { Stack } from "expo-router";

export default function StackLayout() {
    return (
        <Stack

            screenOptions={{
                headerStyle: {
                    backgroundColor: "#ff6d00", // 🟧 màu cam ShopeeFood
                },


                headerTintColor: "#fff", // 🧾 chữ trắng
                headerTitleStyle: {
                    fontWeight: "bold",
                },
                animation: "slide_from_right", // 🎞 hiệu ứng chuyển trang
            }}
        >
            {/* 🏪 Chi tiết quán */}
            <Stack.Screen
                name="shop/[id]"
                options={{
                    title: "Chi tiết quán ăn",
                }}
            />

            {/* 🍔 Chi tiết sản phẩm */}
            <Stack.Screen
                name="product/[id]"
                options={{
                    title: "Chi tiết sản phẩm",
                    // headerShown: false
                }}

            />

            {/* 🗂 Danh mục */}
            <Stack.Screen
                name="categories/[id]"
                options={{
                    title: "Danh mục sản phẩm",
                }}
            />
        </Stack>
    );
}
