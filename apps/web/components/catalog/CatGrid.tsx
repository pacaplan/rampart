import React from 'react';
import CatCard, { CatCardProps } from './CatCard';
import styles from './CatGrid.module.css';

interface CatGridProps {
  cats: CatCardProps[];
}

export default function CatGrid({ cats }: CatGridProps) {
  return (
    <div className={styles.gridAndEmpty}>
      <div className={styles.catGrid}>
        {cats.map((cat, index) => (
          <CatCard key={index} {...cat} />
        ))}
      </div>
      <div className={styles.emptyState}>
        <span>
          If you don't see your dream cat here, it just means it hasn't been imagined yet. That's what CatBot is for.
        </span>
        <div className={styles.emptyStateCta}>
          Take the Cat Personality Quiz →
        </div>
      </div>
    </div>
  );
}

