import { Resend } from "resend";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { taskId } = req.body;
  if (!taskId) return res.status(400).json({ error: "Missing taskId" });

  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        report: { include: { reporter: true } },
        worker: { include: { profile: true } },
      },
    });

    if (!task) return res.status(404).json({ error: "Task not found" });

    const report = task.report;
    const worker = task.worker;
    const workerName = worker.profile?.fullName || worker.profile?.email || "Field worker";

    // Email to admins
    const admins = await prisma.profile.findMany({
      where: { role: "admin" },
    });

    const adminEmails = admins.map((a) => a.email).filter(Boolean);

    if (adminEmails.length > 0) {
      await resend.emails.send({
        from: "CivicSense <notifications@civicsense.app>",
        to: adminEmails,
        subject: `Task Completed: ${report.title}`,
        html: `
          <h2>Task Completed</h2>
          <p><strong>${workerName}</strong> resolved "<em>${report.title}</em>"</p>
          <ul>
            <li><strong>Category:</strong> ${report.category || "—"}</li>
            <li><strong>Priority:</strong> ${report.priority || "—"}</li>
            <li><strong>Zone:</strong> ${worker.zone || "—"}</li>
          </ul>
          ${task.afterImage ? `<p><strong>Completion photo:</strong><br/><img src="${task.afterImage}" width="400" /></p>` : ""}
          <hr />
          <p style="color: #888; font-size: 12px;">CivicSense Notification System</p>
        `,
      });
    }

    // Email to helper (original reporter)
    if (report.reporter?.email) {
      await resend.emails.send({
        from: "CivicSense <notifications@civicsense.app>",
        to: report.reporter.email,
        subject: "Your reported issue has been resolved!",
        html: `
          <h2>Issue Resolved!</h2>
          <p>Great news! The issue you reported — "<em>${report.title}</em>" — has been resolved by our field team.</p>
          ${task.afterImage ? `<p><strong>Resolution photo:</strong><br/><img src="${task.afterImage}" width="400" /></p>` : ""}
          <p>Thank you for helping improve your community!</p>
          <hr />
          <p style="color: #888; font-size: 12px;">CivicSense — Building better communities together</p>
        `,
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
