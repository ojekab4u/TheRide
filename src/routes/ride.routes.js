import express from "express";

import protect from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/role.middleware.js";
import validate from "../middlewares/validate.middleware.js";

import { ROLES } from "../constants/roles.js";

import {
    createRide,
    getAllRides,
    getRideById,
    updateRide,
    deleteRide,
    completeRide,
    cancelRide,
    startRide,
    getDriverRideHistory,
    searchRides,
    driverArrived,
    getRideLocation,
    updateRideLocation,
} from "../controllers/ride.controller.js";

import {
    createRideValidator,
    updateRideValidator,
    updateRideLocationValidator,
} from "../validators/ride.validator.js";

import {
    getRideHistory,
} from "../controllers/rideHistory.controller.js";


const router = express.Router();

// All /:id routes expect a UUID — reject anything else cleanly
router.param("id", (req, res, next, id) => {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        return res.status(400).json({ success: false, message: "Invalid ride ID." });
    }
    next();
});

router.post(
    "/",
    protect,
    authorize(ROLES.DRIVER),
    createRideValidator,
    validate,
    createRide
);

router.get("/", getAllRides);

router.get(
    "/search",
    protect,
    authorize(ROLES.PASSENGER),
    searchRides
);
router.get(
    "/history",
    protect,
    authorize(
        ROLES.PASSENGER,
        ROLES.DRIVER
    ),
    getRideHistory
);

router.get(
    "/history/me",
    protect,
    authorize(ROLES.DRIVER),
    getDriverRideHistory
);

router.get(
    "/:id",
    protect,    
    getRideById
);


router.patch(
    "/:id",
    protect,
    authorize(ROLES.DRIVER),
    updateRideValidator,
    validate,
    updateRide
);

router.delete(
    "/:id",
    protect,
    authorize(ROLES.DRIVER),
    deleteRide
);



router.patch(
    "/:id/cancel",
    protect,
    authorize(ROLES.DRIVER),
    cancelRide
);
router.patch(
    "/:id/arrive",
    protect,
    authorize(ROLES.DRIVER),
    driverArrived
);

router.patch(
    "/:id/start",
    protect,
    authorize(ROLES.DRIVER),
    startRide
);

router.patch(
    "/:id/complete",
    protect,
    authorize(ROLES.DRIVER),
    completeRide
);
router.patch(
    "/:id/location",
    protect,
    authorize(ROLES.DRIVER),
    updateRideLocationValidator,
    validate,
    updateRideLocation
);

router.get(
    "/:id/location",
    protect,
    authorize(ROLES.PASSENGER),
    getRideLocation
);

export default router;