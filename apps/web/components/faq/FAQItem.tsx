import React from 'react';
import styles from './FAQItem.module.css';

interface FAQItemProps {
  question: string;
  answer: string;
  tag: string;
  note?: string;
  linkText?: string;
  linkUrl?: string;
}

export default function FAQItem({ question, answer, tag, note, linkText, linkUrl }: FAQItemProps) {
  return (
    <article className={styles.faqItem}>
      <div className={styles.faqQuestionRow}>
        <div className={styles.faqQ}>{question}</div>
        <div className={styles.faqTag}>{tag}</div>
      </div>
      <div className={styles.faqA}>
        {answer}
        {linkText && linkUrl && (
          <a href={linkUrl} target="_blank" rel="noopener noreferrer" className={styles.faqLinkish}>
            {linkText}
          </a>
        )}
      </div>
      {note && <div className={styles.faqNote}>{note}</div>}
    </article>
  );
}

