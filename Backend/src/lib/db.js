import mongoose from "mongoose";
import ENV from "./env.js"

const connectDB = async () => {
  await mongoose.connect(ENV.DB_URL);
  
};

export default connectDB
