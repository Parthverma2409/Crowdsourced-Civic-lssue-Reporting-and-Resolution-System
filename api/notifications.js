import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: "Missing user_id" });

    const notifications = await prisma.notification.findMany({
      where: { userId: user_id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const mapped = notifications.map((n) => ({
      id: n.id,
      user_id: n.userId,
      title: n.title,
      message: n.message,
      type: n.type,
      is_read: n.isRead,
      metadata: n.metadata,
      created_at: n.createdAt,
    }));

    return res.status(200).json(mapped);
  }

  if (req.method === "PATCH") {
    const { id, user_id, mark_all } = req.query;
    const { is_read } = req.body;

    if (mark_all === "true" && user_id) {
      await prisma.notification.updateMany({
        where: { userId: user_id },
        data: { isRead: is_read },
      });
      return res.status(200).json({ success: true });
    }

    if (id) {
      await prisma.notification.update({
        where: { id },
        data: { isRead: is_read },
      });
      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: "Missing id or user_id" });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
