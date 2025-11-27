import React from 'react';
import Link from 'next/link';
import styles from './Hero.module.css';
import Button from '../ui/Button';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroTop}>
        <div className={styles.heroTitle}>Cat‑alog</div>
        <div className={styles.heroSubtitle}>
          Browse a completely fictional collection of pre‑made, AI‑imagined cats. Window‑shop, daydream, and discover the CatBot that helps you design your perfect (still imaginary) companion.
        </div>
      </div>
      <div className={styles.heroCtas}>
        <Button variant="primary">Browse Pre‑Made Cats</Button>
        <Link href="/catbot">
          <Button variant="secondary">
            Build Your Own with CatBot
          </Button>
        </Link>
      </div>
      <div className={styles.heroCtaNote}>
        Building custom cats requires an account. Guests can preview the CatBot flow from the CatBot tab.
      </div>
      <div className={styles.heroBanner}>
        This is not a real store. No actual cats are sold, shipped, cloned, or turned into quantum particles here.
      </div>
    </section>
  );
}

