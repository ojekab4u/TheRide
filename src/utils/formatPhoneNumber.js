const formatPhoneNumber = (phoneNumber) => {

    if (!phoneNumber) return phoneNumber;

    let number = phoneNumber.trim();

    // Remove any non-digit characters (spaces, dashes, etc.)
    number = number.replace(/\D/g, "");

    // Already in international format
    if (number.startsWith("234")) {
        return number;
    }

    // Local Nigerian format starting with 0
    if (number.startsWith("0")) {
        return "234" + number.slice(1);
    }

    return number;
};

export default formatPhoneNumber;
