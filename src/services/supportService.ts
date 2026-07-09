import { fetchClient } from "./fetchClient";

export interface SupportMessageData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
}

export const submitSupportMessage = async (data: SupportMessageData) => {
    const response = await fetchClient.post("/support", data);
    return response.data;
};
