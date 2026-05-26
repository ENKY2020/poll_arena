import '../styles/about.css'

function AboutUs() {
  const expertise = [
    [
      '📊',
      'Public Opinion & Polling',
      'Electoral polling, citizen feedback studies, public sentiment tracking, and perception audits.',
    ],
    [
      '🏛️',
      'Governance & Policy Research',
      'Policy analysis, governance diagnostics, institutional research, and stakeholder mapping.',
    ],
    [
      '📈',
      'Market Intelligence',
      'Consumer insights, competitor intelligence, market entry studies, and brand tracking.',
    ],
    [
      '📣',
      'Strategic Communications & PR',
      'Communication strategy, reputation management, media positioning, and stakeholder engagement.',
    ],
    [
      '🚀',
      'Startup Growth & Investor Linkages',
      'Growth advisory, market validation, investor readiness, and partnership facilitation.',
    ],
  ]

  const socialLinks = [
    {
      label: 'Facebook',
      icon: 'f',
      url: 'https://www.facebook.com/share/18fuPxrb8P/',
    },
    {
      label: 'X',
      icon: '𝕏',
      url: 'https://x.com/i/status/2037181949349924944',
    },
    {
      label: 'TikTok',
      icon: '♪',
      url: 'https://www.tiktok.com/t/ZTknS1mT7/',
    },
    {
      label: 'Instagram',
      icon: '◎',
      url: 'https://www.instagram.com/p/DWWgz2Agmar/?igsh=MXJ2cWR5aDYxaWlmcg==',
    },
  ]

  return (
    <main className="about-page">
      <div className="about-container">
        <section className="about-main-card" id="about">
          <div className="about-hero">
            <div className="about-text">
              <p className="about-kicker">
                Global Polling, Research & Strategic Communications
              </p>

              <h1>About Us</h1>

             <p>
  <strong>Poll Arena International</strong> is a global polling,
  research, market intelligence, and strategic advisory firm
  registered in the United States and incorporated in Kenya.
  Headquartered in Dubai, with offices in the United States and
  Kenya, and a technology engineering team based in the San
  Francisco Bay Area, California, we serve clients across global
  and emerging markets with decision-grade intelligence, market
  foresight, and strategic advisory support.
</p>

<p>
  We partner with governments, multinational corporations,
  development institutions, political organizations, investors,
  startups, and international agencies to generate the insights
  that shape policy, strengthen market positioning, unlock
  investment opportunities, and accelerate sustainable growth.
</p>

<p>
  Our firm combines rigorous research methodology with advanced
  technology, global standards, and deep local market intelligence.
  This unique blend enables us to deliver evidence-based insights
  that are not only credible and precise, but commercially relevant
  and immediately actionable.
</p>

<p>
  With our Silicon Valley–anchored engineering capability, Poll
  Arena International integrates modern data systems, analytical
  innovation, and scalable research infrastructure into every
  engagement. This allows us to move beyond traditional research
  delivery toward real-time intelligence, sharper market
  interpretation, and strategic decision support tailored for
  rapidly changing environments.
</p>

<p>
  At Poll Arena International, we believe data should not simply
  inform decisions — it should create competitive advantage. Our
  multidisciplinary teams design and execute high-impact
  quantitative and qualitative studies, stakeholder intelligence
  programs, perception analytics, market validation exercises, and
  strategic advisory engagements that help clients understand
  people, markets, risk, and opportunity with greater confidence.
</p>
            </div>

            <div className="about-brand-card">
              <div className="brand-logo-panel">
                <img src="/pollarena.png" alt="Poll Arena International" />
              </div>

              <h2>Poll Arena International</h2>
              <p>Public opinion. Market signals. Strategic insight.</p>
            </div>
          </div>

          <section className="expertise-card" id="expertise">
            <h2>Our Core Areas of Expertise</h2>

            <div className="expertise-grid">
              {expertise.map(([icon, title, text]) => (
                <article className="expertise-item" key={title}>
                  <div className="expertise-icon">{icon}</div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </section>

          <div className="mission-vision-grid">
            <section className="mini-card mission-card" id="mission">
              <div className="mini-icon">🎯</div>

              <div>
                <h2>Our Mission</h2>
<p>
  To deliver trusted research, market intelligence, and strategic
  advisory solutions that enable organizations to make confident
  decisions, create measurable impact, and achieve long-term
  sustainable growth.
</p>
              </div>
            </section>

            <section className="mini-card vision-card" id="vision">
              <div className="mini-icon">👁️</div>

              <div>
                <h2>Our Vision</h2>
<p>
  To be a globally respected intelligence and advisory firm,
  recognized for credibility, innovation, and measurable impact
  across markets.
</p>
              </div>
            </section>
          </div>
        </section>

        <aside className="about-sidebar">
          <section className="side-card" id="presence">
            <h2>🌐 Our Presence</h2>

            <h3>Kenya Offices</h3>
            <p>Pejos Towers</p>
            <p>West Park Suites</p>

            <h3>Dubai Main Office</h3>
            <p>Dubai Mall</p>

            <h3>USA Office</h3>
            <p>East 33rd Street</p>
          </section>

          <section className="side-card" id="contact">
            <h2>📞 Contact Us</h2>

            <p>
              <strong>Dubai:</strong>{' '}
              <a
                href="https://wa.me/971529646311"
                target="_blank"
                rel="noopener noreferrer"
              >
                +971 52 964 6311
              </a>
            </p>

            <p>
              <strong>USA:</strong>{' '}
              <a
                href="https://wa.me/16024222177"
                target="_blank"
                rel="noopener noreferrer"
              >
                +1 602 422 2177
              </a>
            </p>

            <p>
              <strong>Kenya:</strong>{' '}
              <a
                href="https://wa.me/254736933308"
                target="_blank"
                rel="noopener noreferrer"
              >
                +254 736 933 308
              </a>
            </p>

            <p>
              <strong>Email:</strong>{' '}
              <a href="mailto:pollarenainternational@gmail.com">
                pollarenainternational@gmail.com
              </a>
            </p>

            <p>
              <strong>Website:</strong>{' '}
              <a
                href="https://www.pollarenainternational.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                www.pollarenainternational.com
              </a>
            </p>
          </section>

          <section className="side-card" id="socials">
            <h2>Follow Us</h2>

            <div className="social-row">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  title={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>

            <p className="handle">@pollarenainternational</p>
          </section>
        </aside>
      </div>
    </main>
  )
}

export default AboutUs