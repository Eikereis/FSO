const { test, expect, beforeEach, describe } = require('@playwright/test')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    // empty the db
    await request.post('http://localhost:3001/api/testing/reset')

    // create a test user
    await request.post('http://localhost:3001/api/users', {
      data: {
        name: 'Test User',
        username: 'testuser',
        password: 'testpassword'
      }
    })
    await request.post('http://localhost:3001/api/users', {
      data: {
        name: 'Test User 2',
        username: 'testuser2',
        password: 'testpassword2'
      }
    })

    await page.goto('http://localhost:5173')
  })

  test('Login form is shown', async ({ page }) => {
    await expect(page.getByText('username:')).toBeVisible()
    await expect(page.getByText('password:')).toBeVisible()
    await expect(page.getByRole('button', { name: 'login' })).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await page.fill('input[name="username"]', 'testuser')
      await page.fill('input[name="password"]', 'testpassword')
      await page.click('button[type="submit"]')
      await expect(page.getByText('Test User logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await page.fill('input[name="username"]', 'testuser')
      await page.fill('input[name="password"]', 'wrongpassword')
      await page.click('button[type="submit"]')
      await expect(page.getByText('wrong credentials')).toBeVisible()
    })
  })
  describe('When logged in', () => {
    test('a blog can be created', async ({ page }) => {
      await page.fill('input[name="username"]', 'testuser')
      await page.fill('input[name="password"]', 'testpassword')
      await page.click('button[type="submit"]')
      await expect(page.getByText('Test User logged in')).toBeVisible()

      await page.click('button[type="button"]')
      await page.fill('input[name="Title"]', 'Test Blog')
      await page.fill('input[name="Author"]', 'Test Author')
      await page.fill('input[name="Url"]', 'https://testblog.com')
      await page.click('button[type="submit"]')

      await expect(page.getByText('Test Blog Test Author')).toBeVisible()
    })
    test('a blog can be liked', async ({ page }) => {
      await page.fill('input[name="username"]', 'testuser')
      await page.fill('input[name="password"]', 'testpassword')
      await page.click('button[type="submit"]')
      await expect(page.getByText('Test User logged in')).toBeVisible()

      await page.click('button[type="button"]')
      await page.fill('input[name="Title"]', 'Test Blog')
      await page.fill('input[name="Author"]', 'Test Author')
      await page.fill('input[name="Url"]', 'https://testblog.com')
      await page.click('button[type="submit"]')

      await expect(page.getByText('Test Blog Test Author')).toBeVisible()

      await page.click('button[name="view"]')
      await page.click('button[name="like"]')
      await expect(page.getByText('Test Blog Test Author')).toContainText('1 like')
    })
    test('creator of blog can delete', async ({ page }) => {
      await page.fill('input[name="username"]', 'testuser')
      await page.fill('input[name="password"]', 'testpassword')
      await page.click('button[type="submit"]')
      await expect(page.getByText('Test User logged in')).toBeVisible()

      await page.click('button[type="button"]')
      await page.fill('input[name="Title"]', 'Test Blog')
      await page.fill('input[name="Author"]', 'Test Author')
      await page.fill('input[name="Url"]', 'https://testblog.com')
      await page.click('button[type="submit"]')

      await expect(page.getByText('Test Blog Test Author')).toBeVisible()

      await page.click('button[name="view"]')
      await page.click('button[name="remove"]')
      await expect(page.getByText('Test Blog Test Author')).not.toBeVisible()
    })
    test('only the creator can see the delete button', async ({ page }) => {
      await page.fill('input[name="username"]', 'testuser')
      await page.fill('input[name="password"]', 'testpassword')
      await page.click('button[type="submit"]')
      await expect(page.getByText('Test User logged in')).toBeVisible()

      await page.click('button[type="button"]')
      await page.fill('input[name="Title"]', 'Test Blog')
      await page.fill('input[name="Author"]', 'Test Author')
      await page.fill('input[name="Url"]', 'https://testblog.com')
      await page.click('button[type="submit"]')

      await expect(page.getByText('Test Blog Test Author')).toBeVisible()
      await expect(page.getByRole('button', { name: 'remove' })).toBeVisible()
      await page.click('button[name="logout"]')
      await expect(page.getByText('Test User logged in')).not.toBeVisible()
      await page.fill('input[name="username"]', 'testuser2')
      await page.fill('input[name="password"]', 'testpassword2')
      await page.click('button[type="submit"]')
      await expect(page.getByText('Test User 2 logged in')).toBeVisible()
      await expect(page.getByText('Test Blog Test Author')).toBeVisible()
      await expect(page.getByRole('button', { name: 'remove' })).not.toBeVisible()
    })
  })

  describe('Blogs are ordered by likes', () => {
    test('blogs are sorted by likes in descending order', async ({ page }) => {
      await page.fill('input[name="username"]', 'testuser')
      await page.fill('input[name="password"]', 'testpassword')
      await page.click('button[type="submit"]')
      await expect(page.getByText('Test User logged in')).toBeVisible()

      await page.click('button[type="button"]')
      await page.fill('input[name="Title"]', 'Test Blog 1')
      await page.fill('input[name="Author"]', 'Test Author 1')
      await page.fill('input[name="Url"]', 'https://testblog1.com')
      await page.click('button[type="submit"]')

      await expect(page.getByText('Test Blog 1 Test Author 1')).toBeVisible()

      await page.click('button[type="button"]')
      await page.fill('input[name="Title"]', 'Test Blog 2')
      await page.fill('input[name="Author"]', 'Test Author 2')
      await page.fill('input[name="Url"]', 'https://testblog2.com')
      await page.click('button[type="submit"]')

      await expect(page.getByText('Test Blog 2 Test Author 2')).toBeVisible()

      await page.click('button[name="view"]')
      await page.click('button[name="like"]')
      await expect(page.getByText('Test Blog 1 Test Author 1')).toContainText('1 like')
      await expect(page.getByText('Test Blog 2 Test Author 2')).toContainText('0 like')

      const blogElements = await page.$$('article')
      const blogLikes = await Promise.all(blogElements.map(async (blog) => {
        const likesText = await blog.$eval('.likes', el => el.textContent)
        return parseInt(likesText.split(' ')[1])
      }))
      expect(blogLikes).toEqual(blogLikes.sort((a, b) => b - a))
    })
  })
})
