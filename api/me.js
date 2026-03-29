import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@clerk/backend";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    const userId = payload.sub;

    let profile = await prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!profile) {
      // Check if profile exists by email (for Google OAuth users)
      profile = await prisma.profile.findFirst({
        where: { email: payload.email },
      });

      // If still no profile, create one as helper
      if (!profile) {
        profile = await prisma.profile.create({
          data: {
            id: userId,
            email: payload.email,
            role: "helper",
          },
        });
      } else {
        // Update the profile with correct Clerk userId
        profile = await prisma.profile.update({
          where: { id: profile.id },
          data: { id: userId },
        });
      }
    }

    return res.status(200).json({
      id: profile.id,
      role: profile.role,
      fullName: profile.fullName,
      email: profile.email,
      avatarUrl: profile.avatarUrl,
      phone: profile.phone,
    });
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}
