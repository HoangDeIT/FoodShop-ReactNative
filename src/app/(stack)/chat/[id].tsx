import ChatMessage from "@/components/chat/message/chat.message";
import { useCurrentApp } from "@/context/app.context";
import { useUIContext } from "@/context/ui.context";
import { useAssistantVoice } from "@/context/voice.context";
import { IMessagePayload, useChatSocket } from "@/hooks/useChatSocket";
import { speakWithControl } from "@/services/voice/tts/voice.service";
import { getAllMessage, IConversation, IMessage, uploadFile } from "@/utils/chats.api";
import { eventBus } from "@/utils/eventBus";
import { getSocket } from "@/utils/socket";
import dayjs from "dayjs";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    FlatList,
    Keyboard,
    LayoutAnimation,
    Platform,
    StyleSheet,
    TextInput,
    View
} from "react-native";
import { Avatar, Divider, IconButton, Surface, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context"; // ✅ import SafeAreaView

const getSenderId = (item: IMessage | IMessagePayload): string => {
    if (typeof item.senderId === "string") return item.senderId;
    if (typeof item.senderId === "object" && "_id" in item.senderId)
        return item.senderId._id;
    return "";
};

export default function ChatScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const conversationId = id as string;
    const { appState } = useCurrentApp();
    const { setScreen } = useUIContext();
    const { setIsSpeaking } = useAssistantVoice();
    const [messages, setMessages] = useState<(IMessage | IMessagePayload)[]>([]);
    const [partner, setPartner] = useState<IConversation["participants"][0] | null>(null);
    const [input, setInput] = useState("");
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [typingUser, setTypingUser] = useState<string | null>(null);
    const [lastRead, setLastRead] = useState<string | null>(null);
    const [isOnline, setIsOnline] = useState(false);
    useEffect(() => {
        if (!partner?._id) return;

        const socket = getSocket();
        const handleOnline = (payload: any) => {
            if (payload.userId === partner._id) setIsOnline(payload.isOnline);
        };

        socket?.on("user_online", handleOnline);

        // ✅ return một hàm cleanup đúng chuẩn
        return () => {
            socket?.off("user_online", handleOnline);
        };
    }, [partner?._id]);


    // 🧾 Load tin nhắn & thông tin người chat
    useEffect(() => {
        (async () => {
            const res = await getAllMessage(conversationId);
            setMessages(res.data || []);
            console.log(res)
            if (res.data?.length) {
                const firstMsg = res.data[0] as any;
                const partnerUser =
                    firstMsg.conversationId?.participants?.find(
                        (p: any) => p._id !== appState?._id
                    ) || null;
                console.log("firstMsg", firstMsg);
                console.log("partnerUser", partnerUser);
                setScreen({
                    currentPage: "chat_detail",
                    context: {
                        conversationId,
                        partnerId: partner?._id,
                        partnerName: partner?.name,
                    }
                });
                setPartner(partnerUser);
            }

            const socket = getSocket();
            socket?.emit("mark_as_read", {
                conversationId,
                userId: appState?._id,
            });
        })();
    }, [conversationId]);

    // 🔌 Socket handlers
    const handleReceive = useCallback(
        (msg: IMessagePayload) => {
            if (msg.conversationId === conversationId) {
                setMessages((prev) => [...prev, msg]);
            }
        },
        [conversationId]
    );

    const handleUserOnline = (payload: any) => {
        console.log("🔌 User online: ", payload, "and parter", partner);
        if (partner && payload.userId === partner._id) {
            setIsOnline(payload.isOnline);
        }
    };

    const handleTyping = (payload: any) => {
        if (payload.conversationId === conversationId)
            setTypingUser(payload.userName);
    };
    const handleStopTyping = (payload: any) => {
        if (payload.conversationId === conversationId) setTypingUser(null);
    };
    const handleRead = (payload: { conversationId: string; userId: string }) => {
        if (payload.conversationId === conversationId) setLastRead(payload.userId);
    };

    // 🧠 Kết nối socket
    useChatSocket(
        appState?._id!,
        conversationId,
        handleReceive,
        handleUserOnline,
        handleTyping,
        handleStopTyping,
        handleRead
    );

    // 🧭 Keyboard animation
    useEffect(() => {
        const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
            LayoutAnimation.easeInEaseOut();
            setKeyboardHeight(e.endCoordinates.height);
        });
        const hideSub = Keyboard.addListener("keyboardDidHide", () => {
            LayoutAnimation.easeInEaseOut();
            setKeyboardHeight(0);
        });
        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    // ✉️ Gửi tin nhắn
    const sendMessage = async (textArg?: string) => {
        const textToSend = textArg ?? input;
        if (!textToSend.trim()) return;

        const socket = getSocket();
        if (!socket) return;

        const msg: IMessagePayload = {
            conversationId,
            senderId: appState?._id!,
            type: "text",
            data: textToSend,
            createdAt: new Date().toISOString(),
        };

        socket.emit("send_message", msg);
        setInput("");
    };

    // 🖊 Khi đang nhập
    const handleTypingInput = (text: string) => {
        setInput(text);
        const socket = getSocket();
        if (!socket) return;
        socket.emit("user_typing", {
            conversationId,
            userId: appState?._id!,
            userName: appState?.name,
        });
        setTimeout(() => {
            socket.emit("user_stopped_typing", {
                conversationId,
                userId: appState?._id!,
            });
        }, 2000);
    };
    const pickAndSendImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.8,
            });

            if (result.canceled || !result.assets.length) return;

            const uri = result.assets[0].uri;

            // 🧾 Upload lên server
            const uploadRes = await uploadFile(uri, "chat");
            const fileName = uploadRes.fileName;
            console.log(uploadRes)
            if (!fileName) return;

            const socket = getSocket();
            if (!socket) return;

            // 📨 Gửi tin nhắn kiểu ảnh
            const msg: IMessagePayload = {
                conversationId,
                senderId: appState?._id!,
                type: "image",
                data: `${fileName}`,
                createdAt: new Date().toISOString(),
            };

            socket.emit("send_message", msg);
        } catch (err) {
            console.error("❌ Lỗi gửi ảnh:", err);
        }
    };
    //Voice AI agent
    useEffect(() => {

        // ✍️ AI gõ chữ
        const onSetChatInput = (payload: { conversationId: string; text: string }) => {
            if (payload.conversationId !== conversationId) return;

            console.log("👉 SET INPUT:", payload.text);
            setInput(payload.text);
        };

        // 📤 AI gửi tin
        const onSubmitChatMessage = async (payload: { conversationId: string }) => {
            if (payload.conversationId !== conversationId) return;

            console.log("👉 SUBMIT MESSAGE");
            await sendMessage(input); // ⚠️ dùng input hiện tại
        };

        // 🔊 AI đọc tin nhắn
        const onReadChatMessages = async (payload: {
            conversationId: string;
            text: string;
        }) => {
            if (payload.conversationId !== conversationId) return;

            console.log("👉 READ MESSAGE:", payload.text);
            await speakWithControl(payload.text, setIsSpeaking);
        };

        eventBus.on("SET_CHAT_INPUT", onSetChatInput);
        eventBus.on("SUBMIT_CHAT_MESSAGE", onSubmitChatMessage);
        eventBus.on("READ_CHAT_MESSAGES", onReadChatMessages);

        return () => {
            eventBus.off("SET_CHAT_INPUT", onSetChatInput);
            eventBus.off("SUBMIT_CHAT_MESSAGE", onSubmitChatMessage);
            eventBus.off("READ_CHAT_MESSAGES", onReadChatMessages);
        };

    }, [conversationId, input]);
    // 🧱 Render từng tin nhắn
    const renderItem = ({ item }: { item: IMessage | IMessagePayload }) => {
        const senderId = getSenderId(item);
        const isMe = senderId === appState?._id;
        const isLastMyMsg =
            isMe &&
            item ===
            [...messages].reverse().find((m) => getSenderId(m) === appState?._id);
        return (
            <View
                style={[
                    styles.messageRow,
                    isMe ? styles.rightAlign : styles.leftAlign,
                ]}
            >
                <Surface
                    style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}
                >
                    <ChatMessage item={item} isMe={isMe} />
                    <Text style={styles.time}>
                        {dayjs(item.createdAt).format("HH:mm")}
                    </Text>
                    {isLastMyMsg && lastRead && (
                        <Text style={styles.seen}>Đã xem ✅</Text>
                    )}
                </Surface>
            </View>
        );
    };
    const avatarUrl =
        partner?.avatar
            ? `${process.env.EXPO_PUBLIC_API_URL}/public/images/users/${partner.avatar}`
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(partner?.name ?? "User")}&background=random`;


    return (
        <SafeAreaView style={styles.safeArea}>
            {/* 🔹 HEADER */}
            <View style={styles.header}>
                <IconButton icon="arrow-left" onPress={() => router.back()} />
                <Avatar.Image
                    size={40}
                    source={{ uri: avatarUrl }}
                    style={{ backgroundColor: "#eee" }}
                />
                <View style={{ marginLeft: 10 }}>
                    <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                        {partner?.name || "Người dùng"}
                    </Text>
                    <Text style={{ color: isOnline ? "#4CAF50" : "#888", fontSize: 12 }}>
                        {isOnline || partner?.name === "Chatbot AI" ? "🟢 Online" : "⚫ Offline"}
                    </Text>
                </View>
            </View>

            {/* 💬 Tin nhắn */}
            <FlatList
                data={[...messages].reverse()}
                renderItem={renderItem}
                inverted
                keyExtractor={(i, index) => i.createdAt! + index}
                contentContainerStyle={{
                    padding: 12,
                    flexGrow: 1,
                    justifyContent: "flex-end",
                }}
            />

            {/* ✍️ Hiển thị đang nhập */}
            {typingUser && (
                <Text style={{ textAlign: "center", color: "#999", marginBottom: 4 }}>
                    💬 {typingUser} đang nhập...
                </Text>
            )}

            <Divider />
            {/* 🧭 Ô nhập tin nhắn */}
            <View
                style={[
                    styles.composerRow,
                    { marginBottom: Platform.OS === "android" ? keyboardHeight : 0 },
                ]}
            >
                <IconButton icon="image" onPress={pickAndSendImage} />
                <TextInput
                    style={styles.input}
                    placeholder="Nhập tin nhắn..."
                    value={input}
                    onChangeText={handleTypingInput}
                    onSubmitEditing={() => sendMessage()}
                />
                <IconButton icon="send" onPress={() => sendMessage()} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#fff" },
    container: { flex: 1, backgroundColor: "#fff" },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderBottomWidth: 0.5,
        borderColor: "#ddd",
        backgroundColor: "#fff",
    },
    messageRow: { flexDirection: "row", marginVertical: 6 },
    leftAlign: { justifyContent: "flex-start" },
    rightAlign: { justifyContent: "flex-end" },
    bubble: { maxWidth: "75%", padding: 8, borderRadius: 12, elevation: 1 },
    bubbleMe: { backgroundColor: "#0b93f6", borderTopRightRadius: 0 },
    bubbleOther: { backgroundColor: "#eee", borderTopLeftRadius: 0 },
    textMe: { color: "white", fontSize: 15 },
    textOther: { color: "black", fontSize: 15 },
    time: { fontSize: 10, color: "#ccc", alignSelf: "flex-end", marginTop: 4 },
    seen: { fontSize: 11, color: "#52c41a", marginTop: 2 },
    composerRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        padding: 8,
        borderTopWidth: 0.3,
        borderColor: "#ddd",
        backgroundColor: "white",
    },
    input: {
        flex: 1,
        marginRight: 4,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingHorizontal: 10,
    },
});
