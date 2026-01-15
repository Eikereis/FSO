const assert = require('node:assert')
const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./list_helper')
const Blog = require('../models/blog')

const api = supertest(app)

describe('when there is initially some blogs saved', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
  })

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })
  
  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('a specific blog is within the returned blogs', async () => {
    const response = await api.get('/api/blogs')
    const titles = response.body.map(r => r.title)
    assert.ok(titles.includes('Go To Statement Considered Harmful'))
  })

  test('blog unique id is named id', async () => {
    const response = await api.get('/api/blogs')
    response.body.forEach(blog => {
      if (!blog.id) {
        throw new Error('Blog id property is not named id')
      }
    })
  })

describe('addition of a new blog', () => {
    test('a valid blog can be added', async () => {
      const newBlog = {
        title: "Very Cool Blog",
        author: "John Smith",
        url: "www.google.com",
        likes: 5
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)
        
      const response = await api.get('/api/blogs')
      assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)
      const titles = response.body.map(r => r.title) 
      assert.ok(titles.includes('Very Cool Blog'))
    })
    
    test('default like value is 0', async () => {
      const newBlog = {
        title: "Another Cool Blog",
        author: "Jane Doe",
        url: "www.fortnite.com"
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const response = await api.get('/api/blogs')
      const addedBlog = response.body.find(blog => blog.title === 'Another Cool Blog')
      assert.strictEqual(addedBlog.likes, 0)
    })

    test('titless blog is not added', async () => {
      const newBlog = {
        author: "Jane Doe",
        url: "www.fortnite.com",
        likes: 3
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)

      const response = await api.get('/api/blogs')
      assert.strictEqual(response.body.length, helper.initialBlogs.length)
    })


    test('urless blog is not added', async () => {
      const newBlog = {
        title: "Another Cool Blog",
        author: "Jane Doe",
        likes: 3
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)
        
      const response = await api.get('/api/blogs')
      assert.strictEqual(response.body.length, helper.initialBlogs.length)
    })

describe ('deletion of a blog', () => {
      test('succeeds with status code 204 if id is valid', async () => {
        const blogsAtStart = await api.get('/api/blogs')
        const blogToDelete = blogsAtStart.body[0]

        await api
          .delete(`/api/blogs/${blogToDelete.id}`)
          .expect(204)

        const blogsAtEnd = await api.get('/api/blogs')
        assert.strictEqual(blogsAtEnd.body.length, helper.initialBlogs.length - 1)

        const titles = blogsAtEnd.body.map(r => r.title)
        assert.ok(!titles.includes(blogToDelete.title))
      })
    })
  })
})

describe('updating a blog', () => {
  test('succeeds in updating likes of a blog', async () => {
    const blogsAtStart = await api.get('/api/blogs')
    const blogToUpdate = blogsAtStart.body[0]

    const updatedBlogData = {
      ...blogToUpdate,
      likes: blogToUpdate.likes + 1,
    } 
    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedBlogData)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.likes, blogToUpdate.likes + 1)
  })
})  

after(async () => {
    await mongoose.connection.close()
  })


