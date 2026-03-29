import { GoogleGenerativeAI } from "@google/generative-ai";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { reportId, imageUrl, description } = req.body;
  if (!reportId) return res.status(400).json({ error: "Missing reportId" });

  try {
    // Mark as analyzing
    await prisma.report.update({
      where: { id: reportId },
      data: { status: "analyzing" },
    });

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const parts = [];

    // Add image if available
    if (imageUrl) {
      try {
        const imgRes = await fetch(imageUrl);
        const buffer = await imgRes.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        const mimeType = imgRes.headers.get("content-type") || "image/jpeg";
        parts.push({ inlineData: { data: base64, mimeType } });
      } catch {
        // Continue without image
      }
    }

    parts.push({
      text: `Analyze this civic issue report and provide a JSON response.
Description: ${description || "No description provided"}

Respond with ONLY valid JSON in this format:
{
  "category": "pothole|garbage|streetlight|flooding|vandalism|other",
  "priority": "critical|high|medium|low",
  "confidence": 0.0 to 1.0,
  "summary": "Brief analysis of the issue",
  "suggestedAction": "Recommended action to resolve"
}`,
    });

    const result = await model.generateContent(parts);
    const text = result.response.text().trim();
    const clean = text.replace(/```json|```/g, "").trim();
    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse AI response");

    const analysis = JSON.parse(jsonMatch[0]);

    // Update report
    await prisma.report.update({
      where: { id: reportId },
      data: {
        aiCategory: analysis.category,
        aiPriority: analysis.priority,
        aiConfidence: analysis.confidence,
        aiSummary: analysis.summary,
        aiSuggestedAction: analysis.suggestedAction,
        category: analysis.category,
        priority: analysis.priority,
        status: "pending",
      },
    });

    // Create alert if critical
    if (analysis.priority === "critical") {
      await prisma.alert.create({
        data: {
          reportId,
          severity: "critical",
          message: `Critical issue detected: ${analysis.summary}`,
        },
      });
    }

    return res.status(200).json({ success: true, analysis });
  } catch (error) {
    // Revert to pending on failure
    await prisma.report
      .update({ where: { id: reportId }, data: { status: "pending" } })
      .catch(() => {});

    return res.status(500).json({ error: error.message });
  }
}
