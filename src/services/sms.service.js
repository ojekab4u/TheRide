import axios from "axios";
import formatPhoneNumber from "../utils/formatPhoneNumber.js";

export const sendSMS = async (
    phoneNumber,
    message
) => {

    try {
        const to = formatPhoneNumber(phoneNumber);

        const response = await axios.post(
            "https://api.termii.com/api/sms/send",
            {
                api_key: process.env.TERMII_API_KEY,
                to,
                from: process.env.TERMII_SENDER_ID || "EcoRide",
                sms: message,
                type: "plain",
                channel: "generic",
            }
        );
        return response.data;
    } catch (error) {
        console.error("SMS ERROR:", error.response?.data || error.message);
        throw new Error("Failed to send SMS.");
    }

};
