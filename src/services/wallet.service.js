import Wallet from "../models/wallet.model.js";
import Payment from "../models/payment.model.js";
import BankAccount from "../models/bankAccount.model.js";
import WalletTransaction from "../models/WalletTransaction.model.js";
import AppError from "../utils/AppError.js";
import { createWalletTransaction } from "../utils/createWalletTransaction.js";
import { createNotification } from "./notification.service.js";

export const getWalletService = async (
    userId
) => {

    let wallet = await Wallet.findOne({
        where: {
            userId,
        },
    });

    if (!wallet) {

        wallet = await Wallet.create({
            userId,
            balance: 0,
        });

    }

    return wallet;

};


export const getWalletTransactionsService = async (
    userId
) => {

    // Transaction History screen lists wallet movements
    // (trip earnings, withdrawals, top-ups, refunds)
    const transactions =
        await WalletTransaction.findAll({

            where: {
                userId,
            },

            order: [
                ["createdAt", "DESC"],
            ],

        });

    return transactions;

};


export const creditWallet = async (
   userId,
    amount,
    options = {}
) => {

   const { transaction } = options;

    const wallet = await Wallet.findOne({
        where: { userId },
        transaction,
    });

    if (!wallet) {
        wallet = await Wallet.create({
            userId,
            balance: 0,
        });
    }

    wallet.balance =
        Number(wallet.balance) +
        Number(amount);

    await wallet.save({ transaction });

   
    return wallet;
};

export const debitWallet = async (
     userId,
    amount,
    options = {}
) => {

     const { transaction } = options;

    let wallet = await Wallet.findOne({
        where: { userId },
        transaction,
    });

    if (!wallet) {
        throw new AppError(
            "Wallet not found.",
            404
        );
    }

    if (Number(wallet.balance) < Number(amount)) {
        throw new AppError(
            "Insufficient wallet balance.",
            400
        );
    }

    wallet.balance =
        Number(wallet.balance) -
        Number(amount);
    
    await wallet.save({ transaction });

    return wallet;
}

export const withdrawFromWalletService = async (
    userId,
    { amount, bankAccountId }
) => {

    const MIN_WITHDRAWAL = 100;

    if (Number(amount) < MIN_WITHDRAWAL) {
        throw new AppError(
            "Minimum withdrawal is ₦100.",
            400
        );
    }

    // Chosen account, or the default one
    let account = bankAccountId
        ? await BankAccount.findOne({
              where: { id: bankAccountId, userId },
          })
        : (await BankAccount.findOne({
              where: { userId, isDefault: true },
          })) ||
          (await BankAccount.findOne({
              where: { userId },
          }));

    if (!account) {
        throw new AppError(
            "Add a bank account first.",
            400
        );
    }

    // Debits, and throws on insufficient balance
    const wallet = await debitWallet(
        userId,
        amount
    );

    await createWalletTransaction({
        wallet,
        amount,
        type: "WITHDRAWAL",
        transactionType: "DEBIT",
        description:
            `Withdrawal paid to ${account.bankName} ` +
            `••••${account.accountNumber.slice(-4)}`,
    });

    await createNotification({
        userId,
        title: "Withdrawal Successful",
        message:
            `₦${amount} has been sent to ` +
            `${account.bankName} ${account.accountNumber}.`,
        type: "WALLET",
    });

    return {
        amount,
        bank: {
            bankName: account.bankName,
            accountNumber: account.accountNumber,
            accountName: account.accountName,
        },
        balance: Number(wallet.balance),
    };

};