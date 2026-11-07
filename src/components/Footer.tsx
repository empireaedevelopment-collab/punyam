import Link from "next/link";
import { FaInstagram, FaYoutube, FaFacebook, FaWhatsapp, FaTelegram } from "react-icons/fa";
import styles from "./components.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <img src="/logo.png" alt="Punyam Store" />
            <p>Your trusted companion on the path of spirituality, culture and wisdom.</p>
          </div>
          <div className={styles.footerLinks}>
            <h4>QUICK LINKS</h4>
            <ul>
              <li><Link href="/shop">Shop</Link></li>
              <li><Link href="/astrology">Astrology Report</Link></li>
              <li><Link href="/consultation">Consultation</Link></li>
              <li><Link href="/cart">Cart</Link></li>
              <li><Link href="/checkout">Checkout</Link></li>
              <li><Link href="/dashboard">My Dashboard</Link></li>
            </ul>
          </div>
          <div className={styles.footerLinks}>
            <h4>CUSTOMER CARE</h4>
            <ul>
              <li><Link href="/contact">Contact Us</Link></li>
            </ul>
          </div>
          <div className={styles.footerContact}>
            <h4>CONTACT US</h4>
            <p>📞 +91 999 999 9999</p>
            <p>✉️ support@punyam.store</p>
            <p>📍 Kerala, India</p>
            <div className={styles.footerSocial}>
              <a href="#"><FaInstagram size={18} /></a>
              <a href="#"><FaYoutube size={18} /></a>
              <a href="#"><FaFacebook size={18} /></a>
              <a href="#"><FaWhatsapp size={18} /></a>
              <a href="#"><FaTelegram size={18} /></a>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>© 2026 empireae. All Rights Reserved.</p>
          <p>Designed with ❤️ for a Spiritual World</p>
        </div>
      </div>
    </footer>
  );
}
