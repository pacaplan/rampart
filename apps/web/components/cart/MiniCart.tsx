'use client';

import React from 'react';
import Image from 'next/image';
import styles from './MiniCart.module.css';
import Button from '../ui/Button';

interface MiniCartProps {
  onClose: () => void;
}

export default function MiniCart({ onClose }: MiniCartProps) {
  // Static cart data for UI-only prototype
  const cartItems = [
    {
      name: "Nebula Neko",
      imageUrl: "https://images.unsplash.com/photo-1612177037142-cd92f4e754e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYyMDB8MHwxfHNlYXJjaHwxfHxjYXJ0b29uJTIwZ2FsYXh5JTIwY2F0fGVufDB8fHx8MTc2NDEyMzAzMHww&ixlib=rb-4.1.0&q=80&w=1080",
      price: 48.00
    },
    {
      name: "Laser Pointer Prodigy",
      imageUrl: "https://images.unsplash.com/photo-1615639164213-aab04da93c7c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYyMDB8MHwxfHNlYXJjaHwxfHxjeWJlcnB1bmslMjBjYXQlMjBpbGx1c3RyYXRpb258ZW58MHx8fHwxNzY0MTIzMDMxfDA&ixlib=rb-4.1.0&q=80&w=1080",
      price: 39.00
    }
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className={styles.miniCart}>
      <div className={styles.miniCartHeader}>
        <span>Mini cart</span>
        <span>{cartItems.length} unique cats</span>
      </div>
      <div className={styles.miniCartItems}>
        {cartItems.map((item, index) => (
          <div key={index} className={styles.miniCartItem}>
            <div className={styles.miniCartThumb}>
              <Image
                src={item.imageUrl}
                alt={item.name}
                width={32}
                height={32}
                className={styles.miniCartImage}
              />
            </div>
            <div className={styles.miniCartInfo}>
              <div className={styles.miniCartName}>{item.name}</div>
              <div className={styles.miniCartMeta}>
                <span>1 of 1</span>
                <span>{item.price.toFixed(2)} ¢</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.miniCartSubtotal}>
        <span>Subtotal</span>
        <span>{subtotal.toFixed(2)} ¢</span>
      </div>
      <div className={styles.miniCartActions}>
        <Button variant="secondary" className={styles.viewCartBtn}>
          View cart
        </Button>
        <Button variant="primary">
          Checkout
        </Button>
      </div>
      <div className={styles.badgeNote}>
        Quantities are always 1 — every cat is one‑of‑a‑kind.
      </div>
    </div>
  );
}

