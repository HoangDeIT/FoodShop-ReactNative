import { changePasswordApi } from "@/utils/customer.api";
import { useState } from "react";
import { Alert } from "react-native";
import { Button, Modal, Portal, TextInput } from "react-native-paper";

export default function ChangePasswordModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
    const [oldPass, setOldPass] = useState("");
    const [newPass, setNewPass] = useState("");


    const handleChange = async () => {
        try {
            const res = await changePasswordApi(oldPass, newPass);
            console.log("Change password response:", res);
            if (res.error) {
                Alert.alert("Lỗi đổi mật khẩu: ", res?.message ?? "Có lỗi xảy ra, vui lòng thử lại!");
                return;
            }

            Alert.alert("Thành công", "Bạn đã đổi mật khẩu thành công!");
            onClose();

        } catch (err: any) {
            // lỗi từ axios (backend throw exception)
            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                "Có lỗi xảy ra, vui lòng thử lại!";

            Alert.alert("Lỗi", msg);
        }
    };

    return (
        <Portal>
            <Modal visible={visible} onDismiss={onClose} contentContainerStyle={{ backgroundColor: "#fff", padding: 20, margin: 20, borderRadius: 10 }}>
                <TextInput
                    label="Mật khẩu cũ"
                    value={oldPass}
                    onChangeText={setOldPass}
                    secureTextEntry
                    mode="outlined"
                    style={{ marginBottom: 15 }}
                />

                <TextInput
                    label="Mật khẩu mới"
                    value={newPass}
                    onChangeText={setNewPass}
                    secureTextEntry
                    mode="outlined"
                    style={{ marginBottom: 20 }}
                />

                <Button mode="contained" onPress={handleChange}>
                    Đổi mật khẩu
                </Button>
            </Modal>
        </Portal>
    );
}
