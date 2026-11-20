import DriverProfile from "../models/driver.model.js";
import Vehicle from "../models/vehicle.model.js";
import VehicleInspection from "../models/vehicleInspection.model.js";
import AppError from "../utils/AppError.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";

// Upload multer temp files to Cloudinary so inspection
// photos are stored as URLs, consistent with driver documents
const uploadInspectionPhotos = async (files) => {
    const data = {};

    const photoFields = [
        "frontPhoto",
        "rearPhoto",
        "dashboardPhoto",
        "odometerPhoto",
        "tyrePhoto",
        "safetyEquipmentPhoto",
    ];

    for (const field of photoFields) {
        if (files?.[field]?.[0]) {
            data[field] = await uploadToCloudinary(
                files[field][0].path,
                "EcoRide/VehicleInspections"
            );
        }
    }

    return data;
};

export const createVehicleInspectionService = async (
    userId,
    vehicleId,
    files
) => {

    // Check driver profile
    const driver = await DriverProfile.findOne({
        where: { userId },
    });

    if (!driver) {
        throw new AppError(
            "Driver profile not found.",
            404
        );
    }

    // Check vehicle
    const vehicle = await Vehicle.findOne({
        where: {
            id: vehicleId,
            driverId: driver.id,
        },
    });

    if (!vehicle) {
        throw new AppError(
            "Vehicle not found.",
            404
        );
    }

    // Prevent duplicate inspection
    const existingInspection =
        await VehicleInspection.findOne({
            where: {
                vehicleId: vehicle.id,
            },
        });

    if (existingInspection) {
        throw new AppError(
            "Vehicle inspection already exists.",
            400
        );
    }

    // Ensure all required photos exist
    const requiredPhotos = [
        "frontPhoto",
        "rearPhoto",
        "dashboardPhoto",
        "odometerPhoto",
        "tyrePhoto",
        "safetyEquipmentPhoto",
    ];

    for (const photo of requiredPhotos) {
        if (!files?.[photo]?.[0]?.path) {
            throw new AppError(
                `${photo} is required.`,
                400
            );
        }
    }

    // Upload photos to Cloudinary
    const inspectionData =
        await uploadInspectionPhotos(files);

    // Create inspection
    const inspection =
        await VehicleInspection.create({
            ...inspectionData,
            vehicleId: vehicle.id,
        });

    return inspection;
};

export const getVehicleInspectionService = async (
    userId,
    vehicleId
) => {

    const driver = await DriverProfile.findOne({
        where: { userId },
    });

    if (!driver) {
        throw new AppError(
            "Driver profile not found.",
            404
        );
    }

    const vehicle = await Vehicle.findOne({
        where: {
            id: vehicleId,
            driverId: driver.id,
        },
    });

    if (!vehicle) {
        throw new AppError(
            "Vehicle not found.",
            404
        );
    }

    const inspection =
        await VehicleInspection.findOne({
            where: {
                vehicleId: vehicle.id,
            },
        });

    if (!inspection) {
        throw new AppError(
            "Vehicle inspection not found.",
            404
        );
    }

    return inspection;
};

export const updateVehicleInspectionService = async (
    userId,
    vehicleId,
    files
) => {

    // Get inspection belonging to this vehicle
    const inspection =
        await getVehicleInspectionService(
            userId,
            vehicleId
        );

    const inspectionData =
        await uploadInspectionPhotos(files);

    inspectionData.inspectionStatus = "PENDING";
    inspectionData.reviewNote = null;
    inspectionData.reviewedAt = null;

    await inspection.update(inspectionData);

    return inspection;
};