import { useCurrentApp } from "@/context/app.context";
import { getAllChat, IConversation } from "@/utils/chats.api";
import dayjs from "dayjs";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { Avatar, Divider, Text } from "react-native-paper";

export default function ChatListScreen() {
    const [conversations, setConversations] = useState<IConversation[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { appState } = useCurrentApp();

    // ⚠️ Giả sử user hiện tại có id này (sau này bạn lấy từ token hoặc context)

    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        try {
            setLoading(true);
            const res = await getAllChat();
            if (res.data && Array.isArray(res.data)) {
                setConversations(res.data);
            }
        } catch (err) {
            console.error("❌ Lỗi load chat:", err);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: IConversation }) => {
        // 🔎 Lấy ra người còn lại (đối phương)
        const partner = item.participants.find((p) => p._id !== appState?._id);

        const lastMessage =
            item.lastMessage?.type === "image"
                ? "📷 Đã gửi một ảnh"
                : item.lastMessage?.data || "Chưa có tin nhắn";

        const time = item.updatedAt
            ? dayjs(item.updatedAt).format("HH:mm")
            : "";

        return (
            <TouchableOpacity
                activeOpacity={0.7}
                style={styles.chatItem}
                onPress={() => router.push(`/(stack)/chat/${item._id}`)}
            >
                {partner?.avatar ? (
                    <Avatar.Image size={50} source={{ uri: partner.avatar }} />
                ) : (
                    <Avatar.Text
                        size={50}
                        label={partner?.name?.[0] || "?"}
                        style={{ backgroundColor: "#ff6d00" }}
                    />
                )}

                <View style={styles.chatInfo}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={styles.chatName}>{partner?.name || "Người dùng"}</Text>
                        <Text style={styles.chatTime}>{time}</Text>
                    </View>
                    <Text style={styles.lastMessage} numberOfLines={1}>
                        {lastMessage}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator size="large" color="#ff6d00" />
                </View>
            ) : (
                <FlatList
                    data={conversations}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    ItemSeparatorComponent={() => <Divider style={{ marginLeft: 70 }} />}
                    contentContainerStyle={{ paddingBottom: 80 }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    chatItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    chatInfo: {
        flex: 1,
        marginLeft: 12,
    },
    chatName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#000",
    },
    chatTime: {
        fontSize: 13,
        color: "#999",
    },
    lastMessage: {
        fontSize: 14,
        color: "#666",
        marginTop: 2,
    },
});
