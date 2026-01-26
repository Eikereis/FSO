const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const { userExtractor } = require('../utils/middleware')



 
blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  
  response.json(blogs)
})

blogsRouter.post('/', userExtractor, async (request, response) => {
  if (!request.user) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const blog = new Blog({
    title: request.body.title,
    author: request.body.author,
    url: request.body.url,
    likes: request.body.likes,
    user: request.user.id
  })

  if (!blog.title || !blog.url) return response.status(400).end()

  if (!blog.likes) {
    blog.likes = 0
  }

  const result = await blog.save()
  request.user.blogs = request.user.blogs.concat(result._id)
  await request.user.save()
  response.status(201).json(result)
})

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
  if (!request.user) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const blog = await Blog.findById(request.params.id)
  if (!blog) {
    return response.status(404).json({ error: 'blog not found' })
  }

  if (blog.user.toString() !== request.user.id.toString()) {
    return response.status(401).json({ error: 'only the creator can delete a blog'})
  }
  
  await Blog.findByIdAndDelete(request.params.id) 
  response.status(204).end()  
}) 

blogsRouter.put('/:id', async (request, response) => {
  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    request.body,
    { new: true, runValidators: true, context: 'query' }
  )
  response.json(updatedBlog)
})





module.exports = blogsRouter