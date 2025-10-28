import { getAllCategories } from "@/utils/customer.api";
import { useEffect, useState } from "react";
import { FlatList, Image, View } from "react-native";
import { Text } from "react-native-paper";

const CategoriesList = () => {
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [columns, setColumns] = useState<ICategory[][]>([]);
    useEffect(() => {
        // 🔹 Giả lập fetch API trả về cùng format như thật
        const fetchCategories = async () => {


            const res = await getAllCategories();
            const data = res?.data || [];
            if (!data || data.length === 0) return;
            setCategories(data);

            // 🔹 Chia nhóm 2 hàng (2 category mỗi cột)
            const grouped = data.reduce((acc: ICategory[][], _, i) => {
                if (i % 2 === 0) acc.push(data.slice(i, i + 2));
                return acc;
            }, []);
            setColumns(grouped);
        };

        fetchCategories();
    }, []);
    return (
        <FlatList
            data={columns}
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            keyExtractor={(_, i) => i.toString()}
            contentContainerStyle={{
                paddingHorizontal: 10,
                paddingVertical: 6,
            }}
            renderItem={({ item }) => (
                <View
                    style={{
                        flexDirection: "column",
                        alignItems: "center",
                        marginHorizontal: 10,
                    }}
                >
                    {item.map((cat) => (
                        <View
                            key={cat._id}
                            style={{
                                alignItems: "center",
                                marginVertical: 10,
                                width: 80,       // 👈 Chiều rộng cố định để text không đẩy lệch
                                height: 100,     // 👈 Chiều cao cố định để các hàng đều nhau
                            }}
                        >
                            {/* 🖼 icon URL từ API */}
                            <Image
                                source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}/public/images/categories/${cat.icon}` }}
                                style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 22,
                                    backgroundColor: "#ffecb3",
                                }}
                                resizeMode="cover"
                            />
                            <Text
                                numberOfLines={2}               // 👈 Giới hạn hiển thị tối đa 2 dòng
                                ellipsizeMode="tail"            // 👈 Nếu dài quá, thêm "..." ở cuối
                                style={{
                                    width: 70,                    // 👈 Cố định chiều rộng để không kéo giãn
                                    lineHeight: 16,               // 👌 Cân đối khoảng cách giữa 2 dòng
                                    textAlign: "center",
                                    fontSize: 12,
                                    marginTop: 6,
                                    color: "#333",
                                }}
                            >
                                {cat.name}
                            </Text>
                        </View>
                    ))}
                </View>
            )}
        />
    )
}
export default CategoriesList;