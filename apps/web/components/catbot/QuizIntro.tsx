import React from 'react';
import styles from './QuizIntro.module.css';

type Props = {
  onStart: () => void;
  onSkip: () => void;
};

export default function QuizIntro({ onStart, onSkip }: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.badge}>Cat personality quiz</div>
      <pre className={styles.ascii}>{String.raw`
 /\\_/\\   meow
( =^.^=)ﾉ
 (")(")  ~`}</pre>
      <h1 className={styles.title}>Let&apos;s meet your dream cat</h1>
      <p className={styles.lead}>
        Answer four playful questions to unlock a CatBot personality match. You can jump straight to
        chat if you&apos;re feeling impulsive.
      </p>
      <div className={styles.actions}>
        <button className={styles.primaryButton} onClick={onStart}>
          Start Quiz
        </button>
        <button className={styles.secondaryButton} onClick={onSkip}>
          Skip to CatBot
        </button>
      </div>
      <div className={styles.meta}>
        <span>Includes ASCII cats, paw prints, and zero judgment.</span>
      </div>
    </div>
  );
}
