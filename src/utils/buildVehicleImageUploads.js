import uploadToCloudinary from "./uploadToCloudinary.js";

const IMAGE_FIELDS = [
    "frontImage",
    "rearImage",
    "leftImage",
    "rightImage",
    "interiorImage",
];

// Uploads vehicle image files (form-data) to Cloudinary and
// returns { frontImage: url, ... } for the provided fields.
// Body URLs remain the alternative for API testing.
const buildVehicleImageUploads = async (files = {}) => {
    const data = {};

    for (const field of IMAGE_FIELDS) {
        if (files[field]?.[0]) {
            data[field] = await uploadToCloudinary(
                files[field][0].path,
                "EcoRide/Vehicles"
            );
        }
    }

    return data;
};

export default buildVehicleImageUploads;