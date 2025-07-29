import mongoose from "mongoose"; // or use require("mongoose") if not using ESM

const connectDB = async () => {
  mongoose.connection.on("connected", () => {
    console.log("✅ Database Connected");
  });

  
    await mongoose.connect(`${process.env.MONGODB_URI}/imagify`
    );
}

export default connectDB;
