import express from "express";
import { HashingFunction } from "../../utils/Authentication/auth";
const router = express.Router();

router.post("/register", (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  const saltRounds = Number(process.env.SALT_ROUNDS);
  if (!saltRounds) {
    return res
      .status(500)
      .json({
        error: "SALT_ROUNDS is not defined in the environment variables",
      });
  }

  const hashedPassword = HashingFunction(password, saltRounds);

  // TODO: Handle user registration logic (e.g., save to database)

  res.status(201).json({ message: "User registered successfully" });
});

export default router;
