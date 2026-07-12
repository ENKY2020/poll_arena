import './App.css'
import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import BookTable from './pages/BookTable'
import MainLayout from './components/layout/MainLayout'
import AppLoader from './components/common/AppLoader'
import NotFound from './components/common/NotFound'

import Home from './pages/Home'
import LiveResults from './pages/LiveResults'
import Categories from './pages/Categories'
import HowItWorks from './pages/HowItWorks'
import NewsCenter from './pages/NewsCenter'
import AboutUs from './pages/AboutUs'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Settings from './pages/Settings'
import Admin from './pages/Admin'
import AuthCallback from './pages/AuthCallback'
import { LanguageProvider } from './context/LanguageContext'

import { trackTrafficSource } from './services/analyticService'

function TrafficSourceTracker() {
  useEffect(() => {
    const trackSource = async () => {
      try {
        const params = new URLSearchParams(window.location.search)

        const source = params.get('utm_source')
        const medium = params.get('utm_medium')
        const campaign = params.get('utm_campaign')
        const pollId = params.get('poll')
        const referrer = document.referrer || null

        if (!source && !medium && !campaign && !pollId && !referrer) return

        const trackingKey = `traffic_tracked_${window.location.pathname}_${window.location.search}`

        if (sessionStorage.getItem(trackingKey)) return

        await trackTrafficSource({
          pollId,
          source: source || 'direct',
          medium,
          campaign,
          referrer,
        })

        sessionStorage.setItem(trackingKey, 'true')
      } catch (error) {
        console.error('Traffic tracking failed:', error)
      }
    }

    trackSource()
  }, [])

  return null
}

function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1200)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <AppLoader message="Preparing the arena for you..." />
  }

return (
  <LanguageProvider>
    <BrowserRouter>
      <TrafficSourceTracker />

      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
         <Route path="/live-results" element={<LiveResults />} />
         <Route path="/poll/:slug" element={<LiveResults />} />
          <Route path="/book-table" element={<BookTable />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/news" element={<NewsCenter />} />
          <Route path="/news-center" element={<NewsCenter />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </MainLayout>
     </BrowserRouter>
  </LanguageProvider>
)

}

export default App