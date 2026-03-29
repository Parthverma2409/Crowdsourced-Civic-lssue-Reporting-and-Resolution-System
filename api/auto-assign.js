import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { reportId, reportLat, reportLng } = req.body;
  if (!reportId) return res.status(400).json({ error: "Missing reportId" });

  try {
    const report = await prisma.report.findUnique({ where: { id: reportId } });
    if (!report) return res.status(404).json({ error: "Report not found" });

    const lat = reportLat || report.lat;
    const lng = reportLng || report.lng;

    // Find available workers
    const workers = await prisma.worker.findMany({
      where: { isAvailable: true },
      include: { profile: true },
    });

    if (workers.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No available workers",
      });
    }

    // Filter workers with location, fallback to all workers
    const oneHourAgo = new Date(Date.now() - 3600000);
    const withLocation = workers.filter(
      (w) => w.currentLat && w.currentLng && (!w.lastLocationUpdate || w.lastLocationUpdate > oneHourAgo)
    );
    const pool = withLocation.length > 0 ? withLocation : workers;

    // Score: 50% proximity + 30% workload + 20% zone
    const scored = pool.map((w) => {
      let distance = 999;
      if (w.currentLat && w.currentLng) {
        distance = haversineDistance(lat, lng, w.currentLat, w.currentLng);
      }

      const proximityScore = distance < 999 ? 1 / (1 + distance) : 0;
      const workloadScore = 1 / (1 + w.activeTaskCount);

      return {
        worker: w,
        score: 0.5 * proximityScore + 0.3 * workloadScore,
        distance,
      };
    });

    scored.sort((a, b) => {
      if (Math.abs(a.score - b.score) < 0.01) {
        return a.worker.totalCompleted - b.worker.totalCompleted;
      }
      return b.score - a.score;
    });

    const best = scored[0].worker;

    // Create task
    const task = await prisma.task.create({
      data: {
        reportId,
        workerId: best.id,
        status: "assigned",
      },
    });

    // Update report status
    await prisma.report.update({
      where: { id: reportId },
      data: { status: "assigned" },
    });

    // Increment worker active tasks
    await prisma.worker.update({
      where: { id: best.id },
      data: { activeTaskCount: { increment: 1 } },
    });

    // Notify worker
    await prisma.notification.create({
      data: {
        userId: best.id,
        title: "New Task Assigned",
        message: `You've been assigned: ${report.title}`,
        type: "task_assigned",
        metadata: { taskId: task.id, reportId },
      },
    });

    return res.status(200).json({
      success: true,
      workerId: best.id,
      workerName: best.profile?.fullName || best.profile?.email,
      taskId: task.id,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
