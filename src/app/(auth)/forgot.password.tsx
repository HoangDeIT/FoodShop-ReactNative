import Background from "@/assets/images/background-food.jpg";
import { forgotPasswordApi } from "@/utils/api.auth";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ImageBackground,
    Keyboard,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Button, HelperText, Snackbar, TextInput } from "react-native-paper";

export default function ForgotPassword() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState<{ visible: boolean; message: string; type: "success" | "error" }>({
        visible: false,
        message: "",
        type: "success",
    });

    // 🧠 Validate email
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

    // 📬 Gửi OTP
    const handleSendOtp = async () => {
        if (!isEmailValid) {
            setSnackbar({ visible: true, message: "Please enter a valid email address.", type: "error" });
            return;
        }

        try {
            setLoading(true);
            const res = await forgotPasswordApi(email.trim());
            if (!res.error) {
                setSnackbar({ visible: true, message: "OTP sent successfully! Please check your email.", type: "success" });
                setEmail("");
                setTimeout(() => {
                    router.push({
                        pathname: "/verify",
                        params: { email, type: "forgotPassword" },
                    });
                }, 1200);
            } else {
                setSnackbar({ visible: true, message: res.message ?? "Failed to send OTP.", type: "error" });
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
                extraScrollHeight={20}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ImageBackground
                        source={Background}
                        style={styles.container}
                        resizeMode="cover"
                    >
                        <BlurView intensity={80} tint="dark" style={styles.blurBox}>
                            <Text style={styles.title}>Forgot Password</Text>

                            <Text style={styles.subtitle}>
                                Enter your registered email address and we’ll send you an OTP to reset your password.
                            </Text>

                            <TextInput
                                label={
                                    <Text style={{ fontSize: 14, fontWeight: "bold", color: "#2e7d32" }}>
                                        Email
                                    </Text>
                                }
                                mode="flat"
                                value={email}
                                onChangeText={setEmail}
                                left={<TextInput.Icon icon="email" color="#388e3c" />}
                                style={styles.input}
                                underlineColor="transparent"
                                activeUnderlineColor="transparent"
                                textColor="#1b5e20"
                                theme={{
                                    colors: {
                                        background: "transparent",
                                        onSurfaceVariant: "#66bb6a",
                                        primary: "#4caf50",
                                        outline: "#a5d6a7",
                                    },
                                }}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                            <HelperText type="error" visible={email.length > 0 && !isEmailValid}>
                                Invalid email format
                            </HelperText>

                            <Button
                                mode="contained"
                                style={styles.button}
                                buttonColor="#3ddc84"
                                labelStyle={{ color: "white", fontWeight: "bold" }}
                                onPress={handleSendOtp}
                                loading={loading}
                                disabled={loading}
                            >
                                SEND OTP
                            </Button>

                            <View style={styles.bottomRow}>
                                <Text style={{ color: "white" }}>Remembered your password?</Text>
                                <Text
                                    style={[styles.link, { marginLeft: 5 }]}
                                    onPress={() => router.push("/login")}
                                >
                                    Back to Login
                                </Text>
                            </View>
                        </BlurView>
                    </ImageBackground>
                </TouchableWithoutFeedback>
            </KeyboardAwareScrollView>

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
    },
    title: {
        fontSize: 26,
        fontWeight: "bold",
        color: "white",
        textAlign: "center",
        marginBottom: 15,
    },
    subtitle: {
        color: "#ddd",
        textAlign: "center",
        fontSize: 14,
        marginBottom: 25,
    },
    input: {
        marginBottom: 16,
        height: 55,
        fontSize: 16,
        backgroundColor: "rgba(255,255,255,0.9)",
        borderRadius: 12,
    },
    button: {
        borderRadius: 25,
        marginVertical: 10,
    },
    link: {
        color: "#3ddc84",
        textAlign: "center",
        marginVertical: 6,
    },
    bottomRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
    },
});
