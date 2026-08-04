import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo-wrap">
            <img src="/img/logo/docolco-logo-removebg-preview.png" alt="Docolco LLC" height="92" />
          </div>
          <p className="footer-tagline">Quality products for American businesses.</p>
          <div className="footer-social">
            <a href="https://www.instagram.com/llcdocolco/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
            </a>
            <a href="https://www.facebook.com/profile.php?id=61592952594072" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
          </div>
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
