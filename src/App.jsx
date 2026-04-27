import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import MainLayout from './components/layout/MainLayout'

import Home from './pages/Home'
import LiveResults from './pages/LiveResults'
import Categories from './pages/Categories'
import HowItWorks from './pages/HowItWorks'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Settings from './pages/Settings'
import Admin from './pages/Admin'
import AuthCallback from './pages/AuthCallback'

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/live-results" element={<LiveResults />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  )
}

export default App
