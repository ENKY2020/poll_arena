import HeroSection from '../components/home/HeroSection'
import PollSection from '../components/home/PollSection'

function Home() {
  return (
    <>
      <HeroSection />

      <section className="home-intelligence-strip">
        <div>
          <span>Poll Arena Intelligence</span>
          <h2>From votes to insight.</h2>
          <p>
            Poll Arena turns public participation into live intelligence —
            helping people, organizations, and sponsors understand what the public is thinking.
          </p>
        </div>

        <div className="home-intelligence-points">
          <strong>Live polls</strong>
          <strong>Public sentiment</strong>
          <strong>Trending categories</strong>
          <strong>Sponsor stories</strong>
        </div>
      </section>

      <PollSection />
    </>
  )
}

export default Home