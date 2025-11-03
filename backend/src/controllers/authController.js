import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import Session from "../models/Session.js";

const ACCESS_TOKEN_TTL = "30m";
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000;

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

export const signIn = async (req, res) => {
  try {
    //Lấy input
    const { username, password } = req.body;
    console.log(req);

    if (!username || !password) {
      return res.status(400).json({
        message: "Khong the thieu username, password",
      });
    }

    //Lấy HashedPasword trong db để so sánh với password inout
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({
        message: "Username, password khong chinh xac",
      });
    }

    //Kiểm tra password
    const passwordCorrect = await bcrypt.compare(password, user.hashedPassword);
    if (!passwordCorrect) {
      return res.status(401).json({
        message: "Password khong chinh xac",
      });
    }

    //Nếu khớp, tạo accessToken với JWT
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL }
    );

    //Tạo refresh token
    const refreshToken = crypto.randomBytes(64).toString("hex");
    //tạo sesion mới để lưu refresh token
    await Session.create({
      userId: user._id,

      refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });

    //Trả refresh token về trong cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: REFRESH_TOKEN_TTL,
    });

    //Trả access token về trong res
    return res
      .status(200)
      .json({ message: `User ${user.displayName}`, accessToken });
  } catch (error) {
    console.error("Loi signIn", error);
    return res.status(500).json({ message: "Loi he thong" });
  }
};

export const signOut = async (req, res) => {
  try {
    //lấy rếh token trong cookie
    const token = req.cookies?.refreshToken;
    if (token) {
      //Xoas refresh token trong session
      await Session.deleteOne({ refreshToken: token });
      //xoa coookie
      res.clearCookie("refreshToken");
    }

    //return
    return res.sendStatus(204);
  } catch (error) {
    console.error("Loi signOut", error);
    return res.status(500).json({ message: "Loi he thong" });
  }
};
