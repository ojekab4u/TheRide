import { body } from "express-validator";

export const corporateProfileValidator = [

    body("companyName")
        .trim()
        .notEmpty()
        .withMessage(
            "Company name is required."
        ),

    body("rcNumber")
        .trim()
        .notEmpty()
        .withMessage(
            "RC number is required."
        ),

    body("companyPhone")
        .trim()
        .notEmpty()
        .withMessage(
            "Company phone is required."
        ),

    body("companyAddress")
        .trim()
        .notEmpty()
        .withMessage(
            "Company address is required."
        ),

    body("industry")
        .optional()
        .trim(),

];

export const updateCorporateProfileValidator = [

    body("companyName")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Company name cannot be empty."),

    body("rcNumber")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("RC number cannot be empty."),

    body("companyPhone")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Company phone cannot be empty."),

    body("companyAddress")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Company address cannot be empty."),

    body("industry")
        .optional()
        .trim(),

    body("companyLogo")
        .optional()
        .trim(),

];