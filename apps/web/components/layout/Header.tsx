'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Header.module.css';
import CartButton from '../cart/CartButton';

export default function Header() {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(path);
  };

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.headerLeft}>
        <div className={styles.logoMark}>🐾</div>
        <div>Custom Cat Co.</div>
      </Link>
      <nav className={styles.headerCenter}>
        <Link 
          href="/" 
          className={`${styles.navLink} ${isActive('/') ? styles.navLinkActive : ''}`}
        >
          Cat‑alog
        </Link>
        <Link 
          href="/catbot" 
          className={`${styles.navLink} ${isActive('/catbot') ? styles.navLinkActive : ''}`}
        >
          CatBot
        </Link>
        <Link 
          href="/faq" 
          className={`${styles.navLink} ${isActive('/faq') ? styles.navLinkActive : ''}`}
        >
          FAQ
        </Link>
      </nav>
      <div className={styles.headerRight}>
        <div className={styles.authLink}>Log in / Sign up</div>
        <CartButton />
      </div>
    </header>
  );
}

