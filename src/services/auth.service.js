import { Op } from "sequelize";
import crypto from "crypto"
import User from "../models/user.model.js";
import { hashPassword } from "../utils/hashPassword.js";
import { comparePassword } from "../utils/comparePassword.js";
import { MESSAGES } from "../constants/messages.js";
import AppError from "../utils/AppError.js";
import generateResetToken from "../utils/generateResetToken.js";
import { generateToken } from "../utils/generateToken.js";
import { sendResetEmail } from "./email.service.js";
import { sendSMS } from "./sms.service.js";
import { selectRole } from "../controllers/selectRole.controller.js";
import {sendEmailOTPService,} from "./otp.service.js";
import { ROLES } from "../constants/roles.js";
import Wallet from "../models/wallet.model.js";
import generateDriverId from "../utils/generateDriverId.js";
import CorporateProfile from "../models/corporateProfile.model.js";
import DriverProfile from "../models/driver.model.js";
import DriverDocument from "../models/driverDocument.model.js";
import PassengerProfile from "../models/passengerProfile.model.js";

export const registerUser = async (userData) => {
    const {
        firstName,
        lastName,
        fullName,
        email,
        phoneNumber,
        password,
        role,
        companyName,
        rcNumber,
    } = userData;

    // Resolve names: accept firstName/lastName or a single fullName
    let resolvedFirstName = firstName || null;
    let resolvedLastName = lastName || null;

    if (fullName && (!resolvedFirstName || !resolvedLastName)) {
        const parts = fullName.trim().split(/\s+/);
        resolvedFirstName = resolvedFirstName || parts[0];
        resolvedLastName =
            resolvedLastName || parts.slice(1).join(" ") || null;
    }

    // Check if email or phone already exists
    const conditions = [{ email }];

    if (phoneNumber) {
        conditions.push({ phoneNumber });
    }

    const existingUser = await User.findOne({
        where: {
            [Op.or]: conditions,
        },
    });

    if (existingUser) {

        if (existingUser.email === email) {
            throw new AppError(
                MESSAGES.EMAIL_EXISTS,
                409
            );
        }

        throw new AppError(
            MESSAGES.PHONE_EXISTS,
            409
        );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Determine role (corporate is auto-detected; otherwise use chosen role)
    const userRole =
        companyName && rcNumber
            ? ROLES.CORPORATE_ADMIN
            : role?.trim().toUpperCase();

    // Create user
    const user = await User.create({
        firstName: resolvedFirstName,
        lastName: resolvedLastName,
        email,
        phoneNumber: phoneNumber || null,
        password: hashedPassword,
        role: userRole,
    });

    // Generate and send OTP (email + phone)
    try {
        await sendEmailOTPService(user.email, user.phoneNumber);
    } catch (error) {
        // If OTP sending fails, delete the user so they're not stuck
        await user.destroy();
        throw error;
    }

    // Create wallet with 0 balance
    await Wallet.create({
        userId: user.id,
        balance: 0,
    });

    // Create the role profile immediately so profile/dashboard
    // endpoints return data (they used to 404 until completion)
    if (userRole === ROLES.DRIVER) {
        await DriverProfile.create({
            userId: user.id,
            profileCompleted: false,
        });
    }

    if (userRole === ROLES.PASSENGER) {
        await PassengerProfile.create({
            userId: user.id,
            profileCompleted: false,
        });
    }

    // Generate Driver ID for drivers
    if (userRole === ROLES.DRIVER) {
        let driverId;
        let isUnique = false;
        while (!isUnique) {
            driverId = generateDriverId();
            const existing = await User.findOne({ where: { driverId } });
            if (!existing) isUnique = true;
        }
        user.driverId = driverId;
        await user.save();
    }

    // Create corporate profile if corporate
    if (userRole === ROLES.CORPORATE_ADMIN) {
        await CorporateProfile.create({
            userId: user.id,
            companyName,
            rcNumber,
            companyPhone: phoneNumber || null,
            profileCompleted: true,
        });
    }

    // Build role-appropriate response
    const response = {
        success: true,
        message:
            "Registration successful. Please verify your email.",
        email: user.email,
        role: user.role,
    };

    if (userRole === ROLES.DRIVER) {
        response.driverId = user.driverId;
        response.firstName = user.firstName;
        response.lastName = user.lastName;
    }

    if (userRole === ROLES.PASSENGER) {
        response.firstName = user.firstName;
        response.lastName = user.lastName;
    }

    if (userRole === ROLES.CORPORATE_ADMIN) {
        response.companyName = companyName;
        response.rcNumber = rcNumber;
    }

    return response;
};

// Login User
export const loginUser = async (userData) => {
  const { identifier, driverId, email, phoneNumber, password } = userData;

  const loginId = identifier || driverId || email || phoneNumber;

  if (!loginId) {
    throw new AppError(
      "Email, phone number, or Driver ID is required.",
      400
    );
  }

  let where;

  if (loginId.startsWith("DRV-")) {
    where = { driverId: loginId };
  } else if (loginId.includes("@")) {
    where = { email: loginId };
  } else {
    where = { phoneNumber: loginId };
  }

  const user = await User.findOne({ where });

  if (!user) {
    throw new AppError(
      MESSAGES.INVALID_CREDENTIALS,
      401
    );
  }

  // Compare passwords
  const passwordMatch = await comparePassword(
    password,
    user.password
  );
  if (!passwordMatch) {
    throw new AppError(
      MESSAGES.INVALID_CREDENTIALS,
      401
    );
  }

  if (!user.emailVerified) {
    throw new AppError(
      "Please verify your email first.",
      403
    );
  }

  // Update last login
  user.lastLogin = new Date();

  await user.save();

  // Generate JWT
  const token = generateToken(user);

  // Build role-appropriate user payload
  const userPayload = {
    id: user.id,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    profilePicture: user.profilePicture,
    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified,
    isVerified: user.isVerified,
    status: user.status,
    lastLogin: user.lastLogin,
  };

  if (user.role === ROLES.DRIVER) {
    userPayload.firstName = user.firstName;
    userPayload.lastName = user.lastName;
    userPayload.driverId = user.driverId;
  }

  if (user.role === ROLES.PASSENGER) {
    userPayload.firstName = user.firstName;
    userPayload.lastName = user.lastName;
  }

  if (user.role === ROLES.CORPORATE_ADMIN) {
    const corporate = await CorporateProfile.findOne({
      where: { userId: user.id },
      attributes: ["companyName", "rcNumber"],
    });

    if (corporate) {
      userPayload.companyName = corporate.companyName;
      userPayload.rcNumber = corporate.rcNumber;
    }
  }

  // Return response
  return {
    success: true,
    message: MESSAGES.LOGIN_SUCCESS,
    token,
    user: userPayload,
  };
};

export const changePassword = async (
    userId,
    userData
) => {

    const {
        currentPassword,
        newPassword,
    } = userData;

    const user = await User.findByPk(userId);

    if (!user) {
        throw new AppError(
            MESSAGES.USER_NOT_FOUND,
            404
        );
    }

    const passwordMatch = await comparePassword(
        currentPassword,
        user.password
    );

    if (!passwordMatch) {

        throw new AppError(
            MESSAGES.INCORRECT_PASSWORD,
            401
        );

    }

    const hashedPassword =
        await hashPassword(newPassword);

    await user.update({
        password: hashedPassword,
        passwordChangedAt: new Date(),

    });

    return null;

};

export const forgotPasswordService = async ({
    email,
    phoneNumber,
    frontendUrl,
}) => {

    const conditions = [];

    if (email) {
        conditions.push({ email });
    }

    if (phoneNumber) {
        conditions.push({ phoneNumber });
    }

    if (conditions.length === 0) {
        throw new AppError(
            "Email or phone number is required.",
            400
        );
    }

    const user = await User.findOne({
        where: { [Op.or]: conditions },
    });

    if (!user) {
        return;
    }

    const { resetToken, hashedToken } = generateResetToken();

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(
        Date.now() + 15 * 60 * 1000
    );

    await user.save();

    // The reset link always goes to email (more reliable for links)
    await sendResetEmail(user.email, resetToken, frontendUrl);

    // Optional SMS notification (never fails the request)
    if (user.phoneNumber) {
        try {
            await sendSMS(
                user.phoneNumber,
                "A password reset link has been sent to your email."
            );
        } catch (error) {
            console.error("RESET SMS ERROR:", error.message);
        }
    }

    return resetToken;
};

export const resetPasswordService = async (
    token,
    userData
) => {

    const {
        newPassword,
    } = userData;

    // Hash the token received from the URL
    const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    // Find a user with this token that hasn't expired
    const user = await User.findOne({

        where: {

            passwordResetToken: hashedToken,

            passwordResetExpires: {
                [Op.gt]: new Date(),
            },

        },

    });

    if (!user) {

        throw new AppError(
            MESSAGES.INVALID_RESET_TOKEN,
            400
        );

    }

    // Hash the new password
    user.password = await hashPassword(newPassword);

    // Clear reset fields
    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    // Force old JWTs to become invalid
    user.passwordChangedAt = new Date();

    await user.save();

};

export const getOnboardingStatusService = async (userId) => {
    const user = await User.findByPk(userId);

    if (!user) {
        throw new AppError(MESSAGES.USER_NOT_FOUND, 404);
    }

    const status = {
        role: user.role,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        profileCompleted: false,
        documentsUploaded: false,
        verificationStatus: null,
        nextStep: null,
    };

    if (!user.emailVerified) {
        status.nextStep = "VERIFY_EMAIL";
        return status;
    }

    if (user.role === ROLES.DRIVER) {
        const driverProfile = await DriverProfile.findOne({
            where: { userId },
        });

        const documents = driverProfile
            ? await DriverDocument.findOne({
                  where: { driverId: driverProfile.id },
              })
            : null;

        status.profileCompleted = Boolean(
            driverProfile?.profileCompleted
        );
        status.documentsUploaded = Boolean(documents);
        status.verificationStatus =
            documents?.verificationStatus || null;

        if (!driverProfile || !driverProfile.profileCompleted) {
            status.nextStep = "COMPLETE_PROFILE";
        } else if (!documents) {
            status.nextStep = "UPLOAD_DOCUMENTS";
        } else if (documents.verificationStatus === "PENDING") {
            status.nextStep = "AWAIT_VERIFICATION";
        } else if (documents.verificationStatus === "REJECTED") {
            status.nextStep = "REUPLOAD_DOCUMENTS";
        } else {
            status.nextStep = "DASHBOARD";
        }

        return status;
    }

    if (user.role === ROLES.PASSENGER) {
        const passengerProfile = await PassengerProfile.findOne({
            where: { userId },
        });

        status.profileCompleted = Boolean(
            passengerProfile?.profileCompleted
        );

        status.nextStep = passengerProfile?.profileCompleted
            ? "DASHBOARD"
            : "COMPLETE_PROFILE";

        return status;
    }

    if (user.role === ROLES.CORPORATE_ADMIN) {
        const corporate = await CorporateProfile.findOne({
            where: { userId },
        });

        status.profileCompleted = Boolean(
            corporate?.profileCompleted
        );

        if (!corporate || !corporate.companyAddress) {
            status.nextStep = "COMPLETE_PROFILE";
        } else {
            status.nextStep = "DASHBOARD";
        }

        return status;
    }

    status.nextStep = "SELECT_ROLE";

    return status;
};