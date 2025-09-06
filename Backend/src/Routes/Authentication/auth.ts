import express from "express";
import {
  CompareFunction,
  HashingFunction,
} from "../../utils/Authentication/auth";
import prisma from "../../config/prisma";
import { authenticate_user } from "../../middlewares/AuthMiddleWare/authMiddle";
import { GenerateTokens } from "../../utils/JwtToken/tokenFunction";
const router = express.Router();

router.post("/buyer/register", async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  try {
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const saltRounds = Number(process.env.SALT_ROUNDS);
    if (!saltRounds) {
      return res.status(500).json({
        error: "SALT_ROUNDS is not defined in the environment variables",
      });
    }

    const hashedPassword = HashingFunction(password, saltRounds);

    // TODO: Handle user registration logic (e.g., save to database)

    const response = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const { accessToken, refreshToken } = GenerateTokens(
      response.id,
      response.roles
    );

    res
      .status(201)
      .json({
        message: "User registered successfully",
        data: response,
        accessToken,
        refreshToken,
      });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

router.post("/buyer/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isValidPassword = CompareFunction(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // TODO: Generate and return JWT token
    const { accessToken, refreshToken } = GenerateTokens(user.id, user.roles);

    res
      .status(200)
      .json({
        message: "Login successful",
        data: user,
        accessToken,
        refreshToken,
      });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

router.post("/buyer/logout", authenticate_user, (req, res) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

export default router;
