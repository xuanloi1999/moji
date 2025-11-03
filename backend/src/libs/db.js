import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MOONGODB_CONNECTION_STRING);
    console.log("Lien ket CSDL Thanh cong");
  } catch (error) {
    console.log("Lien ket CSDL that bai: ", error);
    process.exit();
  }
};
