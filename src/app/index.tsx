import { useCurrentApp } from "@/context/app.context";
import { getAccountAPI } from "@/utils/api.auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";

// 🛡️ Guard cấp module: tồn tại qua remount trong Strict Mode
let BOOTSTRAPPED = false;
console.log("🟠 index.tsx FILE LOADED");
export default function RootPage() {
    console.log("🟠 RootPage() rendered");
    const { setAppState } = useCurrentApp();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        console.log("🟠 RootPage useEffect() fired");
        if (BOOTSTRAPPED) {
            // Đã chạy lần trước (trong chu kỳ mount đầu của Strict Mode)
            // → bỏ qua để tránh chạy lại lần 2
            return;
        }
        BOOTSTRAPPED = true;

        (async () => {
            try {
                const res = await getAccountAPI();

                if (res?.data) {
                    const token = (await AsyncStorage.getItem("access_token")) ?? "";
                    setAppState({ ...res.data, access_token: token });

                    // Delay 1 tick để Router sync trước khi điều hướng
                    setTimeout(() => router.replace("/(auth)/location.loading"), 0);
                } else {
                    await AsyncStorage.clear();
                    setTimeout(() => router.replace("/(auth)/login"), 0);
                }
            } catch (err) {
                console.log("❌ Backend error:", err);
                await AsyncStorage.clear();
                setTimeout(() => router.replace("/(auth)/login"), 0);
            } finally {
                // Ẩn splash duy nhất 1 lần
                await SplashScreen.hideAsync();
                setReady(true);
            }
        })();
    }, []);

    if (!ready) return null;
    return null;
}
