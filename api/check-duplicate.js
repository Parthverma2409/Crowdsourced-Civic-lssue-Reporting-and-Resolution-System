import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const RADIUS_DEGREES = 0.001; // ~111m

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { reportId, lat, lng, category } = req.body;
  if (!reportId || !lat || !lng || !category) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const nearby = await prisma.report.findMany({
      where: {
        id: { not: reportId },
        category,
        status: { notIn: ["resolved", "duplicate"] },
        lat: { gte: lat - RADIUS_DEGREES, lte: lat + RADIUS_DEGREES },
        lng: { gte: lng - RADIUS_DEGREES, lte: lng + RADIUS_DEGREES },
      },
      take: 1,
      orderBy: { createdAt: "asc" },
    });

    if (nearby.length > 0) {
      await prisma.report.update({
        where: { id: reportId },
        data: { status: "duplicate", duplicateOfId: nearby[0].id },
      });

      return res.status(200).json({
        isDuplicate: true,
        duplicateOf: nearby[0].id,
      });
    }

    return res.status(200).json({ isDuplicate: false });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
