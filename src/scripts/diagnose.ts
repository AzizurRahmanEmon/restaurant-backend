import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/database";
import User from "../models/User";

dotenv.config();

const diagnoseDatabase = async () => {
    try {
        console.log("🔄 Starting diagnostic...\n");

        // Check environment variables
        console.log("📋 Environment Check:");
        console.log("- MONGODB_URI exists:", !!process.env.MONGODB_URI);
        console.log("- JWT_SECRET exists:", !!process.env.JWT_SECRET);
        console.log("- NODE_ENV:", process.env.NODE_ENV || "not set");
        console.log();

        // Connect to database
        console.log("🔄 Connecting to database...");
        await connectDB();
        console.log("✅ Database connected!\n");

        // Check connection details
        console.log("📡 Connection Details:");
        console.log("- Database Name:", mongoose.connection.db?.databaseName);
        console.log("- Host:", mongoose.connection.host);
        console.log("- Connection State:", mongoose.connection.readyState);
        console.log();

        // List all collections
        console.log("📚 Collections in database:");
        const collections = await mongoose.connection.db?.listCollections().toArray();
        if (collections && collections.length > 0) {
            collections.forEach((col) => {
                console.log(`  - ${col.name}`);
            });
        } else {
            console.log("  ⚠️  No collections found!");
        }
        console.log();

        // Count users
        console.log("👥 User Statistics:");
        const userCount = await User.countDocuments();
        console.log(`- Total users: ${userCount}`);

        if (userCount > 0) {
            console.log("\n📝 All Users:");
            const users = await User.find({}).select("name email phone role createdAt");
            users.forEach((user, index) => {
                console.log(`\n  User ${index + 1}:`);
                console.log(`  - ID: ${user._id}`);
                console.log(`  - Name: ${user.name}`);
                console.log(`  - Email: ${user.email}`);
                console.log(`  - Phone: ${user.phone}`);
                console.log(`  - Role: ${user.role}`);
                console.log(`  - Created: ${user.createdAt}`);
            });
        } else {
            console.log("  ⚠️  No users found in database!");
        }

        // Check for specific admin
        console.log("\n🔍 Checking for specific admin:");
        const admin = await User.findOne({ email: "aremon2533@gmail.com" });
        if (admin) {
            console.log("✅ Admin found!");
            console.log("- ID:", admin._id);
            console.log("- Name:", admin.name);
            console.log("- Email:", admin.email);
        } else {
            console.log("❌ Admin not found!");
        }

        console.log("\n✅ Diagnostic complete!");
        process.exit(0);
    } catch (error: any) {
        console.error("\n❌ Diagnostic error:", error.message);
        console.error("Stack trace:", error.stack);
        process.exit(1);
    }
};

diagnoseDatabase();