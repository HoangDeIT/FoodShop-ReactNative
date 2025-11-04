// src/utils/notifications.ts
import axios from 'axios';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,

        // 🆕 Bổ sung 2 dòng dưới để đúng type mới
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});


// Đăng ký và gửi token về server
export async function registerForPushNotificationsAsync(access_token: string) {
    try {
        if (!Device.isDevice) {
            alert('Phải dùng thiết bị thật để nhận thông báo!');
            return;
        }

        // 1️⃣ Xin quyền notification
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            alert('Không có quyền gửi thông báo!');
            return;
        }

        // 2️⃣ Lấy Expo Push Token (FCM v1)
        const projectId =
            Constants.expoConfig?.extra?.eas?.projectId ||
            Constants.easConfig?.projectId ||
            'your-fallback-project-id';
        console.log('📦 projectId đang dùng:', projectId);
        const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
        const token = tokenResponse.data;
        console.log('Expo Push Token:', token);

        // 3️⃣ Kiểm tra token cũ (để tránh gửi trùng)
        const oldToken = await Notifications.getDevicePushTokenAsync();
        if (oldToken?.data === token) {
            console.log('⚠️ Token không đổi, bỏ qua gửi lại.');
            return token;
        }

        // 4️⃣ Gửi token về backend
        await axios.post(
            `${process.env.EXPO_PUBLIC_API_URL}/api/v1/users/expo-token`,
            {
                token,
            },
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }
        );

        console.log('✅ Gửi Expo token về server thành công!');
        return token;
    } catch (err) {
        console.error('❌ Lỗi lấy/gửi Expo token:', JSON.stringify(err, null, 2));
    }
}


// Lắng nghe notification khi app mở
export function listenNotificationEvents() {
    console.log("👂 Bắt đầu lắng nghe thông báo...");

    Notifications.addNotificationReceivedListener(notification => {
        console.log('📩 Nhận thông báo:', notification);
    });

    Notifications.addNotificationResponseReceivedListener(response => {
        console.log('📲 Người dùng bấm thông báo:', response);
    });
}
