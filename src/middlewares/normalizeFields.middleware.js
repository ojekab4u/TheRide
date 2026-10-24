// Normalizes common body field names so clients can send
// different casings (e.g. "firstname", "first_name", "FirstName")
// and still map to the expected camelCase fields.

const FIELD_MAP = {
    firstname: "firstName",
    first_name: "firstName",
    lastname: "lastName",
    last_name: "lastName",
    fullname: "fullName",
    full_name: "fullName",
    phonenumber: "phoneNumber",
    phone_number: "phoneNumber",
    confirmpassword: "confirmPassword",
    confirm_password: "confirmPassword",
    companyname: "companyName",
    company_name: "companyName",
    rcnumber: "rcNumber",
    rc_number: "rcNumber",
    driverid: "driverId",
    driver_id: "driverId",
};

const normalizeFields = (req, res, next) => {
    if (req.body && typeof req.body === "object") {
        for (const [key, value] of Object.entries(req.body)) {
            const normalized = FIELD_MAP[key.toLowerCase()];

            if (normalized && req.body[normalized] === undefined) {
                req.body[normalized] = value;
            }
        }
    }

    next();
};

export default normalizeFields;
