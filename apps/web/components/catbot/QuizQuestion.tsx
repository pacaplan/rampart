import React from 'react';
import { QuizQuestion as QuizQuestionType } from '@/data/quiz';
import styles from './QuizQuestion.module.css';

type Props = {
  question: QuizQuestionType;
  questionNumber: number;
  totalQuestions: number;
  selectedOptionId?: string;
  onSelectOption: (optionId: string) => void;
  onBack: () => void;
  onSkip: () => void;
};

export default function QuizQuestion({
  question,
  questionNumber,
  totalQuestions,
  selectedOptionId,
  onSelectOption,
  onBack,
  onSkip,
}: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.counter}>
          Question {questionNumber} of {totalQuestions}
        </div>
        <div className={styles.progress}>
          {Array.from({ length: totalQuestions }).map((_, i) => (
            <div
              key={i}
              className={`${styles.progressDot} ${i < questionNumber ? styles.filled : ''}`}
            />
          ))}
        </div>
      </div>
      <div className={styles.questionBox}>
        <h2 className={styles.prompt}>{question.prompt}</h2>
        <p className={styles.detail}>{question.detail}</p>
      </div>
      <div className={styles.options}>
        {question.options.map((option) => (
          <button
            key={option.id}
            className={`${styles.option} ${selectedOptionId === option.id ? styles.selected : ''}`}
            onClick={() => onSelectOption(option.id)}
          >
            <span className={styles.emoji}>{option.emoji}</span>
            <div className={styles.optionContent}>
              <div className={styles.optionLabel}>{option.label}</div>
              <div className={styles.optionDescription}>{option.description}</div>
            </div>
          </button>
        ))}
      </div>
      <div className={styles.footer}>
        <button className={styles.backButton} onClick={onBack} disabled={questionNumber === 1}>
          Back
        </button>
        <button className={styles.skipLink} onClick={onSkip}>
          Skip to CatBot
        </button>
      </div>
    </div>
  );
}
