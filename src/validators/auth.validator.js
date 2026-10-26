import { body } from "express-validator";
import { ROLES } from "../constants/roles.js";

export const registerValidator = [

  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters."),

  body("lastName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters."),

  body("fullName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Full name must be between 2 and 100 characters."),

  body("email")
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage("Please provide a valid email."),

  body("phoneNumber")
    .trim()
    .custom((value, { req }) => {
      const isCorporate =
        Boolean(req.body.companyName) &&
        Boolean(req.body.rcNumber);

      if (!value) {
        if (isCorporate) {
          return true; // corporate: phone optional for now
        }

        throw new Error(
          "Phone number is required for drivers and passengers."
        );
      }

      if (!/^(\+234|0)[789][01]\d{8}$/.test(value)) {
        throw new Error("Invalid Nigerian phone number.");
      }

      return true;
    }),

  body("role")
    .optional()
    .trim()
    .customSanitizer((value) => value.toUpperCase())
    .isIn(["DRIVER", "PASSENGER"])
    .withMessage("Role must be DRIVER or PASSENGER."),

  body("role")
    .custom((value, { req }) => {
      const isCorporate =
        req.body.companyName && req.body.rcNumber;

      if (!value && !isCorporate) {
        throw new Error(
          "Please select a role (DRIVER or PASSENGER) or provide company details."
        );
      }

      if (value && isCorporate) {
        throw new Error(
          "Provide either a role or company details, not both."
        );
      }

      return true;
    }),

  body("companyName")
    .optional()
    .trim(),

  body("rcNumber")
    .optional()
    .trim(),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters.")
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter.")
    .matches(/[a-z]/)
    .withMessage("Password must contain a lowercase letter.")
    .matches(/[0-9]/)
    .withMessage("Password must contain a number.")
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage("Password must contain a special character."),

  body("confirmPassword")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match.");
      }
      return true;
    }),

];


export const loginValidator = [

  body("identifier")
    .optional()
    .trim(),

  body("driverId")
    .optional()
    .trim(),

  body("email")
    .optional()
    .trim(),

  body("phoneNumber")
    .optional()
    .trim(),

  body("password")
    .notEmpty()
    .withMessage("Password is required."),
];


export const changePasswordValidator = [

    body("currentPassword")
        .notEmpty()
        .withMessage("Current password is required."),

    body("newPassword")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters.")
        .matches(/[A-Z]/)
        .withMessage("Password must contain an uppercase letter.")
        .matches(/[a-z]/)
        .withMessage("Password must contain a lowercase letter.")
        .matches(/[0-9]/)
        .withMessage("Password must contain a number."),

    body("confirmPassword")
        .custom((value, { req }) => {

            if (value !== req.body.newPassword) {
                throw new Error("Passwords do not match.");
            }

            return true;

        }),

    body("newPassword")
        .custom((value, { req }) => {

            if (value === req.body.currentPassword) {
                throw new Error(
                    "New password must be different from current password."
                );
            }

            return true;

        }),

];

export const forgotPasswordValidator = [

    body("email")
        .optional()
        .trim()
        .isEmail()
        .withMessage("Please provide a valid email address."),

    body("phoneNumber")
        .optional()
        .trim(),

    body("email")
        .custom((value, { req }) => {
            if (!value && !req.body.phoneNumber) {
                throw new Error(
                    "Email or phone number is required."
                );
            }
            return true;
        }),

];

export const resetPasswordValidator = [

    body("newPassword")
        .notEmpty()
        .withMessage("New password is required.")

        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long."),

    body("confirmPassword")
        .notEmpty()
        .withMessage("Confirm password is required.")

        .custom((value, { req }) => {

            if (value !== req.body.newPassword) {
                throw new Error("Passwords do not match.");
            }

            return true;

        }),

];