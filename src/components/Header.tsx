"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Search, User, Menu, X } from "lucide-react";
import CartIcon from "./CartIcon";
import styles from "./components.module.css";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('user_id');
    if (token || userId) {
      setIsLoggedIn(true);
    }
  }, []);

  // Close menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setIsMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header className={styles.header}>
      <div className={`container ${styles.headerContainer}`}>
        <div className={styles.logo}>
          <Link href="/">
            <img src="/logo.png" alt="Punyam Store" />
          </Link>
        </div>

        <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}>
          <ul>
            <li><Link href="/" onClick={() => setIsMenuOpen(false)}>Home</Link></li>
            <li><Link href="/about" onClick={() => setIsMenuOpen(false)}>About</Link></li>
            <li><Link href="/services" onClick={() => setIsMenuOpen(false)}>Services</Link></li>
            <li><Link href="/products" onClick={() => setIsMenuOpen(false)}>Products</Link></li>
            
            <li className={styles.dropdown}>
              <span className={styles.dropdownToggle}>Astrology ▾</span>
              <ul className={styles.dropdownMenu}>
                <li><Link href="/astrology/instant-report" onClick={() => setIsMenuOpen(false)}>Instant Astro Report</Link></li>
                <li><Link href="/consultation" onClick={() => setIsMenuOpen(false)}>Book Consultation</Link></li>
                {isLoggedIn && (
                  <li><Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>My Dashboard</Link></li>
                )}
              </ul>
            </li>
            
            <li><Link href="/contact" onClick={() => setIsMenuOpen(false)}>Contact</Link></li>
          </ul>
        </nav>

        <div className={styles.actions}>
          <div className={styles.headerIcons}>
            <button className={styles.desktopOnly} aria-label="Search"><Search size={20} /></button>
            <Link href={isLoggedIn ? "/dashboard" : "/login"} className={styles.desktopOnly} aria-label="Account" style={{ color: 'inherit' }}><User size={20} /></Link>
            <CartIcon />
          </div>
          {isLoggedIn ? (
            <button 
              className={`btn btn-primary ${styles.authBtn}`}
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user_id');
                setIsLoggedIn(false);
                window.location.href = '/';
              }}
            >
              Logout
            </button>
          ) : (
            <Link href="/login" className={`btn btn-primary ${styles.authBtn}`}>
              <span className={styles.labelLong}>Login / Register</span>
              <span className={styles.labelShort}>Login</span>
            </Link>
          )}
          <button 
            className={styles.menuToggle} 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
}
