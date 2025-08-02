import { PrismaClient } from '@prisma/client'
import { Hono } from 'hono'

const app = new Hono()
const prisma = new PrismaClient()

app.get('/', (c) => {
  return c.text('Hello Hono2!')
})

app.get('/members', async (c) => {
  const members = await prisma.memberProjectTable.findMany()
  return c.json(members)
})

export default {
  port: 3000,
  fetch: app.fetch,
}