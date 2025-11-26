import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/catalog/Hero';
import CatGrid from '@/components/catalog/CatGrid';
import FilterPills from '@/components/catalog/FilterPills';
import SidePanel from '@/components/catalog/SidePanel';
import { cats } from '@/data/cats';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.page}>
      <div className={styles.pageInner}>
        <Header />
        <Hero />
        <main className={styles.content}>
          <div className={styles.contentMain}>
            <div className={styles.contentHeaderRow}>
              <span>Featured pre‑made cats</span>
              <span>Showing {cats.length} whimsical prototypes</span>
            </div>
            <FilterPills />
            <CatGrid cats={cats} />
          </div>
          <SidePanel />
        </main>
        <Footer />
      </div>
    </div>
  );
}

