import axios from "axios";

// Extracts a person's name from raw OCR text.
// Heuristic: pick the first line that looks like a human name
// (2-4 words, letters only, no digits).
const extractNameFromText = (text) => {
    if (!text) return null;

    const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    const candidates = lines.filter((line) => {
        const words = line.split(/\s+/);
        return (
            /^[A-Za-z][A-Za-z\s.'-]{2,60}$/.test(line) &&
            words.length >= 2 &&
            words.length <= 4
        );
    });

    if (candidates.length === 0) return null;

    const fullName = candidates[0]
        .replace(/\s+/g, " ")
        .trim();

    const parts = fullName.split(" ");

    return {
        firstName: parts[0],
        lastName: parts.slice(1).join(" ") || null,
        fullName,
    };
};

// Attempts to extract a name from a driver's license image URL.
// Returns { firstName, lastName, fullName } or null.
// Requires GOOGLE_VISION_API_KEY. Returns null when not configured.
export const extractNameFromLicense = async (imageUrl) => {
    const apiKey = process.env.GOOGLE_VISION_API_KEY;

    if (!apiKey || !imageUrl) {
        return null;
    }

    try {
        const response = await axios.post(
            `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
            {
                requests: [
                    {
                        image: {
                            source: { imageUri: imageUrl },
                        },
                        features: [
                            { type: "TEXT_DETECTION" },
                        ],
                    },
                ],
            }
        );

        const text =
            response.data?.responses?.[0]
                ?.fullTextAnnotation?.text || "";

        return extractNameFromText(text);
    } catch (error) {
        console.error(
            "OCR ERROR:",
            error.response?.data || error.message
        );

        return null;
    }
};

export default extractNameFromLicense;
