import React from 'react';
import styles from './DeliverySection.module.css';

export default function DeliverySection() {
  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <div>
          <div className={styles.sectionTitle}>Delivery universe</div>
          <div className={styles.sectionSubtitle}>
            Standard fields, whimsical answers. Pick where your cats should exist.
          </div>
        </div>
      </div>
      <div className={styles.fieldGroup}>
        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <div className={styles.fieldLabel}>Reality setting</div>
            <div className={styles.fieldInput}>
              <div className={styles.fieldPlaceholder}>
                Earth‑adjacent demo universe
              </div>
              <div className={styles.fieldDropdown}>▼</div>
            </div>
          </div>
        </div>
        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <div className={styles.fieldLabel}>City</div>
            <div className={styles.fieldInput}>
              <div className={styles.fieldPlaceholder}>Starfall City</div>
            </div>
          </div>
          <div className={styles.field}>
            <div className={styles.fieldLabel}>Region</div>
            <div className={styles.fieldInput}>
              <div className={styles.fieldPlaceholder}>Nebula District</div>
            </div>
          </div>
        </div>
        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <div className={styles.fieldLabel}>
              Preferred delivery mode
              <span className={styles.fieldOptional}> (imaginary)</span>
            </div>
            <div className={styles.fieldInput}>
              <div className={styles.fieldPlaceholder}>
                Quantum doorstep drop‑off
              </div>
            </div>
          </div>
        </div>
        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <div className={styles.fieldLabel}>
              Special instructions
              <span className={styles.fieldOptional}> (optional)</span>
            </div>
            <div className={styles.fieldInput}>
              <div className={styles.fieldPlaceholder}>
                e.g. "Don't ring the doorbell, the dog unionized"
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



