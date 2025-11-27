import React from 'react';
import styles from './ContactSection.module.css';

export default function ContactSection() {
  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <div>
          <div className={styles.sectionTitle}>Contact details</div>
          <div className={styles.sectionSubtitle}>
            We'll send your generated cats and CatBot lore here.
          </div>
        </div>
      </div>
      <div className={styles.fieldGroup}>
        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <div className={styles.fieldLabel}>Email for cat delivery</div>
            <div className={styles.fieldInput}>
              <div className={styles.fieldPlaceholder}>you@example.com</div>
            </div>
          </div>
        </div>
        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <div className={styles.fieldLabel}>Full name</div>
            <div className={styles.fieldInput}>
              <div className={styles.fieldPlaceholder}>
                Luna "Chief Cat Herder" Vega
              </div>
            </div>
          </div>
        </div>
        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <div className={styles.fieldLabel}>CatBot account</div>
            <div className={styles.fieldInput}>
              <div className={styles.fieldPlaceholder}>
                Continue as guest or sign in
              </div>
            </div>
            <div className={styles.fieldTagRow}>
              <div className={styles.fieldTag}>Guest checkout</div>
              <div className={styles.fieldTag}>Sign in for saved cats</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

