import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./libs/db.js";
import authRoute from "./routes/authRoute.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

//Middlewares
app.use(express.json());

//public router
app.use("/api/auth", authRoute);
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(PORT);
  });
});
