import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo-wrap">
            <img src="/img/logo/docolco-logo-removebg-preview.png" alt="Docolco LLC" height="90" />
          </div>
          <p className="footer-tagline">Quality products for American businesses.</p>
        </div>

        <div className="footer-col">
          <h4>Products</h4>
          <ul>
            <li>Cleaning Supplies</li>
            <li>Packaging Materials</li>
            <li>Protection Gear</li>
            <li>Waste Solutions</li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Contact</h4>
          <ul>
            <li><a href="mailto:llcdocolco@gmail.com">llcdocolco@gmail.com</a></li>
            <li><a href="mailto:llcdocolco@gmail.com">llcdocolco@gmail.com</a></li>
            <li>United States</li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Legal</h4>
          <ul>
            <li><Link to="/privacy-policy">Privacy Policy</Link></li>
            <li><Link to="/terms-of-service">Terms of Service</Link></li>
            <li><Link to="/shipping-returns">Shipping &amp; Returns</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 Docolco LLC · All rights reserved · United States</p>
        <p className="footer-credit">Powered by <strong>SR.DEV</strong></p>
      </div>
    </footer>
  )
}
