import React from 'react';
import Image from 'next/image';
import styles from './CartItem.module.css';
import Button from '../ui/Button';
import { Cat } from '@/data/cats';

interface CartItemProps {
  cat: Cat;
}

export default function CartItem({ cat }: CartItemProps) {
  return (
    <article className={styles.cartItem}>
      <div className={styles.cartThumb}>
        <Image
          src={cat.imageUrl}
          alt={cat.name}
          fill
          className={styles.cartThumbImg}
        />
      </div>
      <div className={styles.cartItemMain}>
        <div className={styles.cartItemHeader}>
          <div className={styles.cartItemTitle}>{cat.name}</div>
          <div className={styles.cartItemPrice}>{cat.price.toFixed(2)} ¢</div>
        </div>
        <div className={styles.cartItemMeta}>
          <span>Rarity: 1 of 1</span>
          <span>Vibe: {cat.tag}</span>
          <div className={styles.cartPill}>Pre‑made Cat‑alog pick</div>
        </div>
        <div className={styles.cartItemFooter}>
          <div className={styles.cartQtyNote}>
            Quantity is locked to 1 — this little stargazer is non‑duplicable.
          </div>
          <div className={styles.cartActionsRow}>
            <Button variant="ghost">Remove</Button>
            <Button variant="secondary">Move to wishlist</Button>
          </div>
        </div>
      </div>
    </article>
  );
}



