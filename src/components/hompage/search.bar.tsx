import { useDebounce } from "@/hooks/useDebounce";
import { searchProductsApi } from "@/utils/customer.api";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Dimensions, Image, ScrollView, TouchableOpacity, View } from "react-native";
import { ActivityIndicator, Searchbar, Text } from "react-native-paper";

const { width } = Dimensions.get("window");

export default function ProductSearch() {
    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const router = useRouter();

    const debouncedQuery = useDebounce(searchQuery, 400);

    useEffect(() => {
        if (!debouncedQuery.trim()) {
            setResults([]);
            setShowDropdown(false);
            return;
        }
        fetchSearchResults();
    }, [debouncedQuery]);

    const fetchSearchResults = async () => {
        try {
            setLoading(true);
            const res = await searchProductsApi(debouncedQuery);
            const data = res.data?.result || [];
            setResults(data);
            setShowDropdown(data.length > 0);
        } catch (err) {
            console.error("Search error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectItem = (item: any) => {
        setShowDropdown(false);
        setSearchQuery(item.products.name);
        router.push(`/product/${item.products._id}`);
    };

    return (
        <View style={{ flex: 1, paddingHorizontal: 12, paddingTop: 10 }}>
            {/* Ô tìm kiếm */}
            <Searchbar
                placeholder="Cơm chay, Bún Thái Giảm 40.000đ"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onFocus={() => setShowDropdown(results.length > 0)}
                iconColor="#ff6d00"
                style={{
                    borderRadius: 10,
                    elevation: 2,
                    zIndex: 10, // quan trọng để dropdown nằm dưới searchbar
                }}
            />

            {/* Loading indicator */}
            {loading && (
                <ActivityIndicator
                    style={{ marginTop: 10 }}
                    animating={true}
                    color="#ff6d00"
                />
            )}

            {/* Dropdown gợi ý tuyệt đối */}
            {showDropdown && !loading && (
                <View
                    style={{
                        position: "absolute",
                        top: 70, // khoảng cách từ Searchbar (tuỳ layout)
                        left: 12,
                        width: width - 24,
                        backgroundColor: "#fff",
                        borderRadius: 10,
                        maxHeight: 350,
                        elevation: 6,
                        shadowColor: "#000",
                        shadowOpacity: 0.1,
                        shadowRadius: 6,
                        shadowOffset: { width: 0, height: 2 },
                        zIndex: 9,
                    }}
                >
                    <ScrollView keyboardShouldPersistTaps="handled">
                        {results.map((item) => (
                            <TouchableOpacity
                                key={item.products._id}
                                onPress={() => handleSelectItem(item)}
                            >
                                <View
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        padding: 10,
                                        borderBottomWidth: 0.3,
                                        borderColor: "#ddd",
                                    }}
                                >
                                    <Image
                                        source={{
                                            uri: `${process.env.EXPO_PUBLIC_API_URL}/public/images/products/${item.products.image}`,
                                        }}
                                        style={{
                                            width: 50,
                                            height: 50,
                                            borderRadius: 8,
                                            marginRight: 10,
                                        }}
                                    />
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontWeight: "600" }}>
                                            {item.products.name}
                                        </Text>
                                        <Text style={{ fontSize: 13, color: "#555" }}>
                                            {item.user.name}
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
}
