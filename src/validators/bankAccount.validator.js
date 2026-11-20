import { body } from "express-validator";

export const bankAccountValidator = [

    body("bankName")
        .trim()
        .notEmpty()
        .withMessage("Bank name is required."),

    body("accountNumber")
        .trim()
        .matches(/^\d{10}$/)
        .withMessage("Account number must be 10 digits."),

    body("accountName")
        .trim()
        .notEmpty()
        .withMessage("Account name is required."),

];

export const withdrawValidator = [

    body("amount")
        .isFloat({ gt: 0 })
        .withMessage("Amount must be greater than zero."),

    body("bankAccountId")
        .optional()
        .isUUID()
        .withMessage("Invalid bank account."),

];
