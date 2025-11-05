import { initSocket } from "@/utils/socket";
import { useEffect } from "react";

export interface IMessagePayload {
    conversationId: string;
    senderId: string;
    type: "text" | "image";
    data: string;
    createdAt?: string;
}

export function useChatSocket(
    userId: string,
    conversationId: string,
    onReceive: (msg: IMessagePayload) => void,
    onUserOnline?: (payload: any) => void,
    onTyping?: (payload: any) => void,
    onStopTyping?: (payload: any) => void,
    onRead?: (payload: { conversationId: string; userId: string }) => void
) {
    useEffect(() => {
        const socket = initSocket(userId);

        // Tham gia phòng hội thoại
        if (conversationId) socket.emit("join_conversation", { conversationId });

        socket.on("receive_message", onReceive);
        socket.on("user_online", onUserOnline || (() => { }));
        socket.on("user_typing", onTyping || (() => { }));
        socket.on("user_stopped_typing", onStopTyping || (() => { }));
        socket.on("messages_read", onRead || (() => { }));

        return () => {
            socket.off("receive_message", onReceive);
            socket.off("user_online", onUserOnline || (() => { }));
            socket.off("user_typing", onTyping || (() => { }));
            socket.off("user_stopped_typing", onStopTyping || (() => { }));
            socket.off("messages_read", onRead || (() => { }));
        };
    }, [userId, conversationId, onReceive]);
}
