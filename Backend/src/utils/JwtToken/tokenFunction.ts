import jwt from "jsonwebtoken";
import env from "dotenv";
import bcrypt from "bcrypt";
import prisma from "../../config/prisma";

env.config();
export async function SaveRefreshToken(userId: string, refreshToken: string) {
  try {
    // const hashedRefreshToken = jwt.sign({ token: refreshToken }, process.env.REFRESH_SECRET as string);
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 20); // 20 days
    console.log("resfresh", refreshToken);
    await prisma.refreshToken.upsert({
      where: { userId },
      update: {
        tokenHash: refreshToken,
        createdAt: new Date(),
        expiresAt: expires,
      },
      create: {
        userId: userId,
        tokenHash: refreshToken,
        createdAt: new Date(),
        expiresAt: expires,
      },
    });
  } catch (error) {
    console.error("Error saving refresh token:", error);
    throw new Error("Failed to save refresh token");
  }
}

export function GenerateTokens(userId: string, roles: string[]) {
  const accessToken = jwt.sign(
    { userId, roles },
    process.env.ACCESS_SECRET as string,
    {
      expiresIn: "15m",
    }
  );
  const refreshToken = jwt.sign(
    { userId, roles },
    process.env.REFRESH_SECRET as string,
    {
      expiresIn: "20d",
    }
  );

  const hashedRefreshToken = bcrypt.hashSync(
    refreshToken,
    Number(process.env.SALT_ROUNDS_TOKEN)
  );

  console.log("role: ", roles);

  SaveRefreshToken(userId, hashedRefreshToken);

  return { accessToken, refreshToken };
}

export const VerifyRefreshToken = async (refreshtoken: string) => {
  try {
    let payload: any;
    try {
      console.log("1");
      payload = jwt.verify(refreshtoken, process.env.REFRESH_SECRET as string);
      console.log("2");
    } catch (err: any) {
      if (err.name === "TokenExpiredError") {
        const decoded: any = jwt.decode(refreshtoken);
        console.log("3");

        if (!decoded || !decoded.userId || !decoded.role) {
          throw new Error("Invalid token payload");
        }

        const { userId, role } = decoded;

        const { accessToken, refreshToken } = GenerateTokens(userId, role);

        return { accessToken, role, userId, refreshToken };
      } else {
        throw new Error("Invalid refresh token");
      }
    }

    const userId = payload.userId;
    const role = payload.role;

    // 3. Get stored hashed token from DB

    let tokenRecord;

    console.log("userId", userId);

    tokenRecord = await prisma.refreshToken.findUnique({
      where: { userId },
    });

    if (!tokenRecord) {
      throw new Error("Refresh token not found");
    }

    // 4. Compare hashed token with the one in DB
    const isValid = await bcrypt.compare(refreshtoken, tokenRecord.tokenHash);
    if (!isValid) {
      throw new Error("Token mismatch");
    }

    // 5. Token is valid, issue a new access token
    const accessToken = jwt.sign(
      { userId, role },
      process.env.ACCESS_SECRET as string,
      {
        expiresIn: "15m",
      }
    );

    return { accessToken, role, userId };
  } catch (error) {
    console.error("Error verifying refresh token:", error);
    throw new Error("Invalid refresh token");
  }
};
