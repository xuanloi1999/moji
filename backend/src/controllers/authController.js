import bcrypt from "bcrypt";
import User from "../models/User.js";

export const signUp = async (req, res) => {
  try {
    const { username, password, email, firstname, lastname } = req.body;
    console.log(req);

    if (!username || !password || !email || !firstname || !lastname) {
      return res.status(400).json({
        message:
          "Khong the thieu username, password, email, firstname, lastname",
      });
    }

    //Kiem tra username ton tai
    const duplicate = await User.findOne({ username });
    if (duplicate) {
      return res.status(409).json({
        message: "Userbane da ton tai",
      });
    }
    //ma hoa password
    const hashedPassword = await bcrypt.hash(password, 10);

    //Tao user moi
    await User.create({
      username,
      hashedPassword,
      email,
      displayName: `${firstname} ${lastname}`,
    });
    //return
    return res.sendStatus(204);
  } catch (error) {
    console.error("Loi signup", error);
    return res.status(500).json({ message: "Loi he thong" });
  }
};
