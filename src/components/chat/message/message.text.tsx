import { Text } from "react-native-paper";

export default function MessageText({ text, isMe }: { text: string; isMe?: boolean }) {
    return (
        <Text style={{ color: isMe ? "white" : "black", fontSize: 15 }}>
            {text}
        </Text>
    );
}
