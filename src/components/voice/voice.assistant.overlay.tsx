import { useAssistantVoice } from "@/context/voice.context";
import { StyleSheet, Text, View } from "react-native";
import { Portal } from "react-native-paper";

export default function VoiceAssistantOverlay() {
    const { isAssistantOn, userText, botText } = useAssistantVoice();

    if (!isAssistantOn) return null;

    return (
        <Portal>
            <View style={styles.overlay}>
                <Text style={styles.user}>🗣 {userText}</Text>
                <Text style={styles.bot}>🤖 {botText}</Text>
            </View>
        </Portal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: "absolute",
        bottom: 100,
        left: 0,
        right: 0,
        alignItems: "center",
    },
    user: {
        backgroundColor: "#333",
        color: "#fff",
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
    },
    bot: {
        backgroundColor: "#FF7A00",
        color: "#fff",
        padding: 10,
        borderRadius: 10,
    },
});