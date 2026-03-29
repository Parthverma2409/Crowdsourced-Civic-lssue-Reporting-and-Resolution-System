import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@clerk/backend";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const payload = await verifyToken(authHeader.split(" ")[1], {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    // Only admins can change roles
    const caller = await prisma.profile.findUnique({
      where: { id: payload.sub },
    });
    if (!caller || caller.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { userId, role } = req.body;
    if (!userId || !["helper", "worker", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid userId or role" });
    }

    const updated = await prisma.profile.update({
      where: { id: userId },
      data: { role },
    });

    return res.status(200).json({ id: updated.id, role: updated.role });
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}
