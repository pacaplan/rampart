import React from 'react';
import styles from './ChatMessage.module.css';
import { ChatMessage as ChatMessageType } from './types';

type Props = {
  message: ChatMessageType;
  onSelectName?: (name: string) => void;
  selectedName?: string;
};

export default function ChatMessage({ message, onSelectName, selectedName }: Props) {
  const isUser = message.sender === 'user';

  return (
    <div className={`${styles.wrapper} ${isUser ? styles.user : styles.bot}`}>
      <div className={styles.avatar}>{isUser ? '😸' : '🤖'}</div>
      <div className={styles.bubble}>
        <div className={styles.text}>{message.text}</div>
        {message.action && <div className={styles.action}>{message.action}</div>}
        {message.nameSuggestions && onSelectName && (
          <div className={styles.names}>
            <div className={styles.label}>Name sparks</div>
            {message.nameSuggestions.map((name) => (
              <label key={name} className={styles.nameOption}>
                <input
                  type="radio"
                  name="name-suggestion"
                  value={name}
                  checked={selectedName === name}
                  onChange={() => onSelectName(name)}
                />
                <span>{name}</span>
              </label>
            ))}
          </div>
        )}
        {typeof message.imageProgress === 'number' && (
          <div className={styles.progress}>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressFill}
                style={{ width: `${Math.min(100, message.imageProgress)}%` }}
              />
            </div>
            <div className={styles.progressLabel}>{message.imageProgress}%</div>
          </div>
        )}
        {message.catPreview && (
          <div className={styles.preview}>
            <div className={styles.previewTitle}>{message.catPreview.name || 'New Cat'}</div>
            <div className={styles.previewText}>{message.catPreview.description}</div>
            <div className={styles.previewBadge}>
              {message.catPreview.status === 'ready' ? 'Preview' : 'Sketching'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
