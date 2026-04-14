import * as Speech from "expo-speech";
import { ExpoSpeechRecognitionModule } from "expo-speech-recognition";

export const speakWithControl = (
    text: string,
    setIsSpeaking: (v: boolean) => void,
    startListening: () => void
) => {
    Speech.speak(text, {
        language: "vi-VN",

        onStart: () => {
            setIsSpeaking(true);
            ExpoSpeechRecognitionModule.stop(); // 🛑 tắt mic global
        },

        onDone: () => {
            setIsSpeaking(false);
            startListening(); // 🔁 bật lại mic
        },

        onStopped: () => {
            setIsSpeaking(false);
            startListening();
        }
    });
};