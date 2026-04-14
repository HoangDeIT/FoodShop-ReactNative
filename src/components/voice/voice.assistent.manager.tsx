import { useCurrentApp } from "@/context/app.context";
import { useUIContext } from "@/context/ui.context";
import { useAssistantVoice } from "@/context/voice.context";
import { executeFEActionsAfter, executeFEActionsBefore } from "@/services/voice/fe.action.executor";
import { speakWithControl } from "@/services/voice/tts/voice.service";
import { voiceExecute, voicePlan } from "@/utils/voice.agent.api";
import { ExpoSpeechRecognitionModule } from "expo-speech-recognition";
import { useEffect, useRef } from "react";

export default function VoiceAssistantManager() {
    const { setAppState } = useCurrentApp();
    const {
        isAlwaysListening,
        isAssistantOn,
        setIsAssistantOn,
        setUserText,
        setBotText,
        setIsSpeaking,
        isSpeaking
    } = useAssistantVoice();

    const { screen } = useUIContext();
    const isProcessing = useRef(false); // 🔥 chống spam
    const isListening = useRef(false);
    useEffect(() => {
        if (!isAlwaysListening) {
            ExpoSpeechRecognitionModule.stop();
            return;
        }

        const sub = ExpoSpeechRecognitionModule.addListener(
            "result",
            async (event) => {
                const text =
                    event.results?.[0]?.transcript?.toLowerCase() || "";

                if (!text) return;
                if (!isAssistantOn && !text.includes("trợ lý")) return;
                console.log("🎤:", text);

                // 🧠 tránh spam nhiều lần
                if (isProcessing.current || isSpeaking) return;

                isProcessing.current = true;

                try {
                    // 🌟 wake word
                    if (
                        (text.includes("trợ lý ơi") ||
                            text.includes("trợ lí ơi")) && !isAssistantOn
                    ) {
                        setIsAssistantOn(true);
                        speakWithControl("Tôi đây nè~ cần gì không UwU ✨", setIsSpeaking, startListening);
                        return;
                    }

                    // 🌟 tắt assistant
                    if (text.includes("không cần giúp")) {
                        setIsAssistantOn(false);
                        speakWithControl("Okii, khi nào cần thì gọi tôi nha~", setIsSpeaking, startListening);
                        return;
                    }

                    // 🌟 nếu assistant đang bật → xử lý command
                    if (isAssistantOn) {
                        setUserText(text);

                        const res = await voicePlan({ message: text, currentPage: screen?.currentPage || "unknown", context: screen?.context || {} });
                        console.log("🧠 plan:", res);
                        //do FE action
                        const feResults = await executeFEActionsBefore(
                            res.data?.feActions || [],
                            { setAppState }
                        );
                        console.log("🧠 FE results:", feResults);
                        ///
                        const hasFail = feResults.some(a => a.status === "failed");
                        if (hasFail) {
                            setBotText("Thiết bị gặp lỗi rồi nyaa 😭");
                            return;
                        }
                        const finalRes = await voiceExecute(
                            {
                                message: text,
                                currentPage: screen?.currentPage || "unknown",
                                context: screen?.context || {},
                                beActions: res.data?.beActions || [],
                                feActions: feResults,
                            }
                        );
                        console.log("🧠 execute result:", finalRes.data);
                        executeFEActionsAfter(finalRes?.data?.actions || []);
                        //Do FE action
                        setBotText(finalRes.data?.message || "Xử lý xong rồi nè~");

                        speakWithControl(finalRes.data?.message || "Xử lý xong rồi nè~", setIsSpeaking, startListening);
                    }
                } finally {
                    // delay nhẹ tránh spam
                    setTimeout(() => {
                        isProcessing.current = false;
                    }, 300);
                }
            }
        );
        ExpoSpeechRecognitionModule.addListener("end", () => {
            isListening.current = false;
            startListening();
        });
        startListening();

        return () => sub.remove();
    }, [isAlwaysListening, isAssistantOn]);


    const startListening = async () => {
        if (isListening.current || isProcessing.current || isSpeaking) return;

        isListening.current = true;

        const permission =
            await ExpoSpeechRecognitionModule.requestPermissionsAsync();

        if (!permission.granted) return;

        ExpoSpeechRecognitionModule.start({
            lang: "vi-VN",
            continuous: true,
            interimResults: false,
        });
    };

    return null;
}

// 🧠 fake AI
async function fakeAI(text: string) {
    return new Promise<string>((resolve) => {
        setTimeout(() => {
            if (text.includes("trà sữa"))
                resolve("Đang mở trà sữa cho bạn nhaa~ 🍹");
            else resolve("Tôi đang xử lý yêu cầu của bạn UwU ✨");
        }, 800);
    });
}