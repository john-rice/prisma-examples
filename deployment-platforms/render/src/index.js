import express from 'express'
import bodyParser from 'body-parser'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const app = express()

app.use(bodyParser.json())
app.use(express.static('public'))

app.get(`/api`, async (req, res) => {
  res.json({ up: true })
})

app.post(`/api/user`, async (req, res) => {
  const result = await prisma.user.create({
    data: {
      ...req.body,
    },
  })
  res.json(result)
})

app.post(`/api/post`, async (req, res) => {
  const { title, content, authorEmail } = req.body
  const result = await prisma.post.create({
    data: {
      title,
      content,
      published: false,
      author: { connect: { email: authorEmail } },
    },
  })
  res.json(result)
})

app.put('/api/publish/:id', async (req, res) => {
  const { id } = req.params
  const post = await prisma.post.update({
    where: {
      id: parseInt(id),
    },
    data: { published: true },
  })
  res.json(post)
})

app.delete(`/api/post/:id`, async (req, res) => {
  const { id } = req.params
  const post = await prisma.post.delete({
    where: {
      id: parseInt(id),
    },
  })
  res.json(post)
})

app.get(`/api/post/:id`, async (req, res) => {
  const { id } = req.params
  const post = await prisma.post.findUnique({
    where: {
      id: parseInt(id),
    },
  })
  res.json(post)
})

app.get('/api/feed', async (req, res) => {
  const posts = await prisma.post.findMany({
    where: { published: true },
    include: { author: true },
  })
  res.json(posts)
})

app.get('/api/filterPosts', async (req, res) => {
  const { searchString } = req.query
  const draftPosts = await prisma.post.findMany({
    where: {
      OR: [
        {
          title: {
            contains: searchString,
          },
        },
        {
          content: {
            contains: searchString,
          },
        },
      ],
    },
  })
  res.json(draftPosts)
})

const PORT = process.env.PORT || 3000
const server = app.listen(PORT, () =>
  console.log(
    `🚀 Server ready at: http://localhost:${PORT}\n⭐️ See sample requests: https://github.com/prisma/prisma-examples/blob/latest/orm/express/README.md#using-the-rest-api`,
  ),
)

