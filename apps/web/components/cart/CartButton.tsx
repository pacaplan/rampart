'use client';

import React, { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import styles from './CartButton.module.css';
import MiniCart from './MiniCart';

export default function CartButton() {
  const [isOpen, setIsOpen] = useState(false);
  const cartCount = 2; // Static count for UI-only prototype

  return (
    <div className={styles.cartWrapper}>
      <button 
        className={styles.cartButton}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={styles.cartIconBox}>
          <ShoppingCart size={18} />
        </div>
        <div className={styles.cartCount}>{cartCount}</div>
      </button>
      {isOpen && <MiniCart onClose={() => setIsOpen(false)} />}
    </div>
  );
}

