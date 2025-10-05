import Background from "@/assets/images/background-food.jpg";
import { verifyOtpApi } from "@/utils/api.auth";
import { BlurView } from "expo-blur";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
    ImageBackground,
    Keyboard,
    TextInput as RNTextInput,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Button, Snackbar } from "react-native-paper";

export default function OtpScreen() {
    // 📨 Nhận email và type từ route: /otp?email=...&type=register
    const { email, type } = useLocalSearchParams<{ email: string; type: "register" | "forgotPassword" }>();
    const router = useRouter();

    const [otp, setOtp] = useState(Array(6).fill(""));
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState<{ visible: boolean; message: string; type: "success" | "error" }>({
        visible: false,
        message: "",
        type: "success",
    });

    const inputs = useRef<RNTextInput[]>([]);

    // 🧠 Khi nhập vào từng ô
    const handleChange = (text: string, index: number) => {
        if (!/^\d*$/.test(text)) return; // chỉ cho nhập số

        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        if (text && index < 5) inputs.current[index + 1]?.focus();

        if (newOtp.join("").length === 6) {
            Keyboard.dismiss();
            verifyOtp(newOtp.join(""));
        }
    };

    // ⌫ Khi nhấn Backspace
    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === "Backspace" && otp[index] === "" && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    // // 📋 Khi paste code 6 số
    // const handlePaste = async (e: any) => {
    //     const pasteData = e.nativeEvent.text;
    //     if (/^\d{6}$/.test(pasteData)) {
    //         setOtp(pasteData.split(""));
    //         Keyboard.dismiss();
    //         verifyOtp(pasteData);
    //     }
    // };

    // 🔍 Gọi API verify
    const verifyOtp = async (code: string) => {
        try {
            setLoading(true);
            const res = await verifyOtpApi({ email, otp: code });
            console.log(res)
            if (!res.error) {
                setSnackbar({ visible: true, message: "OTP Verified Successfully!", type: "success" });
                setOtp(Array(6).fill(""));

                setTimeout(() => {
                    if (type === "register") {
                        router.replace("/login");
                    } else {
                        router.replace({
                            pathname: "/reset.password",
                            params: { email, otp: code },
                        });
                    }
                }, 1200);
            } else {
                setSnackbar({ visible: true, message: res.message ?? "Invalid OTP!", type: "error" });
            }
        } catch (error: any) {
            setSnackbar({ visible: true, message: "Network error. Please try again.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <KeyboardAwareScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
                keyboardShouldPersistTaps="handled"
                enableOnAndroid
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ImageBackground source={Background} style={styles.container} resizeMode="cover">
                        <BlurView intensity={80} tint="dark" style={styles.blurBox}>
                            <Text style={styles.title}>Verify OTP</Text>

                            <View style={styles.otpContainer}>
                                {otp.map((digit, index) => (
                                    <RNTextInput
                                        key={index}
                                        ref={(ref) => {
                                            inputs.current[index] = ref!;
                                        }}
                                        value={digit}
                                        onChangeText={(text) => handleChange(text, index)}
                                        onKeyPress={(e) => handleKeyPress(e, index)}
                                        onFocus={() => setFocusedIndex(index)}
                                        onBlur={() => setFocusedIndex(null)}
                                        keyboardType="numeric"
                                        maxLength={1}
                                        style={[
                                            styles.otpInput,
                                            focusedIndex === index && styles.otpInputFocused,
                                        ]}
                                        autoFocus={index === 0}
                                    />
                                ))}
                            </View>

                            <Text style={styles.subtitle}>
                                Please enter the 6-digit code we sent to{" "}
                                <Text style={{ color: "#3ddc84", fontWeight: "600" }}>{email}</Text>.
                            </Text>

                            <Button
                                mode="contained"
                                style={styles.button}
                                buttonColor="#3ddc84"
                                labelStyle={{ color: "white", fontWeight: "bold" }}
                                onPress={() => verifyOtp(otp.join(""))}
                                disabled={otp.join("").length < 6 || loading}
                                loading={loading}
                            >
                                VERIFY
                            </Button>
                        </BlurView>
                        <Snackbar
                            visible={snackbar.visible}
                            onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
                            duration={2500}
                            style={{
                                backgroundColor: snackbar.type === "success" ? "#2e7d32" : "#d32f2f",
                            }}
                        >
                            {snackbar.message}
                        </Snackbar>
                    </ImageBackground>
                </TouchableWithoutFeedback>
            </KeyboardAwareScrollView>


        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    blurBox: {
        width: "85%",
        padding: 25,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
        backgroundColor: "rgba(255,255,255,0.05)",
        alignItems: "center",
    },
    title: {
        fontSize: 26,
        fontWeight: "bold",
        color: "white",
        textAlign: "center",
        marginBottom: 25,
    },
    subtitle: {
        color: "#ddd",
        textAlign: "center",
        fontSize: 14,
        marginBottom: 25,
        marginTop: 5,
        width: "90%",
    },
    otpContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "90%",
        marginVertical: 20,
    },
    otpInput: {
        width: 50,
        height: 58,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: "rgba(255,255,255,0.3)",
        textAlign: "center",
        fontSize: 22,
        fontWeight: "600",
        color: "#1b5e20",
        backgroundColor: "rgba(255,255,255,0.95)",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    otpInputFocused: {
        borderColor: "#3ddc84",
        shadowColor: "#3ddc84",
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    button: {
        borderRadius: 25,
        marginTop: 10,
        width: "80%",
    },
});
