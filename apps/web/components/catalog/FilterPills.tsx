import React from 'react';
import styles from './FilterPills.module.css';

export default function FilterPills() {
  const filters = ['All vibes', 'Cozy', 'Chaotic', 'Space‑themed'];

  return (
    <div className={styles.filterPills}>
      {filters.map((filter, index) => (
        <div key={index} className={styles.pill}>
          {filter}
        </div>
      ))}
    </div>
  );
}

