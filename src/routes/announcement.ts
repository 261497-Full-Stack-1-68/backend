import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import * as path from "path";
import { writeFile } from "fs/promises";

const prisma = new PrismaClient();
const app = new Hono();

// helper function สร้างชื่อไฟล์แบบสุ่ม
function makeFileName(originalName: string) {
  const ext = originalName.split('.').pop();
  const random = Date.now() + "-" + Math.floor(Math.random() * 1e9);
  return `image-${random}.${ext}`;
}

// GET /announcements - ดึงประกาศทั้งหมด
app.get("/", async (c) => {
  const tag = c.req.query("tag");
  
  let whereClause = {};
  
  // ถ้ามี tag ให้ค้นหาประกาศที่มี tag นั้น
  if (tag) {
    whereClause = {
      tags: {
        has: tag
      }
    };
  }

  const announcements = await prisma.announcementTable.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
  });
  return c.json(announcements);
});

// GET /announcements/tags - ดึง tags ทั้งหมดที่มี
app.get("/tags", async (c) => {
  const announcements = await prisma.announcementTable.findMany({
    select: { tags: true }
  });
  
  // รวม tags ทั้งหมดและเอาเฉพาะ unique
  const allTags = announcements
    .flatMap(announcement => announcement.tags)
    .filter((tag, index, arr) => arr.indexOf(tag) === index);
  
  return c.json(allTags);
});

// POST /announcements - สร้างประกาศใหม่
app.post("/", async (c) => {
  // รับ multipart form data
  const form = await c.req.formData();
  const title = form.get("title") as string;
  const content = form.get("content") as string;
  const tagsString = form.get("tags") as string;
  
  // แปลง tags จาก string เป็น array
  const tags = tagsString ? tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [];
  
  // รับไฟล์รูปภาพหลายไฟล์
  const imageFiles: File[] = [];
  let index = 0;
  while (true) {
    const file = form.get(`image${index}`) as File | null;
    if (!file || file.size === 0) break;
    imageFiles.push(file);
    index++;
  }

  const imageFileNames: string[] = [];

  // บันทึกไฟล์รูปภาพทั้งหมด
  for (const file of imageFiles) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const imageFileName = makeFileName(file.name);
    const uploadDir = path.join(process.cwd(), "uploads");

    // สร้างโฟลเดอร์ uploads ถ้ายังไม่มี
    try {
      await import("fs").then(fs => fs.mkdirSync(uploadDir, { recursive: true }));
    } catch {}

    // เขียนไฟล์ไปยังโฟลเดอร์ uploads
    await writeFile(path.join(uploadDir, imageFileName), buffer);
    imageFileNames.push(imageFileName);
  }

  const newAnnouncement = await prisma.announcementTable.create({
    data: {
      title,
      content,
      image: imageFileNames,
      tags: tags,
    },
  });

  return c.json(newAnnouncement, 201);
});

// GET /announcements/:id - ดึงประกาศตาม ID
app.get("/:id", async (c) => {
  const id = c.req.param("id");
  const announcement = await prisma.announcementTable.findUnique({
    where: { id },
  });
  if (!announcement) {
    return c.json({ error: "Announcement not found" }, 404);
  }
  return c.json(announcement);
});

// DELETE /announcements - ลบประกาศตาม ID
app.delete("/:id", async (c) => {
  const body = await c.req.json();
  const { id } = body;

  if (!id) {
    return c.json({ error: "ID is required" }, 400);
  }
  const announcement = await prisma.announcementTable.findUnique({
    where: { id },
  });
  if (!announcement) {
    return c.json({ error: "Announcement not found" }, 404);
  }

  await prisma.announcementTable.delete({
    where: { id },
  });
  return c.json({ message: "Announcement deleted" });
});

export default app;