import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { fullName, email, password, phone, zone } = req.body;
  if (!fullName || !email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Create Clerk user via Backend API
    const clerkRes = await fetch("https://api.clerk.com/v1/users", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        first_name: fullName.split(" ")[0],
        last_name: fullName.split(" ").slice(1).join(" ") || undefined,
        email_address: [email],
        password,
      }),
    });

    if (!clerkRes.ok) {
      const err = await clerkRes.json();
      return res.status(400).json({
        error: err.errors?.[0]?.message || "Failed to create Clerk user",
      });
    }

    const clerkUser = await clerkRes.json();

    // Create profile with worker role
    await prisma.profile.upsert({
      where: { id: clerkUser.id },
      update: { role: "worker", fullName, email, phone },
      create: {
        id: clerkUser.id,
        fullName,
        email,
        phone,
        role: "worker",
        avatarUrl: clerkUser.image_url,
      },
    });

    // Create worker record
    await prisma.worker.create({
      data: {
        id: clerkUser.id,
        zone: zone || null,
      },
    });

    return res.status(201).json({
      success: true,
      workerId: clerkUser.id,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
