import express from "express";

import protect from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/role.middleware.js";
import validate from "../middlewares/validate.middleware.js";

import { ROLES } from "../constants/roles.js";

import {
    getBankAccounts,
    addBankAccount,
    deleteBankAccount,
} from "../controllers/bankAccount.controller.js";

import { bankAccountValidator } from "../validators/bankAccount.validator.js";

const router = express.Router();

router.get(
    "/",
    protect,
    authorize(
        ROLES.PASSENGER,
        ROLES.DRIVER,
        ROLES.CORPORATE_ADMIN
    ),
    getBankAccounts
);

router.post(
    "/",
    protect,
    authorize(
        ROLES.PASSENGER,
        ROLES.DRIVER,
        ROLES.CORPORATE_ADMIN
    ),
    bankAccountValidator,
    validate,
    addBankAccount
);

router.delete(
    "/:id",
    protect,
    authorize(
        ROLES.PASSENGER,
        ROLES.DRIVER,
        ROLES.CORPORATE_ADMIN
    ),
    deleteBankAccount
);

export default router;
