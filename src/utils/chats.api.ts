import axios from "@/utils/axios.customize";
export interface IUserMini {
    _id: string;
    name: string;
    avatar?: string;
}

export interface ILastMessage {
    type: "text" | "image";
    data: string; // nội dung hoặc URL ảnh
    senderId: string;
    createdAt: string;
}
export interface IMessage {
    _id: string;
    conversationId: string;
    senderId: IUserMini; // đã populate name + avatar
    type: "text" | "image";
    data: string;
    isRead: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
}
export interface IConversation {
    _id: string;
    participants: IUserMini[];
    lastMessage?: ILastMessage;
    createdAt: string;
    updatedAt: string;
}
export const getAllChat = async () => {
    let url = "/api/v1/chats/conversations";
    return await axios.get<IBackendRes<IConversation[]>>(url);
}
export const getAllMessage = async (conversationId: string) => {
    let url = `/api/v1/chats/messages/${conversationId}`;
    return await axios.get<IBackendRes<IMessage[]>>(url);
}
export const createConversation = async (user: string) => {
    let url = `/api/v1/chats/create`;
    return await axios.post<IBackendRes<IConversation>>(url, { user });
}
export const uploadFile = async (uri: string, folder: string) => {
    try {
        const formData = new FormData();

        // 👇 Trích xuất tên file và loại MIME
        const fileName = uri.split("/").pop() || "image.jpg";
        const type = `image/${fileName.split(".").pop()}`;

        formData.append("fileUpload", {
            uri,
            name: fileName,
            type,
        } as any);
        console.log('👇 formData', formData);
        const res = await axios.post(
            `/api/v1/files/upload`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                    folder_type: folder,
                },
            }
        );

        return res.data; // { data: { fileName: "xxx.jpg" } }
    } catch (err) {
        console.error("❌ Upload error:", err);
        throw err;
    }
};