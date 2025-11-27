import React from 'react';
import Link from 'next/link';
import styles from './CartSummary.module.css';
import Button from '../ui/Button';

interface CartSummaryProps {
  itemCount: number;
  subtotal: number;
  showCheckout?: boolean;
  showUniverseFees?: boolean;
  showPromo?: boolean;
}

export default function CartSummary({ 
  itemCount, 
  subtotal, 
  showCheckout = true,
  showUniverseFees = false,
  showPromo = false
}: CartSummaryProps) {
  return (
    <aside className={styles.cartSummary}>
      <div className={styles.summaryTitle}>Order summary</div>
      <div className={styles.summaryRow + ' ' + styles.summaryRowMuted}>
        <span>Items</span>
        <span>{itemCount} unique cats</span>
      </div>
      <div className={styles.summaryRow + ' ' + styles.summaryRowMuted}>
        <span>Imaginary subtotal</span>
        <span>{subtotal.toFixed(2)} ¢</span>
      </div>
      <div className={styles.summaryRow + ' ' + styles.summaryRowMuted}>
        <span>Shipping</span>
        <span>0.00 ¢ (teleported)</span>
      </div>
      {showUniverseFees && (
        <div className={styles.summaryRow + ' ' + styles.summaryRowMuted}>
          <span>Universe fees</span>
          <span>0.00 ¢</span>
        </div>
      )}
      <div className={styles.summaryDivider}></div>
      <div className={styles.summaryRow + ' ' + styles.summaryTotal}>
        <span>Total due now</span>
        <span>0.00 ¢</span>
      </div>
      {showCheckout ? (
        <>
          <div className={styles.summaryNote}>
            {showUniverseFees 
              ? "In a real shop, this card would be doing the trust‑building heavy lifting: totals, fees, and final reassurance."
              : "This is a portfolio experience. No actual payments, billing, or real‑world cats are involved — just UI wiring and product thinking."
            }
          </div>
          <div className={styles.summaryCta}>
            <Link href="/checkout" className={styles.summaryButtonLink}>
              <Button variant="primary" className={styles.summaryButton}>
                Continue to pretend checkout
              </Button>
            </Link>
            <Link href="/" className={styles.summaryButtonLink}>
              <Button variant="secondary" className={styles.summaryButton}>
                Keep browsing cats
              </Button>
            </Link>
          </div>
          <div className={styles.summarySecondaryActions}>
            <div className={styles.summaryLinkish}>Clear cart (release all cats)</div>
            <div className={styles.summaryMiniText}>
              {showUniverseFees 
                ? "Nothing here is binding. Refresh the page, and the universe forgets this entire transaction."
                : "Need a real cat? Visit adoption resources in the footer instead of expecting this page to spawn one."
              }
            </div>
          </div>
        </>
      ) : (
        <>
          <div className={styles.summaryNote}>
            In a real shop, this card would be doing the trust‑building heavy lifting: totals, fees, and final reassurance.
          </div>
          {showPromo && (
            <div className={styles.promoField}>
              <div className={styles.fieldLabel}>Promo / magic word</div>
              <div className={styles.promoRow}>
                <div className={styles.promoInput}>
                  <span className={styles.promoPlaceholder}>Try "MEOWGIC" or leave blank</span>
                </div>
                <Button variant="secondary">Apply</Button>
              </div>
            </div>
          )}
          <div className={styles.summaryCta}>
            <Button variant="primary" className={styles.summaryButton}>
              Skip ahead to order review
            </Button>
            <Link href="/" className={styles.summaryButtonLink}>
              <Button variant="secondary" className={styles.summaryButton}>
                Keep browsing cats
              </Button>
            </Link>
          </div>
          <div className={styles.summarySecondaryActions}>
            <div className={styles.summaryLinkish}>Clear cart (release all cats)</div>
            <div className={styles.summaryMiniText}>
              Nothing here is binding. Refresh the page, and the universe forgets this entire transaction.
            </div>
          </div>
        </>
      )}
    </aside>
  );
}

