import { Image } from "react-native";

export default function MessageImage({ uri }: { uri: string }) {
    return (
        <Image
            source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}/public/images/chat/${uri}` }}
            style={{ width: 180, height: 180, borderRadius: 8 }}
        />
    );
}
