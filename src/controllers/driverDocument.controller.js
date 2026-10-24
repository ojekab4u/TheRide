import {
    uploadDriverDocumentsService,
    getDriverDocumentsService,
    updateDriverDocumentsService,
} from "../services/driverDocument.service.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
import buildDriverDocumentUploads from "../utils/buildDriverDocumentUploads.js";
import { extractNameFromLicense } from "../services/ocr.service.js";
import User from "../models/user.model.js";

import { successResponse } from "../utils/response.js";


export const uploadDriverDocuments = async (
    req,
    res,
    next
) => {
    try {

        const documentData =
            await buildDriverDocumentUploads(req.files);

        // Resolve the driver's name: OCR first, then manual fallback
        let resolvedName = null;

        if (documentData.driverLicenseUrl) {
            resolvedName = await extractNameFromLicense(
                documentData.driverLicenseUrl
            );
        }

        if (!resolvedName && req.body.fullName) {
            const fullName = req.body.fullName.trim();
            const parts = fullName.split(/\s+/);

            resolvedName = {
                firstName: parts[0],
                lastName: parts.slice(1).join(" ") || null,
                fullName,
            };
        }

        if (resolvedName) {
            const user = await User.findByPk(req.user.id);

            if (user) {
                user.firstName = resolvedName.firstName;
                user.lastName = resolvedName.lastName;
                await user.save();
            }
        }

        const documents =
            await uploadDriverDocumentsService(
                req.user.id,
                documentData
            );

        return successResponse(
            res,
            201,
            "Driver documents uploaded successfully.",
            {
                ...documents.toJSON(),
                extractedName: resolvedName?.fullName || null,
            }
        );

    } catch (error) {

        next(error);

    }
};

export const getDriverDocuments = async (
    req,
    res,
    next
) => {
    try {

        const documents =
            await getDriverDocumentsService(
                req.user.id
            );

        return successResponse(
            res,
            200,
            "Driver documents retrieved successfully.",
            documents
        );

    } catch (error) {

        next(error);

    }
};

export const updateDriverDocuments = async (
    req,
    res,
    next
) => {
    try {

        const documentData =
            await buildDriverDocumentUploads(req.files);

        const documents =
            await updateDriverDocumentsService(
                req.user.id,
                documentData
            );

        return successResponse(
            res,
            200,
            "Driver documents updated successfully.",
            documents
        );

    } catch (error) {

        next(error);

    }
};