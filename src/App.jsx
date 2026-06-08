import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { CartProvider } from './hooks/useCart.jsx'
import Navbar from './components/layout/Navbar.jsx'
import Footer from './components/layout/Footer.jsx'
import WhatsAppFAB from './components/ui/WhatsAppFAB.jsx'
import Home from './pages/Home.jsx'
import PrivacyPolicy from './pages/PrivacyPolicy.jsx'
import TermsOfService from './pages/TermsOfService.jsx'
import ShippingReturns from './pages/ShippingReturns.jsx'

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/"                  element={<Home />} />
          <Route path="/privacy-policy"    element={<PrivacyPolicy />} />
          <Route path="/terms-of-service"  element={<TermsOfService />} />
          <Route path="/shipping-returns"  element={<ShippingReturns />} />
        </Routes>
        <Footer />
        <WhatsAppFAB />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 2500,
            style: {
              background: '#1A3FA8',
              color: '#fff',
              borderRadius: 0,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.9rem',
            },
          }}
        />
      </BrowserRouter>
    </CartProvider>
  )
}
