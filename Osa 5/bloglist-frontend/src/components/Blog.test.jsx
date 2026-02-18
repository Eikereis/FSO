import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'
import BlogForm from './blogForm'

test('renders content', () => {
  const blog = {
    title: 'Component testing is done with react-testing-library',
    author: 'Jane Doe',
    likes: 5
  }

  render(<Blog blog={blog} />)

  const element = screen.getByText('Component testing is done with react-testing-library Jane Doe')

  screen.debug(element)

  expect(element).toBeDefined()
})
describe('Blog component', () => {
  test('renders title and author', () => {
    const blog = {
      title: 'Testing React Components',
      author: 'John Smith',
      likes: 10
    }
    render(<Blog blog={blog} />)
    const element = screen.getByText('Testing React Components John Smith')
    expect(element).toBeDefined()
  })
  test('does not render likes by default', () => {
    const blog = {
      title: 'Testing React Components',
      author: 'John Smitch',
      likes: 10
    }
    render(<Blog blog={blog} />)
    const likesElement = screen.queryByText('likes 10')
    expect(likesElement).toBeNull()
  })

  test('calls handleLike twice when like button is clicked twice', async () => {
    const blog = {
      title: 'Testing React Components',
      author: 'John Smith',
      url: 'http://example.com',
      likes: 10
    }
    const mockHandler = vi.fn()

    render(<Blog blog={blog} handleLike={mockHandler}/>)
    const user = userEvent.setup()
    const viewButton = screen.getByText('view')
    await user.click(viewButton)
    const likeButton = screen.getByText('like')
    await user.click(likeButton)
    await user.click(likeButton)
    expect(mockHandler).toHaveBeenCalledTimes(2)
  })

  test('shows url and likes when view button is clicked', async () => {
    const blog = {
      title: 'Testing React Components',
      author: 'John Smith',
      url: 'http://example.com',
      likes: 10
    }
    const mockHandler = vi.fn()

    render(<Blog blog={blog} handleLike={mockHandler}/>)
    const user = userEvent.setup()
    const viewButton = screen.getByText('view')
    await user.click(viewButton)
    const urlElement = screen.getByText('http://example.com')
    const likesElement = screen.getByText('likes 10')
    expect(urlElement).toBeDefined()
    expect(likesElement).toBeDefined()
  })
})


test('new blog form test', async () => {
  const mockHandler = vi.fn()
  const user = userEvent.setup()

  render(<BlogForm createBlog={mockHandler}/>)
  await user.click(screen.getByText('create new blog'))
  const titleInput = screen.getByLabelText('title:')
  const authorInput = screen.getByLabelText('author:')
  const urlInput = screen.getByLabelText('url:')
  const createButton = screen.getByText('create')

  await user.type(titleInput, 'Testing React Components')
  await user.type(authorInput, 'John Smith')
  await user.type(urlInput, 'http://example.com')
  await user.click(createButton)
  expect(mockHandler).toHaveBeenCalledTimes(1)
  expect(mockHandler).toHaveBeenCalledWith({
    title: 'Testing React Components',
    author: 'John Smith',
    url: 'http://example.com'
  })
})