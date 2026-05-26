import { useNavigate } from 'react-router-dom'

function NotFound() {
  const navigate = useNavigate()

  return (
    <div style={{
      display: 'grid',
      placeItems: 'center',
      height: '70vh',
      textAlign: 'center'
    }}>
      <div>
        <img src="/pollarena1.jpeg" alt="Poll Arena" style={{
          width: 90,
          borderRadius: '50%',
          marginBottom: 16
        }} />

        <h1 style={{ color: '#0b3d91' }}>404</h1>
        <h3>Oops! This page wandered off the arena.</h3>

        <p style={{ color: '#5f6f86', marginTop: 10 }}>
          Even public opinion couldn’t find this page.
        </p>

        <button
          className="btn btn-primary"
          style={{ marginTop: 18 }}
          onClick={() => navigate('/')}
        >
          Go Home
        </button>
      </div>
    </div>
  )
}

export default NotFound