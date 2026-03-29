import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    const { worker_id } = req.query;
    const where = {};
    if (worker_id) where.workerId = worker_id;

    const tasks = await prisma.task.findMany({
      where,
      include: { report: true },
      orderBy: { assignedAt: "desc" },
    });

    const mapped = tasks.map((t) => ({
      id: t.id,
      report_id: t.reportId,
      worker_id: t.workerId,
      assigned_by: t.assignedBy,
      status: t.status,
      before_image: t.beforeImage,
      after_image: t.afterImage,
      notes: t.notes,
      assigned_at: t.assignedAt,
      started_at: t.startedAt,
      completed_at: t.completedAt,
      report: t.report
        ? {
            id: t.report.id,
            title: t.report.title,
            description: t.report.description,
            image_url: t.report.imageUrl,
            lat: t.report.lat,
            lng: t.report.lng,
            category: t.report.category,
            status: t.report.status,
            priority: t.report.priority,
          }
        : null,
    }));

    return res.status(200).json(mapped);
  }

  if (req.method === "PATCH") {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Missing task ID" });

    const body = req.body;
    const data = {};
    if (body.status) data.status = body.status;
    if (body.started_at) data.startedAt = new Date(body.started_at);
    if (body.completed_at) data.completedAt = new Date(body.completed_at);
    if (body.after_image) data.afterImage = body.after_image;
    if (body.notes) data.notes = body.notes;

    const task = await prisma.task.update({ where: { id }, data });

    // If completed, update report status + worker counts + send email
    if (body.status === "completed") {
      await prisma.report.update({
        where: { id: task.reportId },
        data: { status: "resolved" },
      });

      await prisma.worker.update({
        where: { id: task.workerId },
        data: {
          activeTaskCount: { decrement: 1 },
          totalCompleted: { increment: 1 },
        },
      });

      // Trigger completion email (fire and forget)
      try {
        const baseUrl = process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000";
        fetch(`${baseUrl}/api/send-completion-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskId: task.id }),
        });
      } catch {
        // Don't block on email failures
      }
    }

    // If escalated, put report back to pending and decrement worker tasks
    if (body.status === "escalated") {
      await prisma.report.update({
        where: { id: task.reportId },
        data: { status: "escalated" },
      });

      await prisma.worker.update({
        where: { id: task.workerId },
        data: { activeTaskCount: { decrement: 1 } },
      });
    }

    return res.status(200).json(task);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
