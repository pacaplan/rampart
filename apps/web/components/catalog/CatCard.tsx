import React from 'react';
import Image from 'next/image';
import styles from './CatCard.module.css';
import Button from '../ui/Button';

export interface CatCardProps {
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  tag: string;
}

export default function CatCard({ name, description, imageUrl, price, tag }: CatCardProps) {
  return (
    <article className={styles.catCard}>
      <div className={styles.catImage}>
        <Image
          src={imageUrl}
          alt={name}
          fill
          className={styles.catImageImg}
        />
      </div>
      <div className={styles.catName}>{name}</div>
      <div className={styles.catDesc}>{description}</div>
      <div className={styles.catMetaRow}>
        <div className={styles.catPrice}>{price.toFixed(2)} ¢</div>
        <div className={styles.catMeta}>1 of 1 • {tag}</div>
      </div>
      <div className={styles.catActions}>
        <Button variant="primary" className={styles.catAddBtn}>
          Add to cart
        </Button>
        <div className={styles.catViewLink}>View details</div>
      </div>
    </article>
  );
}

