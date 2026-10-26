import express from "express";

import protect from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/role.middleware.js";
import validate from "../middlewares/validate.middleware.js";

import { ROLES } from "../constants/roles.js";
import upload from "../middlewares/upload.middleware.js";

import {
    createVehicle,
    getVehicles,
    getVehicleById,
    updateVehicle,
    deleteVehicle,
} from "../controllers/vehicle.controller.js";

import {
    createVehicleValidator,
    updateVehicleValidator,
} from "../validators/vehicle.validator.js";

const router = express.Router();

router.post(
    "/",
    protect,
    authorize(ROLES.DRIVER),

    upload.fields([
        { name: "frontImage", maxCount: 1 },
        { name: "rearImage", maxCount: 1 },
        { name: "leftImage", maxCount: 1 },
        { name: "rightImage", maxCount: 1 },
        { name: "interiorImage", maxCount: 1 },
    ]),

    createVehicleValidator,
    validate,
    createVehicle
);

router.get(
    "/",
    protect,
    authorize(ROLES.DRIVER),
    getVehicles
);

router.get(
    "/:id",
    protect,
    authorize(ROLES.DRIVER),
    getVehicleById
);

router.patch(
    "/:id",
    protect,
    authorize(ROLES.DRIVER),

    upload.fields([
        { name: "frontImage", maxCount: 1 },
        { name: "rearImage", maxCount: 1 },
        { name: "leftImage", maxCount: 1 },
        { name: "rightImage", maxCount: 1 },
        { name: "interiorImage", maxCount: 1 },
    ]),

    updateVehicleValidator,
    validate,
    updateVehicle
);

router.delete(
    "/:id",
    protect,
    authorize(ROLES.DRIVER),
    deleteVehicle
);

export default router;