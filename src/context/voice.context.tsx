import { createContext, ReactNode, useContext, useState } from "react";

type AIContextType = {
    // 🎤 trạng thái
    isAssistantOn: boolean;
    setIsAssistantOn: (v: boolean) => void;

    isAlwaysListening: boolean;
    setIsAlwaysListening: (v: boolean) => void;

    // 💬 text hiển thị
    userText: string;
    setUserText: (v: string) => void;

    botText: string;
    setBotText: (v: string) => void;
    isSpeaking: boolean;
    setIsSpeaking: (v: boolean) => void;
};

const AIContext = createContext<AIContextType | null>(null);

export const AIProvider = ({ children }: { children: ReactNode }) => {
    const [isAssistantOn, setIsAssistantOn] = useState(false);
    const [isAlwaysListening, setIsAlwaysListening] = useState(true);

    const [userText, setUserText] = useState("");
    const [botText, setBotText] = useState("");
    const [isSpeaking, setIsSpeaking] = useState(false);
    return (
        <AIContext.Provider
            value={{
                isAssistantOn,
                setIsAssistantOn,
                isAlwaysListening,
                setIsAlwaysListening,
                isSpeaking,
                setIsSpeaking,
                userText,
                setUserText,
                botText,
                setBotText,
            }}
        >
            {children}
        </AIContext.Provider>
    );
};

export const useAssistantVoice = () => {
    const ctx = useContext(AIContext);
    if (!ctx) throw new Error("useAI must be used inside AIProvider");
    return ctx;
};