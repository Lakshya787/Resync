import { User } from "../models/user.model.js";
import crypto from "crypto";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { transporter } from "../utils/mailer.js";

/* =================================
SIGNUP
================================= */

export const signup = async (req, res) => {
  try {

    const { email, password, fullname, username } = req.body;

    if (!email || !password || !fullname || !username) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = new User({
      email,
      password,
      fullname,
      username,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000
    });

    await user.save();

    const verificationURL =
      `http://localhost:5000/api/v1/auth/verify-email?token=${verificationToken}`;

    await transporter.sendMail({
      from: '"Resync" <no-reply@resync.com>',
      to: user.email,
      subject: "Verify Your Email",
      html: `
        <h2>Email Verification</h2>
        <p>Click the link below to verify your email:</p>
        <a href="${verificationURL}">Verify Email</a>
        <p>This link expires in 24 hours.</p>
      `
    });

    res.status(201).json({
      success: true,
      message: "User created. Please verify your email."
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};


/* =================================
LOGIN
================================= */

export const login = async (req, res) => {
  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email first"
      });
    }

    user.lastLogin = new Date();
    await user.save();

    generateTokenAndSetCookie(res, user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        email: user.email,
        fullname: user.fullname,
        username: user.username
      }
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};


/* =================================
LOGOUT
================================= */

export const logout = async (req, res) => {
  try {

    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production"
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};


/* =================================
VERIFY EMAIL
================================= */

export const verifyEmail = async (req, res) => {
  try {

    const { token } = req.query;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiresAt: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token"
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};


