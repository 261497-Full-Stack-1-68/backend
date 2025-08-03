import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";

const app = new Hono();
const prisma = new PrismaClient();

// GET /members
app.get("/", async (c) => {
  try {
    const members = await prisma.memberProjectTable.findMany();
    return c.json(members);
  } catch (error) {
    console.error("Error fetching members:", error);
    return c.json({ error: "Failed to fetch members" }, 500);
  }
});

// POST /members
app.post("/", async (c) => {
  const body = await c.req.json();
  const { fullname, code, nickname, imageUrl } = body;

  if (!fullname || !code || !nickname || !imageUrl) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  try {
    if (await prisma.memberProjectTable.findFirst({ where: { code } })) {
      return c.json({ error: "Member with this code already exists" }, 400);
    }

    const newMember = await prisma.memberProjectTable.create({
      data: {
        fullname,
        code,
        nickname,
        imageUrl,
      },
    });

    return c.json(
      { message: "Member created successfully", data: newMember },
      201
    );
  } catch (error) {
    console.error("Error creating member:", error);
    return c.json({ error: "Failed to create member" }, 500);
  }
});

// DELETE /members/:code
app.delete("/:code", async (c) => {
  const { code } = c.req.param();
  if (!code) {
    return c.json({ error: "Code parameter is required" }, 400);
  }

  try {
    // Find the member by code first to get its id
    const member = await prisma.memberProjectTable.findFirst({
      where: { code },
    });

    if (!member) {
      return c.json({ error: "Member not found" }, 404);
    }

    const deletedMember = await prisma.memberProjectTable.delete({
      where: { id: member.id },
    });
    return c.json(
      { message: "Member deleted successfully", data: deletedMember },
      200
    );
  } catch (error) {
    console.error("Error deleting member:", error);
    return c.json({ error: "Failed to delete member" }, 500);
  }
});

export default app;
