import React from 'react';
import { PersonalityMatch } from '@/data/quiz';
import styles from './QuizResult.module.css';

type Props = {
  personalityMatch: PersonalityMatch;
  onCreateCat: () => void;
  onRetake: () => void;
  onShare: () => void;
};

export default function QuizResult({ personalityMatch, onCreateCat, onRetake, onShare }: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.badge}>Your match</div>
      <pre className={styles.ascii}>{personalityMatch.asciiArt}</pre>
      <h1 className={styles.title}>{personalityMatch.name}</h1>
      <p className={styles.description}>{personalityMatch.description}</p>
      <div className={styles.actions}>
        <button className={styles.primaryButton} onClick={onCreateCat}>
          Create This Cat with CatBot
        </button>
        <button className={styles.secondaryButton} onClick={onRetake}>
          Retake Quiz
        </button>
        <button className={styles.shareButton} onClick={onShare}>
          Share Result
        </button>
      </div>
    </div>
  );
}
