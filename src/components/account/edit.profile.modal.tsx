import { uploadFile } from "@/utils/chats.api";
import { updateProfileApi } from "@/utils/customer.api";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { Avatar, Button, Modal, Portal, Text, TextInput } from "react-native-paper";

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function EditProfileModal({
    visible,
    onClose,
    user,
    onUpdated,
}: {
    visible: boolean;
    onClose: () => void;
    user: { name: string; avatar?: string };
    onUpdated: () => void;
}) {
    const [name, setName] = useState("");
    const [avatar, setAvatar] = useState("");

    // ✔️ Mỗi lần mở modal → reset dữ liệu
    useEffect(() => {
        if (visible) {
            setName(user?.name || "");
            setAvatar(user?.avatar || "");
        }
    }, [visible, user]);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            quality: 0.7,
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
        });

        if (!result.canceled) {
            const selected = result.assets[0].uri;

            // Upload → backend trả về fileName
            const uploadRes = await uploadFile(selected, "users");
            // 👇 Chỉ lưu tên file
            setAvatar(uploadRes.fileName);
            console.log(`=========${process.env.EXPO_PUBLIC_API_URL}/public/images/users/${avatar}`)
        }
    };

    const handleSave = async () => {
        const res = await updateProfileApi({ name, avatar });
        console.log("Update profile response:", res);
        onUpdated();
        onClose();
    };

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onClose}
                contentContainerStyle={{
                    backgroundColor: "#fff",
                    padding: 20,
                    margin: 20,
                    borderRadius: 10
                }}
            >
                <View style={{ alignItems: "center", marginBottom: 20 }}>
                    <Pressable onPress={pickImage}>
                        <Avatar.Image
                            size={80}
                            source={{
                                uri: avatar
                                    ? `${process.env.EXPO_PUBLIC_API_URL}/public/images/users/${avatar}`
                                    : "https://i.pravatar.cc/150?img=12",
                            }}
                        />

                    </Pressable>
                    <Text style={{ marginTop: 5 }}>Nhấn để đổi avatar</Text>
                </View>

                <TextInput
                    label="Tên"
                    value={name}
                    onChangeText={setName}
                    mode="outlined"
                    style={{ marginBottom: 15 }}
                />

                <Button mode="contained" onPress={handleSave}>
                    Lưu thay đổi
                </Button>
            </Modal>
        </Portal>
    );
}
