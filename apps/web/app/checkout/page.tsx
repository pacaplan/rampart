import React from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CheckoutHero from '@/components/checkout/CheckoutHero';
import ContactSection from '@/components/checkout/ContactSection';
import DeliverySection from '@/components/checkout/DeliverySection';
import PaymentSection from '@/components/checkout/PaymentSection';
import CartSummary from '@/components/cart/CartSummary';
import Button from '@/components/ui/Button';
import { cats } from '@/data/cats';
import styles from './page.module.css';

export default function CheckoutPage() {
  // Use first 2 cats as static cart contents
  const cartCats = cats.slice(0, 2);
  const subtotal = cartCats.reduce((sum, cat) => sum + cat.price, 0);

  return (
    <div className={styles.page}>
      <div className={styles.pageInner}>
        <Header />
        <CheckoutHero />
        <main className={styles.checkoutLayout}>
          <section className={styles.checkoutMain}>
            <ContactSection />
            <DeliverySection />
            <PaymentSection />
            <div className={styles.checkoutFooterActions}>
              <div className={styles.checkoutFooterLeft}>
                <Link href="/cart">
                  <Button variant="ghost">← Back to cart</Button>
                </Link>
                <div className={styles.inlineNote}>
                  You can still remove or swap cats before "placing" your pretend order.
                </div>
              </div>
              <div className={styles.checkoutFooterRight}>
                <Button variant="secondary">Save checkout state</Button>
                <Button variant="primary">Review & place pretend order</Button>
              </div>
            </div>
          </section>
          <CartSummary 
            itemCount={cartCats.length} 
            subtotal={subtotal} 
            showCheckout={false}
            showUniverseFees={true}
            showPromo={true}
          />
        </main>
        <Footer />
      </div>
    </div>
  );
}

