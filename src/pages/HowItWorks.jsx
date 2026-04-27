function HowItWorks() {
  return (
    <section className="poll-section">
      <div className="section-header">
        <h2>How It Works</h2>
        <span>Simple, fair and real-time</span>
      </div>

      <div className="poll-grid">
        <div className="poll-card">
          <h3>1. Open a Poll</h3>
          <p className="hero-text">Users choose a live poll from politics, economy, governance or other topics.</p>
        </div>

        <div className="poll-card">
          <h3>2. Vote Once</h3>
          <p className="hero-text">Each user casts one vote and the system records it securely.</p>
        </div>

        <div className="poll-card">
          <h3>3. See Results Live</h3>
          <p className="hero-text">Percentages and totals update in real time as people continue voting.</p>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks