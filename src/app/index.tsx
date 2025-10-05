
import { useCurrentApp } from "@/context/app.context";
import { getAccountAPI } from "@/utils/api.auth";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from "react";
const RootPage = () => {
    const { setAppState } = useCurrentApp();
    const [state, setState] = useState<any>();
    // const [loaded, error] = useFonts({ [APP_FONT]: require("@/assets/font/OpenSans-Regular.ttf") });
    SplashScreen.preventAutoHideAsync();
    // if (true) {
    //     return (
    //         <Redirect href={"/(tabs)"} />
    //     )
    // }
    useEffect(() => {
        const fetchAccount = async () => {
            try {
                const res = await getAccountAPI();
                console.log("Get profile response:", res);
                if (res.data) {
                    setAppState({
                        ...res.data,
                        access_token: await AsyncStorage.getItem("access_token") ?? ""
                    })
                    router.replace("/(tabs)")
                } else {
                    AsyncStorage.clear()
                    router.replace("/(auth)/login")
                }
            } catch (error) {
                setState(() => {
                    throw new Error("Can not connect to backend");
                })
            } finally {
                await SplashScreen.hideAsync();
            }
        }
        fetchAccount();
    }, [])
    return (

        <></>
    )
}
export default RootPage;