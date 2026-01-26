import dotenv from "dotenv";
import { connectDB } from "../config/database";
import Customer from "../models/Customer";

dotenv.config();

const testCustomers = [
  {
    name: "John Doe",
    email: "john@example.com",
    phone: "+8801712345678",
    password: "password123",
    address: "123 Main Street",
    city: "Dhaka",
    zipCode: "1200",
    loyaltyPoints: 150,
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+8801812345678",
    password: "password123",
    address: "456 Park Avenue",
    city: "Dhaka",
    zipCode: "1205",
    loyaltyPoints: 200,
  },
  {
    name: "Mike Johnson",
    email: "mike@example.com",
    phone: "+8801912345678",
    password: "password123",
    address: "789 Lake Road",
    city: "Chittagong",
    zipCode: "4000",
    loyaltyPoints: 50,
  },
];

const seedCustomers = async () => {
  try {
    await connectDB();

    // Clear existing customers
    await Customer.deleteMany({});
    console.log("🗑️  Cleared existing customers");

    // Insert test customers
    await Customer.insertMany(testCustomers);
    console.log("✅ Test customers seeded successfully!");
    console.log(`📊 Total customers: ${testCustomers.length}`);

    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error seeding customers:", error.message);
    process.exit(1);
  }
};

seedCustomers();
