import dotenv from "dotenv";
dotenv.config();
import sequelize from "../src/config/database.js";
import User from "../src/models/user.model.js";
import { hashPassword } from "../src/utils/hashPassword.js";

const [email, password] = process.argv.slice(2);

if (!email || !password) {
    console.log(
        "Usage: node scripts/createPlatformAdmin.js <email> <password>"
    );
    process.exit(1);
}

await sequelize.authenticate();

const hashedPassword = await hashPassword(password);

const existing = await User.findOne({
    where: { email },
});

if (existing) {
    existing.password = hashedPassword;
    existing.role = "PLATFORM_ADMIN";
    existing.emailVerified = true;
    existing.phoneVerified = true;
    existing.isVerified = true;
    await existing.save();

    console.log(`Platform admin password reset for ${email}`);
    process.exit(0);
}

await User.create({
    firstName: "Platform",
    lastName: "Admin",
    email,
    password: hashedPassword,
    role: "PLATFORM_ADMIN",
    emailVerified: true,
    phoneVerified: true,
    isVerified: true,
});

console.log(`Platform admin created: ${email}`);

process.exit(0);
