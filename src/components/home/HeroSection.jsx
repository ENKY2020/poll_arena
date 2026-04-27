import { Link } from 'react-router-dom'
import StatsCard from './StatsCard'

function HeroSection() {
  const scrollToPolls = () => {
    const pollSection = document.getElementById('live-polls')
    if (pollSection) {
      pollSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <main className="hero">
      <section className="hero-left">
        <p className="hero-tag">
          Global Polling, Research & Strategic Communications
        </p>

        <h1>Real-Time Public Opinion. Powered by You.</h1>

        <p className="hero-text">
          Vote on live issues, track public sentiment, and explore what people
          really think across politics, governance, economy, and society.
        </p>

        <div className="hero-buttons">
          <button
            type="button"
            className="btn btn-primary"
            onClick={scrollToPolls}
          >
            Start Voting
          </button>

          <Link to="/live-results" className="btn btn-secondary">
            View Live Results
          </Link>
        </div>
      </section>

      <aside className="hero-right">
        <StatsCard />
      </aside>
    </main>
  )
}

export default HeroSection