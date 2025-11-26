import React from 'react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerLinks}>
        <div className={styles.footerLink}>FAQ</div>
        <div className={styles.footerLink}>Is this real?</div>
        <div className={styles.footerLink}>View on GitHub</div>
        <div className={styles.footerLink}>Adoption resources</div>
      </div>
      <div className={styles.footerNote}>
        For actual cats, please visit local shelters and rescues. This Cat‑alog is 100% imaginary and 0% transactional.
      </div>
    </footer>
  );
}

