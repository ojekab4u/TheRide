import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";

import {
register,
login,
logout,
changeUserPassword,
forgotPassword,
resetPassword,
getOnboardingStatus,
} from "../controllers/auth.controller.js";

import {
  registerValidator,
  loginValidator,
  changePasswordValidator,
  forgotPasswordValidator,
  resetPasswordValidator
} from "../validators/auth.validator.js";

import { selectRoleService } from "../services/selectRole.service.js";
import { selectRoleValidator } from "../validators/selectRole.validator.js";
import { selectRole } from "../controllers/selectRole.controller.js";
import validate from "../middlewares/validate.middleware.js";
import protect from "../middlewares/auth.middleware.js";
import normalizeFields from "../middlewares/normalizeFields.middleware.js";



const router = express.Router();

router.post(
    "/register",
    normalizeFields,
    registerValidator,
    validate,
    register
);

router.post(
    "/login",
    normalizeFields,
    loginValidator,
    validate,
    login
);
router.post(
    "/logout",
    authenticate,
    logout
);

router.get(
    "/onboarding-status",
    protect,
    getOnboardingStatus
);

router.patch(
    "/select-role",
    protect,
    selectRoleValidator,
    validate,
    selectRole
);

router.patch(

    "/change-password",

    protect,
    changePasswordValidator,
    validate,
    changeUserPassword,
);

router.post(
    "/forgot-password",
    normalizeFields,
    forgotPasswordValidator,
    validate,
    forgotPassword
);

router.post(
    "/reset-password/:token",
    normalizeFields,
    resetPasswordValidator,
    validate,
    resetPassword
);

export default router;