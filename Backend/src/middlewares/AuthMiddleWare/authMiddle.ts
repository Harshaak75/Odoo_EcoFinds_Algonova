import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { VerifyRefreshToken } from "../../utils/JwtToken/tokenFunction";

declare global {
  namespace Express {
    interface Request {
      user?: {
        user_id: string;
        role: string;
      };
    }
  }
}

export const authenticate_user = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  let token = req.headers.authorization?.split(" ")[1]; // Assuming Bearer token format

  if(!token){
    token = req.query.tokens as string
  }

  const refreshTokens = req.cookies?.refreshToken;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.ACCESS_SECRET as string);
    req.user = { user_id: decoded.userId, role: decoded.role }; // Attach user info to request object
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError" && refreshTokens) {
      // Handle token expiration and attempt refresh
      const { accessToken, role, userId, refreshToken } =
        await VerifyRefreshToken(refreshTokens);
      req.user = { user_id: userId as string, role: role as string }; // Attach user info to request object

      if (refreshToken) {
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production", // Set to true in production
          sameSite: "strict", // Adjust based on your requirements
          maxAge: 1000 * 60 * 60 * 24 * 20, // 20 days
        });
      }
      res.setHeader("x-new-access-token", accessToken);
      res.setHeader("x-user-role", role);

      next();
    } else {
      console.error("Authentication error:", error);
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  }
};
