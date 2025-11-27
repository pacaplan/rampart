import React from 'react';
import styles from './PaymentSection.module.css';

export default function PaymentSection() {
  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <div>
          <div className={styles.sectionTitle}>Payment</div>
          <div className={styles.sectionSubtitle}>
            This is the "convince the user" step in a real store. Here, it's just UI theatre.
          </div>
        </div>
      </div>
      <div className={styles.radioGroup}>
        <div className={`${styles.radioOption} ${styles.radioOptionSelected}`}>
          <div className={styles.radioDot}></div>
          <div className={styles.radioContent}>
            <div className={styles.radioLabel}>Imagination only (0.00 ¢)</div>
            <div className={styles.radioDescription}>
              No cards, no wallets, no risk. You'll still see what a payment step would feel like.
            </div>
          </div>
        </div>
        <div className={styles.radioOption}>
          <div className={styles.radioDot}></div>
          <div className={styles.radioContent}>
            <div className={styles.radioLabel}>Mock credit card</div>
            <div className={styles.radioDescription}>
              Placeholder for number, expiry, CVV fields — left out here to keep the UI focused.
            </div>
          </div>
        </div>
      </div>
      <div className={styles.inlineNote}>
        <span className={styles.summaryNoteStrong}>Reminder:</span> This project never touches real payment data. It just mimics the flow.
      </div>
    </div>
  );
}

