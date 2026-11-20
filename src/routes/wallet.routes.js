import express from "express";

import protect from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/role.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { withdrawValidator } from "../validators/bankAccount.validator.js";

import { ROLES } from "../constants/roles.js";

import {
    getWallet,
    getWalletTransactions,
    withdraw,
} from "../controllers/wallet.controller.js";

const router = express.Router();

router.get(
    "/",
    protect,
    authorize(
        ROLES.PASSENGER,
        ROLES.DRIVER,
        ROLES.CORPORATE_ADMIN
    ),
    getWallet

);

router.get(
    "/transactions",
    protect,
    authorize(
        ROLES.PASSENGER,
        ROLES.DRIVER,
        ROLES.CORPORATE_ADMIN
    ),
    getWalletTransactions
);

router.post(
    "/withdraw",
    protect,
    authorize(
        ROLES.PASSENGER,
        ROLES.DRIVER,
        ROLES.CORPORATE_ADMIN
    ),
    withdrawValidator,
    validate,
    withdraw
);

export default router;