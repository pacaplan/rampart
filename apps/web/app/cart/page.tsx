import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PageHero from '@/components/layout/PageHero';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import { cats } from '@/data/cats';
import styles from './page.module.css';

export default function CartPage() {
  // Use first 2 cats as static cart contents
  const cartCats = cats.slice(0, 2);
  const subtotal = cartCats.reduce((sum, cat) => sum + cat.price, 0);

  return (
    <div className={styles.page}>
      <div className={styles.pageInner}>
        <Header />
        <PageHero
          title="Your Cat‑alog cart"
          subtitle="A tidy summary of your current imaginary companions. No real payments, but 100% real bragging rights about your taste in fictional felines."
          meta="Quantities are always 1 — every cat is uniquely generated. Removing a cat simply releases it back into the quantum meow‑trix."
        />
        <main className={styles.cartLayout}>
          <section className={styles.cartMain}>
            <div className={styles.cartSectionLabel}>
              {cartCats.length} unique cats in your cart
            </div>
            <div className={styles.cartList}>
              {cartCats.map((cat) => (
                <CartItem key={cat.name} cat={cat} />
              ))}
            </div>
          </section>
          <CartSummary itemCount={cartCats.length} subtotal={subtotal} />
        </main>
        <Footer />
      </div>
    </div>
  );
}



