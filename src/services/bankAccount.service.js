import BankAccount from "../models/bankAccount.model.js";
import AppError from "../utils/AppError.js";

export const getBankAccountsService = async (userId) => {

    return await BankAccount.findAll({
        where: { userId },
        order: [["createdAt", "DESC"]],
    });

};

export const addBankAccountService = async (
    userId,
    data
) => {

    // First account becomes the default
    const count = await BankAccount.count({
        where: { userId },
    });

    return await BankAccount.create({
        userId,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        accountName: data.accountName,
        isDefault: count === 0,
    });

};

export const deleteBankAccountService = async (
    userId,
    id
) => {

    const account = await BankAccount.findOne({
        where: { id, userId },
    });

    if (!account) {
        throw new AppError(
            "Bank account not found.",
            404
        );
    }

    await account.destroy();

    return account;

};
