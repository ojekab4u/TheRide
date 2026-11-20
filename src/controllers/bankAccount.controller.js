import {
    getBankAccountsService,
    addBankAccountService,
    deleteBankAccountService,
} from "../services/bankAccount.service.js";
import { successResponse } from "../utils/response.js";

export const getBankAccounts = async (
    req,
    res,
    next
) => {

    try {

        const accounts =
            await getBankAccountsService(
                req.user.id
            );

        return successResponse(
            res,
            200,
            "Bank accounts retrieved successfully.",
            accounts
        );

    } catch (error) {

        next(error);

    }

};

export const addBankAccount = async (
    req,
    res,
    next
) => {

    try {

        const account =
            await addBankAccountService(
                req.user.id,
                req.body
            );

        return successResponse(
            res,
            201,
            "Bank account added successfully.",
            account
        );

    } catch (error) {

        next(error);

    }

};

export const deleteBankAccount = async (
    req,
    res,
    next
) => {

    try {

        await deleteBankAccountService(
            req.user.id,
            req.params.id
        );

        return successResponse(
            res,
            200,
            "Bank account removed successfully."
        );

    } catch (error) {

        next(error);

    }

};
