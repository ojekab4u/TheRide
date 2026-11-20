import crypto from "crypto";

// Short numeric display ID for rides, e.g. 123456789
const generateRideCode = () =>
    String(100000000 + crypto.randomInt(900000000));

export default generateRideCode;
