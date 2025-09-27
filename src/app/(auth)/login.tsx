import Background from "@/assets/images/background-food.jpg";
import { useCurrentApp } from "@/context/app.context";
import { loginApi } from "@/utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ImageBackground, Keyboard, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Button, Text, TextInput, useTheme } from "react-native-paper";
export default function LoginScreen() {
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { setAppState } = useCurrentApp();
  const login = async () => {
    setLoading(true);
    const res = await loginApi(email, password);

    console.log("Login response:", res);
    if (res.data) {
      router.replace("/(tabs)");
      setAppState(res.data);
      await AsyncStorage.setItem("access_token", res.data.access_token);
      setEmail("");
      setPassword("");
    } else {
      alert("Login failed");
    }
    setLoading(false);
  }
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

            <TouchableOpacity>
              <Text style={styles.link}>Forgot password?</Text>
            </TouchableOpacity>

            <View style={styles.bottomRow}>
              <Text style={{ color: "white" }}>Don’t have an account?</Text>
              <TouchableOpacity>
                <Text style={[styles.link, { marginLeft: 5 }]}>Sign up</Text>
              </TouchableOpacity>
            </View>

          </BlurView>

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
