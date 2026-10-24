import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const User = sequelize.define(
    "User",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        firstName: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        lastName: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },

        phoneNumber: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
        },

        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        role: {
            type: DataTypes.ENUM(
                "UNASSIGNED",
                "PASSENGER",
                "DRIVER",
                "CORPORATE_ADMIN",
                "PLATFORM_ADMIN"
            ),
            defaultValue: "UNASSIGNED",
        },

        // Email OTP verification
        emailVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },

        // Phone OTP verification
        phoneVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },

        // Overall account verification
        isVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },

        profilePicture: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        lastLogin: {
            type: DataTypes.DATE,
            allowNull: true,
        },

        passwordChangedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },

        passwordResetToken: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        passwordResetExpires: {
            type: DataTypes.DATE,
            allowNull: true,
        },

        status: {
            type: DataTypes.ENUM(
                "ACTIVE",
                "SUSPENDED",
                "DEACTIVATED"
            ),
            defaultValue: "ACTIVE",
        },

        driverId: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: true,
        },
    },
    {
        timestamps: true,
    }
);

export default User;