import { Webhook } from "svix";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return res.status(500).json({ error: "Webhook secret not configured" });
  }

  const svixId = req.headers["svix-id"];
  const svixTimestamp = req.headers["svix-timestamp"];
  const svixSignature = req.headers["svix-signature"];

  if (!svixId || !svixTimestamp || !svixSignature) {
    return res.status(400).json({ error: "Missing svix headers" });
  }

  const wh = new Webhook(webhookSecret);
  let evt;

  try {
    evt = wh.verify(JSON.stringify(req.body), {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch {
    return res.status(400).json({ error: "Invalid webhook signature" });
  }

  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    const email = email_addresses?.[0]?.email_address || "";
    const fullName = [first_name, last_name].filter(Boolean).join(" ") || "";

    await prisma.profile.upsert({
      where: { id },
      update: { email, fullName, avatarUrl: image_url },
      create: { id, email, fullName, avatarUrl: image_url, role: "helper" },
    });
  }

  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    const email = email_addresses?.[0]?.email_address || "";
    const fullName = [first_name, last_name].filter(Boolean).join(" ") || "";

    await prisma.profile.update({
      where: { id },
      data: { email, fullName, avatarUrl: image_url },
    });
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;
    await prisma.profile.delete({ where: { id } }).catch(() => {});
  }

  return res.status(200).json({ received: true });
}
