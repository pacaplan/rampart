import React from 'react';
import styles from './SidePanel.module.css';
import Button from '../ui/Button';

export default function SidePanel() {
  return (
    <aside className={styles.sidePanel}>
      <div className={styles.sideSection}>
        <div className={styles.sideLabel}>Not sure where to start?</div>
        <div className={styles.sideQuizCard}>
          <div className={styles.sideQuizTitle}>Help me find my ideal cat</div>
          <div className={styles.sideQuizText}>
            Answer a few delightfully unnecessary questions and we'll have CatBot sketch out a custom (fictional) feline just for you.
          </div>
          <Button variant="secondary" className={styles.sideQuizButton}>
            Start Cat Personality Quiz
          </Button>
        </div>
      </div>
      <div className={styles.sideSection}>
        <div className={styles.sideLabel}>Guests vs registered humans</div>
        <div className={styles.sideText}>
          Guests can browse, daydream, and fill a pretend cart. Registered users can also save favorites and unlock the full CatBot builder to craft bespoke imaginary cats.
        </div>
        <div className={styles.sideFooterNote}>
          No emails to real shelters, no surprise deliveries — only vibes and pixels.
        </div>
      </div>
    </aside>
  );
}

