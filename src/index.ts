import { Hono } from 'hono'
import memberRouter from './routes/member'
import todoRouter from './routes/todo'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono2!')
})

// /todo\
app.route('/todo', todoRouter)

// /members
app.route('/members', memberRouter)

export default {
  port: process.env.PORT || 3000,
  fetch: app.fetch,
}