import Background from "@/assets/images/background-food.jpg";
import { registerApi } from "@/utils/api.auth";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
    ImageBackground,
    Keyboard,
    TextInput as RNTextInput,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Button, HelperText, Snackbar, TextInput } from "react-native-paper";

export default function Register() {
    const router = useRouter();
    // form states
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // ui states
    const [loading, setLoading] = useState(false);
    const [showPwd, setShowPwd] = useState(false);
    const [showPwd2, setShowPwd2] = useState(false);
    const [snackbar, setSnackbar] = useState<{ visible: boolean; message: string }>(
        { visible: false, message: "" }
    );

    // refs để next focus mượt
    const nameRef = useRef<RNTextInput>(null);
    const emailRef = useRef<RNTextInput>(null);
    const passwordRef = useRef<RNTextInput>(null);
    const confirmRef = useRef<RNTextInput>(null);


    // validators
    const isEmail = (v: string) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

    const passwordStrength = useMemo(() => {
        const v = password || "";
        let score = 0;
        if (v.length >= 6) score++;
        if (/[A-Z]/.test(v) || /[a-z]/.test(v)) score++;
        if (/\d/.test(v)) score++;
        if (/[^A-Za-z0-9]/.test(v)) score++; // ký tự đặc biệt
        // map về 0..3 để hiển thị gọn
        return Math.min(score, 3);
    }, [password]);

    const strengthLabel = ["Weak", "Medium", "Strong"][Math.max(0, passwordStrength - 1)] || "Weak";
    const strengthColor = passwordStrength >= 3 ? "#3ddc84" : passwordStrength === 2 ? "#ffb300" : "#ef5350";
    const strengthWidth = passwordStrength === 0 ? "0%" : passwordStrength === 1 ? "33%" : passwordStrength === 2 ? "66%" : "100%";

    const emailError = email.length > 0 && !isEmail(email);
    const confirmError = confirmPassword.length > 0 && confirmPassword !== password;
    const pwdError = password.length > 0 && password.length < 6;

    const formValid =
        name.trim().length > 0 &&
        isEmail(email) &&
        password.length >= 6 &&
        confirmPassword === password;

    const inputTheme = {
        colors: {
            background: "transparent",
            onSurfaceVariant: "#66bb6a", // label khi chưa focus
            primary: "#4caf50",          // label khi focus
            outline: "#a5d6a7",          // viền xanh nhạt
        },
    } as const;



    const handleSubmit = async () => {
        if (!formValid || loading) return;

        try {
            setLoading(true);
            // payload giống bên Next.js: role = seller
            const payload = {
                name: name.trim(),
                email: email.trim(),
                password,
                role: "customer",
            };
            const res = await registerApi(payload); // => { error?: string }
            if (!res?.error) {
                setSnackbar({ visible: true, message: "Register successful! Please verify your account. Check your email." });
                // điều hướng giống Next.js
                router.push({ pathname: "/verify", params: { email: payload.email, type: "register" } });
                // reset form
                setName("");
                setEmail("");
                setPassword("");
                setConfirmPassword("");
            } else {
                setSnackbar({ visible: true, message: res.message ?? "Register failed! Something went wrong." });
            }
        } catch (e: any) {
            setSnackbar({ visible: true, message: e?.message ?? "Register failed! Network error." });
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
                            <Text style={styles.title}>Sign Up</Text>

                            {/* Name */}
                            <TextInput
                                label={
                                    <Text style={{ fontSize: 14, fontWeight: "bold", color: "#2e7d32" }}>
                                        Name
                                    </Text>
                                }
                                mode="flat"
                                value={name}
                                onChangeText={setName}
                                left={<TextInput.Icon icon="account" color="#388e3c" />}
                                style={styles.input}
                                underlineColor="transparent"
                                activeUnderlineColor="transparent"
                                textColor="#1b5e20"
                                theme={inputTheme}
                                ref={nameRef}
                                returnKeyType="next"
                                onSubmitEditing={() => emailRef.current?.focus()}
                            />
                            <HelperText type={name.trim() ? "info" : "error"} visible={false}>
                                Invalid name

                            </HelperText>

                            {/* Email */}
                            <TextInput
                                label={
                                    <Text style={{ fontSize: 14, fontWeight: "bold", color: "#2e7d32" }}>
                                        Email
                                    </Text>
                                }
                                mode="flat"
                                autoCapitalize="none"
                                keyboardType="email-address"
                                value={email}
                                onChangeText={setEmail}
                                left={<TextInput.Icon icon="email" color="#388e3c" />}
                                style={styles.input}
                                underlineColor="transparent"
                                activeUnderlineColor="transparent"
                                textColor="#1b5e20"
                                theme={inputTheme}
                                ref={emailRef}
                                returnKeyType="next"
                                onSubmitEditing={() => passwordRef.current?.focus()}
                                error={emailError}
                            />
                            <HelperText type="error" visible={emailError}>
                                Invalid email address
                            </HelperText>

                            {/* Password */}
                            <TextInput
                                label={
                                    <Text style={{ fontSize: 14, fontWeight: "bold", color: "#2e7d32" }}>
                                        Password
                                    </Text>
                                }
                                secureTextEntry={!showPwd}
                                mode="flat"
                                value={password}
                                onChangeText={setPassword}
                                left={<TextInput.Icon icon="lock" color="#388e3c" />}
                                right={
                                    <TextInput.Icon
                                        icon={showPwd ? "eye-off" : "eye"}
                                        onPress={() => setShowPwd((s) => !s)}
                                    />
                                }
                                style={styles.input}
                                underlineColor="transparent"
                                activeUnderlineColor="transparent"
                                textColor="#1b5e20"
                                theme={inputTheme}
                                ref={passwordRef}
                                returnKeyType="next"
                                onSubmitEditing={() => confirmRef.current?.focus()}
                                error={pwdError}
                            />
                            {/* Strength indicator */}
                            <View style={{ marginTop: -8, marginBottom: 8 }}>
                                <Text style={{ fontSize: 12, color: "#ddd", marginBottom: 6 }}>
                                    Password must be at least 6 characters, include a number and a letter.
                                </Text>
                                <View style={{ height: 6, backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 6, overflow: "hidden" }}>
                                    <View style={{ height: 6, width: strengthWidth, backgroundColor: strengthColor }} />
                                </View>
                                <Text style={{ fontSize: 12, color: strengthColor, marginTop: 4 }}>{strengthLabel}</Text>
                            </View>
                            <HelperText type="error" visible={pwdError}>
                                Password is too short
                            </HelperText>

                            {/* Confirm Password */}
                            <TextInput
                                label={
                                    <Text style={{ fontSize: 14, fontWeight: "bold", color: "#2e7d32" }}>
                                        Confirm Password
                                    </Text>
                                }
                                secureTextEntry={!showPwd2}
                                mode="flat"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                left={<TextInput.Icon icon="lock-check" color="#388e3c" />}
                                right={
                                    <TextInput.Icon
                                        icon={showPwd2 ? "eye-off" : "eye"}
                                        onPress={() => setShowPwd2((s) => !s)}
                                    />
                                }
                                style={styles.input}
                                underlineColor="transparent"
                                activeUnderlineColor="transparent"
                                textColor="#1b5e20"
                                theme={inputTheme}
                                ref={confirmRef}
                                returnKeyType="done"
                                onSubmitEditing={handleSubmit}
                                error={confirmError}
                            />
                            <HelperText type="error" visible={confirmError}>
                                Passwords do not match
                            </HelperText>

                            <Button
                                mode="contained"
                                style={styles.button}
                                buttonColor="#3ddc84"
                                labelStyle={{ color: "white", fontWeight: "bold" }}
                                onPress={handleSubmit}
                                loading={loading}
                                disabled={loading || !formValid}
                            >
                                SIGN UP
                            </Button>

                            <View style={styles.bottomRow}>
                                <Text style={{ color: "white" }}>Already have an account?</Text>
                                <TouchableOpacity onPress={() => router.push("/login")}>
                                    <Text style={[styles.link, { marginLeft: 5 }]}>Login</Text>
                                </TouchableOpacity>
                            </View>
                        </BlurView>

                        <Snackbar
                            visible={snackbar.visible}
                            onDismiss={() => setSnackbar({ visible: false, message: "" })}
                            duration={2500}
                            style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
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
        padding: 20,
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
        marginBottom: 20,
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
