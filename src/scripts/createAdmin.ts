import dotenv from "dotenv";
import { connectDB } from "../config/database";
import User from "../models/User";

dotenv.config();

const createAdmin = async () => {
  try {
    console.log("🔄 Connecting to database...");
    await connectDB();
    console.log("✅ Database connected successfully!");

    // The desired email and name for the main admin
    const ADMIN_EMAIL = "aremon2533@gmail.com";
    const ADMIN_PASSWORD = "Zestifydemo7!";
    const ADMIN_PHONE = "+8801642482065";
    const ADMIN_NAME = "Azizur Rahman";

    // 1. Check if admin already exists
    console.log("🔍 Checking if admin exists...");
    let admin = await User.findOne({ email: ADMIN_EMAIL });

    if (!admin) {
      // 2. If admin doesn't exist, create it (new seeding)
      console.log("📝 Creating new admin user...");
      admin = await User.create({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        phone: ADMIN_PHONE,
        name: ADMIN_NAME,
        role: "admin",
      });
      console.log("✅ Admin user created successfully!");
      console.log("📄 Admin ID:", admin._id);
    } else {
      console.log("⚠️  Admin user already exists.");
      console.log("📄 Admin ID:", admin._id);

      // 3. Data Migration Check: Update existing admin if 'name' is missing
      if (!admin.name) {
        console.log("🔧 Updating admin with missing name field...");
        await User.updateOne(
            { _id: admin._id },
            { $set: { name: ADMIN_NAME } }
        );
        admin.name = ADMIN_NAME;
        console.log("✨ Added missing 'name' field to existing admin.");
      }
    }

    // Verify the user was actually saved
    const verifyAdmin = await User.findOne({ email: ADMIN_EMAIL });
    if (verifyAdmin) {
      console.log("\n✅ Verification: Admin exists in database");
      console.log("👤 Name:", verifyAdmin.name);
      console.log("📧 Email:", verifyAdmin.email);
      console.log("📱 Phone:", verifyAdmin.phone);
      console.log("🔑 Password:", ADMIN_PASSWORD);
      console.log("\n⚠️  Please change the password after first login!");
    } else {
      console.error("❌ Verification failed: Admin not found in database!");
    }

    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error running seed script:", error.message);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  }
};

createAdmin();