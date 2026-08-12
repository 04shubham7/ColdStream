import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/coldmailer");
    console.log("Worker: MongoDB connected");
  } catch (error) {
    console.error("Worker: MongoDB connection error:", error.message);
    process.exit(1);
  }
};
