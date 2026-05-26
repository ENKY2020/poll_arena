import { usePWAInstall } from '../context/PWAInstallContext'

function HowItWorks() {
  const { canInstall, isInstalled, installApp } = usePWAInstall()

  const handleInstallApp = async () => {
    const result = await installApp()

    if (!result?.success && result?.message) {
      console.info(result.message)
    }
  }

  const getInstallButtonText = () => {
    if (isInstalled) return 'Installed'
    if (canInstall) return '+ Add to Home Screen'
    return 'Install Available Soon'
  }

  const steps = [
    {
      number: '1',
      icon: '🗳️',
      title: 'Open a Poll',
      text: 'Choose a live poll from politics, economy, governance, business, sports or public issues.',
    },
    {
      number: '2',
      icon: '✅',
      title: 'Vote Once',
      text: 'Cast your vote securely. Poll Arena keeps voting fair, simple and transparent.',
    },
    {
      number: '3',
      icon: '📊',
      title: 'See Results Live',
      text: 'Track percentages, vote totals and public sentiment as results update in real time.',
    },
    {
      number: '4',
      icon: '📲',
      title: 'Install & Stay Connected',
      text: 'Add Poll Arena to your home screen and access public opinion anytime like a normal app.',
    },
  ]

  return (
    <section className="how-page">
      <div className="how-header">
        <div>
          <span>Simple • Fair • Real-time</span>
          <h1>How Poll Arena Works</h1>
          <p>
            Vote, follow live results, explore public intelligence and stay connected
            to the conversations shaping tomorrow.
          </p>
        </div>
      </div>

      <div className="how-steps-grid">
        {steps.map((step) => (
          <div className="how-step-card" key={step.number}>
            <div className="how-step-number">{step.number}</div>
            <div className="how-step-icon">{step.icon}</div>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </div>
        ))}
      </div>

      <div className="pwa-install-panel">
        <div className="pwa-phone-mock">
          <div className="pwa-phone-top"></div>

          <div className="pwa-phone-screen">
            <img
              src="/pollarena1.jpeg"
              alt="Poll Arena app logo"
              className="pwa-phone-logo"
            />
            <strong>Poll Arena</strong>
            <span>Real-Time Public Opinion</span>
          </div>
        </div>

        <div className="pwa-copy">
          <span>Poll Arena App</span>
          <h2>Install Poll Arena in one tap.</h2>
          <p>
            No app store needed. Add Poll Arena to your home screen for faster access,
            smoother voting and real-time updates.
          </p>

          <div className="pwa-benefits">
            <strong>⚡ Fast Access</strong>
            <strong>🔐 Secure</strong>
            <strong>📊 Live Results</strong>
            <strong>🌍 Always With You</strong>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary pwa-install-btn"
          onClick={handleInstallApp}
          disabled={isInstalled || !canInstall}
          title={
            isInstalled
              ? 'Poll Arena is already installed.'
              : canInstall
                ? 'Install Poll Arena on this device.'
                : 'Install will appear when your browser confirms the app is installable.'
          }
        >
          {getInstallButtonText()}
        </button>
      </div>

      <div className="how-trust-band">
        <div>
          <strong>🛡️ Secure & Fair Voting</strong>
          <p>Your vote is counted safely and transparently.</p>
        </div>

        <div>
          <strong>⚡ Live Results</strong>
          <p>See public opinion shift as votes come in.</p>
        </div>

        <div>
          <strong>🌍 Public Intelligence</strong>
          <p>Understand what people think across key issues.</p>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks