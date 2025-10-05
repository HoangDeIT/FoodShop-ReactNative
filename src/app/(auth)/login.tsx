import Background from "@/assets/images/background-food.jpg";
import { useCurrentApp } from "@/context/app.context";
import { loginApi } from "@/utils/api.auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ImageBackground, Keyboard, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Button, Snackbar, Text, TextInput, useTheme } from "react-native-paper";
export default function LoginScreen() {
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { setAppState } = useCurrentApp();
  const [snackbar, setSnackbar] = useState<{
    visible: boolean;
    message: string;
    type: "success" | "error";
  }>({
    visible: false,
    message: "",
    type: "success",
  });
  const login = async () => {
    if (!email || !password) {
      setSnackbar({
        visible: true,
        message: "Please enter both email and password.",
        type: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await loginApi(email, password);

      // OTP chưa verify
      if (res.statusCode === 999) {
        setSnackbar({
          visible: true,
          message: "Your account is not verified. Please check your email.",
          type: "error",
        });
        router.push({
          pathname: "/verify",
          params: { email, type: "register" },
        });
      }

      // Đăng nhập thành công
      else if (res.data) {
        setSnackbar({
          visible: true,
          message: "Login successful!",
          type: "success",
        });
        await AsyncStorage.setItem("access_token", res.data.access_token);
        setAppState(res.data);
        setEmail("");
        setPassword("");
        setTimeout(() => {
          router.replace("/(tabs)");
        }, 1200);
      } else {
        setSnackbar({
          visible: true,
          message: "Login failed. Please check your credentials.",
          type: "error",
        });
      }
    } catch (err: any) {
      setSnackbar({
        visible: true,
        message: "Network error. Please try again later.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };
  return (


    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
      enableOnAndroid={true}
      extraScrollHeight={20} // đẩy thêm chút khi focus
      keyboardShouldPersistTaps="handled"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{ flex: 1 }}>
        <ImageBackground
          source={Background}
          style={styles.container}
          resizeMode="cover"
        >

          <BlurView intensity={80} tint="dark" style={styles.blurBox}>
            <Text style={styles.title}>Login</Text>
            <TextInput
              label={
                <Text style={{ fontSize: 14, fontWeight: "bold", color: "#2e7d32" }}>
                  Email
                </Text>
              }
              mode="flat"
              value={email}
              onChangeText={setEmail}
              left={<TextInput.Icon icon="email" color="#388e3c" />} // icon xanh
              style={styles.input}
              underlineColor="transparent"       // bỏ line khi chưa focus
              activeUnderlineColor="transparent" // bỏ line khi focus
              textColor="#1b5e20"   // chữ nhập xanh đậm
              theme={{
                colors: {
                  background: "transparent",
                  onSurfaceVariant: "#66bb6a",  // label khi chưa focus
                  primary: "#4caf50",           // label khi focus
                  outline: "#a5d6a7",           // viền xanh nhạt
                },
              }}
            />



            <TextInput
              label={
                <Text style={{ fontSize: 14, fontWeight: "bold", color: "#2e7d32" }}>
                  Password
                </Text>
              }
              secureTextEntry
              mode="flat"
              value={password}
              onChangeText={setPassword}
              left={<TextInput.Icon icon="lock" color="#388e3c" />} // icon xanh
              style={styles.input}
              underlineColor="transparent"       // bỏ line khi chưa focus
              activeUnderlineColor="transparent" // bỏ line khi focus
              textColor="#1b5e20"   // chữ nhập xanh đậm
              theme={{
                colors: {
                  background: "transparent",
                  onSurfaceVariant: "#66bb6a",  // label khi chưa focus
                  primary: "#4caf50",           // label khi focus
                  outline: "#a5d6a7",           // viền xanh nhạt
                },
              }}
            />

            <Button
              mode="contained"
              style={styles.button}
              buttonColor="#3ddc84"
              labelStyle={{ color: "white", fontWeight: "bold" }}
              onPress={() => login()}
              loading={loading}
              disabled={loading}
            >
              SIGN IN
            </Button>

            <TouchableOpacity onPress={() => router.push("/forgot.password")}>
              <Text style={styles.link}>Forgot password?</Text>
            </TouchableOpacity>

            <View style={styles.bottomRow}>
              <Text style={{ color: "white" }}>Don’t have an account?</Text>
              <TouchableOpacity onPress={() => router.push("/register")}>
                <Text style={[styles.link, { marginLeft: 5 }]}>Sign up</Text>
              </TouchableOpacity>
            </View>

          </BlurView>
          {/* ✅ Snackbar hiển thị thông báo */}
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
  input: {
    marginBottom: 16,
    fontSize: 16,       // chữ nhập to hơn
    height: 55,         // input cao hơn
    backgroundColor: "rgba(255,255,255,0.9)", // sáng, trong mờ
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
    alignItems: "center", // canh giữa theo trục dọc
    marginTop: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 20,
  },
});
