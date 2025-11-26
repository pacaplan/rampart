import React from 'react';
import styles from './Header.module.css';
import CartButton from '../cart/CartButton';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <div className={styles.logoMark}>🐾</div>
        <div>Custom Cat Co.</div>
      </div>
      <nav className={styles.headerCenter}>
        <div className={`${styles.navLink} ${styles.navLinkActive}`}>
          Cat‑alog
        </div>
        <div className={styles.navLink}>CatBot</div>
        <div className={styles.navLink}>FAQ</div>
      </nav>
      <div className={styles.headerRight}>
        <div className={styles.authLink}>Log in / Sign up</div>
        <CartButton />
      </div>
    </header>
  );
}

