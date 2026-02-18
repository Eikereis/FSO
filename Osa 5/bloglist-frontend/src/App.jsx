import { useState, useEffect } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'
import './index.css'
import LoginForm from './components/loginform'
import BlogForm from './components/blogForm'
const App = () => {
  const [blogs, setBlogs] = useState([])
  const [errorMessage, setErrorMessage] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [loginVisible, setLoginVisible] = useState(true)
  const [blogFormVisible, setBlogFormVisible] = useState(true)


  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs( blogs )
    )
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])


  const Blog = ({ blog } ) => {
    const blogStyle = { paddingTop: 10,
      paddingLeft: 2,
      border: 'solid',
      borderWidth: 1,
      marginBottom: 5
    }
    const [blogFormVisible, setBlogFormVisible] = useState(false)

    return (
      <div style={blogStyle}>
        {blog.title} {blog.author}
        <div style={{ display: blogFormVisible ? '' : 'none' }}>
          <div>{blog.url}</div>
          <div>likes {blog.likes} <button name="like" onClick={() => handleLikes(blog)}>like</button></div>
          <div>added by {blog.user ? blog.user.name : 'unknown user'}</div>
        </div>
        <div>
          <button name="view" onClick={() => setBlogFormVisible(!blogFormVisible)}>{blogFormVisible ? 'hide' : 'view'}</button>
        </div>
        <div>
          {user && blog.user && user.username === blog.user.username ?
            <button name="remove"onClick={() => deleteBlog(blog)}>remove</button>
            : null
          }
        </div>
      </div>
    )
  }


  const Notification = ({ message }) => {
    if (message === null) {
      return null
    }
    return (
      <div className={message.includes('error') ? 'error' : 'errorless'}>{message}</div>
    )
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const user = await loginService.login({
        username, password,
      })


      window.localStorage.setItem('loggedBlogappUser', JSON.stringify(user))
      setUser(user)
      blogService.setToken(user.token)
      setUsername('')
      setPassword('')
    } catch (exception) {
      setErrorMessage('wrong credentials', exception)
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  const handleLikes = async (blog) => {
    try {
      const updatedBlog = await blogService.update(blog.id, { likes: blog.likes + 1 })
      const blogWithUser = { ...updatedBlog, user: blog.user }
      setBlogs(blogs.map(b => b.id === blog.id ? blogWithUser : b))
    } catch (exception) {
      setErrorMessage('error updating likes', exception)
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  const handleBlogCreate = async (blog) => {
    try {
      const createdBlog = await blogService.create(blog)
      // Add the current user to the blog object
      const blogWithUser = { ...createdBlog, user }
      setBlogs(blogs.concat(blogWithUser))
      setErrorMessage(`a new blog ${createdBlog.title} by ${createdBlog.author} added`)
      setTimeout(() => {
        setErrorMessage(null)
      } , 5000)
    }
    catch (exception) {
      setErrorMessage('error creating blog', exception)
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  const loginForm = () => {
    const hideWhenVisible = { display: loginVisible ? 'none' : '' }
    const showWhenVisible = { display: loginVisible ? '' : 'none' }
    return (
      <div>
        <div style={hideWhenVisible}>
          <button onClick={() => setLoginVisible(true)}>login</button>
        </div>
        <div style={showWhenVisible}>
          <LoginForm
            handleSubmit={handleLogin}
            handleUsernameChange={({ target }) => setUsername(target.value)}
            handlePasswordChange={({ target }) => setPassword(target.value)}
            username={username}
            password={password}
          />
        </div>
      </div>
    )
  }

  const blogForm = () => {
    const hideWhenVisible = { display: blogFormVisible ? 'none' : '' }
    const showWhenVisible = { display: blogFormVisible ? '' : 'none' }
    return (
      <div>
        <div style={hideWhenVisible}>
          <button onClick={() => setBlogFormVisible(true)}>new blog</button>
        </div>
        <div style={showWhenVisible}>
          <BlogForm createBlog={handleBlogCreate} />
          <button onClick={() => setBlogFormVisible(false)}>cancel</button>
        </div>
      </div>
    )
  }

  const deleteBlog = async (blog) => {
    try {
      window.confirm(`Remove blog ${blog.title} by ${blog.author}?`)
      await blogService.remove(blog.id)
      setBlogs(blogs.filter(b => b.id !== blog.id))
    } catch (exception) {
      setErrorMessage('error deleting blog', exception)
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  const BlogSort = (blogs) => {
    return blogs.sort((a, b) => b.likes - a.likes)
  }
  const handleLogout = () => {
    setUser(null)
    window.localStorage.removeItem('loggedBlogappUser')
    blogService.setToken(null)
    setUsername('')
    setPassword('')
  }

  if (user === null) {
    return (
      <div>
        <Notification message={errorMessage} />
        {loginForm()}
      </div>
    )
  }
  return (
    <div>
      <h2>blogs</h2>
      <Notification message={errorMessage} />
      <p>{user.name} logged in
        <button name="logout" onClick={handleLogout}>logout</button>
      </p>
      {blogForm()}
      <br></br>

      {BlogSort(blogs).map(blog =>
        <Blog key={blog.id} blog={blog} />
      )}
    </div>
  )
}

export default App