import Navbar from './Navbar'
import Footer from './Footer'

function MainLayout({ children }) {
  return (
    <div className="app">
      <Navbar />
      <div className="page-content">
        {children}
      </div>
      <Footer />
    </div>
  )
}

export default MainLayout