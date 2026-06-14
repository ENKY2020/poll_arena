import { createBrowserRouter } from 'react-router-dom'

import Home from '../pages/Home'
import LiveResults from '../pages/LiveResults'
import Categories from '../pages/Categories'
import HowItWorks from '../pages/HowItWorks'
import NewsCenter from '../pages/NewsCenter'
import AboutUs from '../pages/AboutUs'
import Login from '../pages/Login'
import Signup from '../pages/Signup'
import Settings from '../pages/Settings'
import Admin from '../pages/Admin'
import BookTable from '../pages/BookTable'

const router = createBrowserRouter([
  { path: '/', element: <Home /> },

  // Poll routes
  { path: '/poll/:slug', element: <LiveResults /> },
  { path: '/live-results', element: <LiveResults /> },

  // Content
  { path: '/categories', element: <Categories /> },
  { path: '/news', element: <NewsCenter /> },
  { path: '/about-us', element: <AboutUs /> },
  { path: '/how-it-works', element: <HowItWorks /> },

  // User
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <Signup /> },
  { path: '/settings', element: <Settings /> },

  // Events
  { path: '/book-table', element: <BookTable /> },

  // Admin
  { path: '/admin', element: <Admin /> },
])

export default router