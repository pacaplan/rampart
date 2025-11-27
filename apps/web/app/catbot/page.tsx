import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PageHero from '@/components/layout/PageHero';
import styles from './page.module.css';

export default function CatBotPage() {
  return (
    <div className={styles.page}>
      <div className={styles.pageInner}>
        <Header />
        <PageHero
          title="CatBot — Coming Soon"
          subtitle="The custom cat builder flow will be implemented here. For now, this is a placeholder page."
          meta="This page demonstrates navigation routing. The actual CatBot functionality will be added in a future implementation."
        />
        <main className={styles.content}>
          <p>CatBot functionality coming soon...</p>
        </main>
        <Footer />
      </div>
    </div>
  );
}

