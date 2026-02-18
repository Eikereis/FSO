const LoginForm = ({ handleSubmit, handleUsernameChange, handlePasswordChange, username, password }) =>
{ return (
  <div>
    <header>Login to Application</header>
    <form onSubmit={handleSubmit}>
      <div>
        <label>username:</label>
        <input
          type="text"
          name="username"
          value={username}
          onChange={handleUsernameChange}
        />
      </div>
      <div>
        <label>password:</label>
        <input
          type="password"
          name="password"
          value={password}
          onChange={handlePasswordChange}
        />
      </div>
      <button type="submit">login</button>
    </form>
  </div>
)}


export default LoginForm