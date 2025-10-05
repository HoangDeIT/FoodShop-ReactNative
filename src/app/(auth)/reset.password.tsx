import Background from "@/assets/images/background-food.jpg";
import { resetPasswordApi } from "@/utils/api.auth";

import { BlurView } from "expo-blur";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
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

export default function ResetPassword() {
    const router = useRouter();
    const { email, otp } = useLocalSearchParams<{ email: string; otp: string }>();

    const [newPassword, setNewPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState<{ visible: boolean; message: string; type: "success" | "error" }>({
        visible: false,
        message: "",
        type: "success",
    });

    const [showPwd, setShowPwd] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // 🧠 Strength indicator
    const passwordStrength = useMemo(() => {
        const v = newPassword || "";
        if (!v) return { label: "", color: "transparent" };
        if (v.length < 6) return { label: "Weak", color: "#ef5350" };
        if (/^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(v)) return { label: "Medium", color: "#ffb300" };
        if (/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/.test(v)) return { label: "Strong", color: "#3ddc84" };
        return { label: "Weak", color: "#ef5350" };
    }, [newPassword]);

    const passwordsMatch = confirm === newPassword;

    const handleResetPassword = async () => {
        if (!email || !otp) {
            setSnackbar({ visible: true, message: "Invalid reset link.", type: "error" });
            return;
        }
        if (newPassword.length < 6 || !passwordsMatch) {
            setSnackbar({ visible: true, message: "Password is invalid or not matched.", type: "error" });
            return;
        }

        try {
            setLoading(true);
            const res = await resetPasswordApi({ newPassword, otp, email });
            if (!res.error) {
                setSnackbar({ visible: true, message: "Password reset successfully!", type: "success" });
                setNewPassword("");
                setConfirm("");
                setTimeout(() => {
                    router.replace("/login");
                }, 1500);
            } else {
                setSnackbar({ visible: true, message: res.message ?? "Reset password failed!", type: "error" });
            }
        } catch (e: any) {
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
                    <ImageBackground source={Background} style={styles.container} resizeMode="cover">
                        <BlurView intensity={80} tint="dark" style={styles.blurBox}>
                            <Text style={styles.title}>Reset Password</Text>

                            <Text style={styles.subtitle}>
                                Please enter your new password below. Make sure it’s strong and different from your old one.
                            </Text>

                            <TextInput
                                label={
                                    <Text style={{ fontSize: 14, fontWeight: "bold", color: "#2e7d32" }}>
                                        New Password
                                    </Text>
                                }
                                secureTextEntry={!showPwd}
                                mode="flat"
                                value={newPassword}
                                onChangeText={setNewPassword}
                                left={<TextInput.Icon icon="lock" color="#388e3c" />}
                                right={
                                    <TextInput.Icon
                                        icon={showPwd ? "eye-off" : "eye"}
                                        onPress={() => setShowPwd((p) => !p)}
                                    />
                                }
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
                            />
                            <Text style={{ color: passwordStrength.color, fontSize: 12, marginBottom: 8 }}>
                                Strength: {passwordStrength.label || "—"}
                            </Text>

                            <TextInput
                                label={
                                    <Text style={{ fontSize: 14, fontWeight: "bold", color: "#2e7d32" }}>
                                        Confirm Password
                                    </Text>
                                }
                                secureTextEntry={!showConfirm}
                                mode="flat"
                                value={confirm}
                                onChangeText={setConfirm}
                                left={<TextInput.Icon icon="lock-check" color="#388e3c" />}
                                right={
                                    <TextInput.Icon
                                        icon={showConfirm ? "eye-off" : "eye"}
                                        onPress={() => setShowConfirm((p) => !p)}
                                    />
                                }
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
                            />
                            <HelperText type="error" visible={confirm.length > 0 && !passwordsMatch}>
                                Passwords do not match
                            </HelperText>

                            <Button
                                mode="contained"
                                style={styles.button}
                                buttonColor="#3ddc84"
                                labelStyle={{ color: "white", fontWeight: "bold" }}
                                onPress={handleResetPassword}
                                loading={loading}
                                disabled={loading}
                            >
                                RESET PASSWORD
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
    container: { flex: 1, justifyContent: "center", alignItems: "center" },
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
    button: { borderRadius: 25, marginVertical: 10 },
    link: { color: "#3ddc84", textAlign: "center", marginVertical: 6 },
    bottomRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
    },
});
