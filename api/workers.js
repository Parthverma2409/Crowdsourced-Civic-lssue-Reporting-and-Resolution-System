import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    const { id } = req.query;

    if (id) {
      const worker = await prisma.worker.findUnique({
        where: { id },
        include: { profile: true },
      });

      if (!worker) return res.status(404).json({ error: "Worker not found" });

      return res.status(200).json({
        ...worker,
        profile: worker.profile
          ? {
              full_name: worker.profile.fullName,
              email: worker.profile.email,
              phone: worker.profile.phone,
              avatar_url: worker.profile.avatarUrl,
            }
          : null,
      });
    }

    const workers = await prisma.worker.findMany({
      include: { profile: true },
    });

    const mapped = workers.map((w) => ({
      id: w.id,
      zone: w.zone,
      is_available: w.isAvailable,
      current_lat: w.currentLat,
      current_lng: w.currentLng,
      last_location_update: w.lastLocationUpdate,
      active_task_count: w.activeTaskCount,
      total_completed: w.totalCompleted,
      profile: w.profile
        ? {
            full_name: w.profile.fullName,
            email: w.profile.email,
            phone: w.profile.phone,
            avatar_url: w.profile.avatarUrl,
          }
        : null,
    }));

    return res.status(200).json(mapped);
  }

  if (req.method === "PATCH") {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Missing worker ID" });

    const body = req.body;
    const data = {};
    if (body.is_available !== undefined) data.isAvailable = body.is_available;
    if (body.current_lat !== undefined) data.currentLat = body.current_lat;
    if (body.current_lng !== undefined) data.currentLng = body.current_lng;
    if (body.current_lat !== undefined || body.current_lng !== undefined) {
      data.lastLocationUpdate = new Date();
    }
    if (body.zone) data.zone = body.zone;

    const worker = await prisma.worker.update({ where: { id }, data });
    return res.status(200).json(worker);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
