import React from 'react';
import styles from './PageHero.module.css';

interface PageHeroProps {
  title: string;
  subtitle: string;
  meta?: string;
  steps?: Array<{ label: string; active?: boolean }>;
}

export default function PageHero({ title, subtitle, meta, steps }: PageHeroProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.heroTitleRow}>
        <div className={styles.heroTitle}>{title}</div>
        <div className={styles.heroSubtitle}>{subtitle}</div>
      </div>
      {meta && <div className={styles.heroMeta}>{meta}</div>}
      {steps && steps.length > 0 && (
        <div className={styles.heroSteps}>
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`${styles.stepPill} ${step.active ? styles.stepPillActive : ''}`}
            >
              {step.label}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

