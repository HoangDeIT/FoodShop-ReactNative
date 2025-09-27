import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Alert } from "react-native";
import { Button } from "react-native-paper";

const HomePage = () => {
    const handleLogout = () => {
        Alert.alert('Đăng xuất', 'Bạn chắc chắn đăng xuất người dùng ?', [
            {
                text: 'Hủy',
                style: 'cancel',
            },
            {
                text: 'Xác nhận'
                , onPress: async () => {
                    await AsyncStorage.clear()
                    router.replace("/(auth)/login")
                }
            },
        ]);
    }
    return (
        <Button onPress={handleLogout}>Logout</Button>
    )
}
export default HomePage;