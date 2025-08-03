import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";

const app = new Hono();
const prisma = new PrismaClient();

// GET /todo
app.get("/", async (c) => {
  try {
    const todos = await prisma.todoTable.findMany();
    return c.json(todos);
  } catch (error) {
    console.error("Error fetching todos:", error);
    return c.json({ error: "Failed to fetch todos" }, 500);
  }
});

// PUT /todo
app.put("/", async (c) => {
  const body = await c.req.json();
  const { todoText } = body;

  if (!todoText) {
    return c.json({ error: "Empty todoText" }, 400);
  }

  try {
    const result = await prisma.todoTable.create({
      data: {
        todoText,
      },
    });
    return c.json({ msg: `Insert successfully`, data: result }, 201);
  } catch (error) {
    console.error("Error inserting todo:", error);
    return c.json({ error: "Failed to insert todo" }, 500);
  }
});


// UPDATE /todo
app.patch("/", async (c) => {
  const body = await c.req.json();
  const { id, todoText } = body;

  if (!todoText || !id) {
    return c.json({ error: "Empty todoText or id" }, 400);
  }

  try {
    const results = await prisma.todoTable.findMany({
      where: {
        id,
      },
    });
    if (results.length === 0) {
      return c.json({ error: "Invalid id" }, 400);
    }

    const result = await prisma.todoTable.update({
      where: {
        id,
      },
      data: {
        todoText,
      },
    });
    return c.json({ msg: `Update successfully`, data: result });
  } catch (error) {
    console.error("Error updating todo:", error);
    return c.json({ error: "Failed to update todo" }, 500);
  }
});

// Delete /todo
app.delete("/", async (c) => {
  const body = await c.req.json();
  const { id } = body;

  if (!id) {
    return c.json({ error: "Empty id" }, 400);
  }

  try {
    const results = await prisma.todoTable.findMany({
      where: {
        id,
      },
    });
    if (results.length === 0) {
      return c.json({ error: "Invalid id" }, 400);
    }

    await prisma.todoTable.delete({
      where: {
        id,
      },
    });
    return c.json({
      msg: `Delete successfully`,
      data: { id },
    });
  } catch (error) {
    console.error("Error deleting todo:", error);
    return c.json({ error: "Failed to delete todo" }, 500);
  }
});

export default app;