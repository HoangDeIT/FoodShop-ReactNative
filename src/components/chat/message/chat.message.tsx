import MessageImage from "./message.image";
import MessageProductList from "./message.product.list";
import MessageStoreList from "./message.store.list";
import MessageText from "./message.text";

export default function ChatMessage({ item, isMe }: any) {
    const type = item.type;
    const content =
        typeof item.data === "string" ? tryParseJSON(item.data) : item.data;

    switch (type) {
        case "image":
            return <MessageImage uri={item.data} />;

        case "ai_text":
            return <MessageText text={content?.message || item.data} isMe={isMe} />;

        case "store":
            return <MessageStoreList data={content} />;

        case "product":
            return <MessageProductList data={content} />;

        default:
            return <MessageText text={item.data} isMe={isMe} />;
    }
}

function tryParseJSON(str: string) {
    try {
        return JSON.parse(str);
    } catch {
        return null;
    }
}
