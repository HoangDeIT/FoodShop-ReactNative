import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useEffect, useMemo, useRef, useState } from "react";
import { Image, Text, View } from "react-native";
import { Button, Checkbox, IconButton, RadioButton } from "react-native-paper";

interface Option {
    id: string;
    name: string;
    price: number;
}

interface Props {
    visible: boolean;
    onClose: () => void;
    product: {
        name: string;
        image: string;
        basePrice: number;
    };
    sizes: Option[];
    toppings: Option[];
}

const ProductOptionsSheet = ({ visible, onClose, product, sizes, toppings }: Props) => {
    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ["70%"], []);
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [selectedToppings, setSelectedToppings] = useState<string[]>([]);

    const toggleTopping = (id: string) => {
        setSelectedToppings((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const totalPrice =
        product.basePrice +
        (sizes.find((s) => s.id === selectedSize)?.price || 0) +
        selectedToppings.reduce(
            (sum, id) => sum + (toppings.find((t) => t.id === id)?.price || 0),
            0
        );
    useEffect(() => {
        if (visible) {
            bottomSheetRef.current?.expand();

        } else {
            bottomSheetRef.current?.close();
        }
    }, [visible]);
    return (
        <BottomSheet
            ref={bottomSheetRef}
            index={-1}
            snapPoints={snapPoints}
            enablePanDownToClose
            onClose={onClose}
            style={{ ZIndex: 1000 }}
        >
            <BottomSheetView style={{ flex: 1 }}>
                <View style={{ paddingHorizontal: 16 }}>
                    {/* Header */}
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                        <Image
                            source={{ uri: product.image }}
                            style={{ width: 70, height: 70, borderRadius: 8, marginRight: 10 }}
                        />
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 18, fontWeight: "600" }}>{product.name}</Text>
                            <Text style={{ color: "gray" }}>{product.basePrice.toLocaleString()}đ</Text>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <IconButton icon="minus" onPress={() => setQuantity(Math.max(1, quantity - 1))} />
                            <Text>{quantity}</Text>
                            <IconButton icon="plus" onPress={() => setQuantity(quantity + 1)} />
                        </View>
                    </View>

                    {/* Size (radio) */}
                    <Text style={{ fontWeight: "600", marginTop: 10 }}>Kích cỡ (chọn 1)</Text>
                    <RadioButton.Group
                        onValueChange={(val) => setSelectedSize(val)}
                        value={selectedSize || ""}
                    >
                        {sizes.map((s) => (
                            <View
                                key={s.id}
                                style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: 6 }}
                            >
                                <Text>{s.name}</Text>
                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    <Text style={{ color: "gray", marginRight: 8 }}>{s.price.toLocaleString()}đ</Text>
                                    <RadioButton value={s.id} />
                                </View>
                            </View>
                        ))}
                    </RadioButton.Group>

                    {/* Topping (checkbox) */}
                    <Text style={{ fontWeight: "600", marginTop: 10 }}>Topping (chọn nhiều)</Text>
                    {toppings.map((t) => (
                        <View
                            key={t.id}
                            style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: 6 }}
                        >
                            <Text>{t.name}</Text>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <Text style={{ color: "gray", marginRight: 8 }}>{t.price.toLocaleString()}đ</Text>
                                <Checkbox
                                    status={selectedToppings.includes(t.id) ? "checked" : "unchecked"}
                                    onPress={() => toggleTopping(t.id)}
                                />
                            </View>
                        </View>
                    ))}

                    {/* Add button */}
                    <Button
                        mode="contained"
                        style={{ marginTop: 16, borderRadius: 8 }}
                        onPress={() => {
                            onClose();
                            console.log("Thêm vào giỏ:", { product, selectedSize, selectedToppings, quantity });
                        }}
                    >
                        Thêm vào giỏ hàng - {totalPrice.toLocaleString()}đ
                    </Button>
                </View>
            </BottomSheetView>
        </BottomSheet>
    );
};

export default ProductOptionsSheet;
