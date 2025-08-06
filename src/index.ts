import { Hono } from 'hono'
import memberRouter from './routes/member'
import todoRouter from './routes/todo'
import announcementRouter from './routes/announcement'
import { readFile } from 'fs/promises'
import * as path from 'path'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono2!')
})

// Serve static files (รูปภาพที่อัปโหลด)
app.get('/uploads/*', async (c) => {
  const filePath = c.req.path.replace('/uploads/', '')
  const fullPath = path.join(process.cwd(), 'uploads', filePath)
  
  try {
    const file = await readFile(fullPath)
    const ext = path.extname(filePath).toLowerCase()
    
    let contentType = 'application/octet-stream'
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg'
    else if (ext === '.png') contentType = 'image/png'
    else if (ext === '.gif') contentType = 'image/gif'
    else if (ext === '.webp') contentType = 'image/webp'
    
    return new Response(file, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000'
      }
    })
  } catch (error) {
    return c.json({ error: 'File not found' }, 404)
  }
})

// /todo
app.route('/todo', todoRouter)

// /members
app.route('/members', memberRouter)

// /announcements
app.route('/announcements', announcementRouter)

export default {
  port: process.env.PORT || 3000,
  fetch: app.fetch,
}