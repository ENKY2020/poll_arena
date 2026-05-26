import './AppLoader.css'

function AppLoader({ message = 'Preparing the arena for you...' }) {
  return (
    <div className="app-loader">
      <div className="loader-card">
        <img src="/pollarena1.jpeg" alt="Poll Arena" />

        <h3>Poll Arena</h3>
        <p>{message}</p>

        <div className="loader-bar">
          <div className="loader-fill"></div>
        </div>
      </div>
    </div>
  )
}

export default AppLoader