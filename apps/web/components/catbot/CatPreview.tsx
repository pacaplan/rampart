import React from 'react';
import styles from './CatPreview.module.css';
import { CatPreviewState } from './types';

type Props = {
  preview: CatPreviewState;
  onSelectName: (name: string) => void;
  onRegenerate: () => void;
  onRequestChanges: () => void;
  onSave: () => void;
};

export default function CatPreview({
  preview,
  onSelectName,
  onRegenerate,
  onRequestChanges,
  onSave,
}: Props) {
  const selectedName = preview.customName?.trim() || preview.name;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.title}>Cat preview</div>
        <div className={styles.badge}>{preview.status === 'ready' ? 'Ready' : 'In progress'}</div>
      </div>
      <div className={styles.previewBox}>
        {preview.imageUrl ? (
          <img src={preview.imageUrl} alt={selectedName} className={styles.image} />
        ) : (
          <div className={styles.placeholder}>
            <div className={styles.paw}>🐾</div>
            <div className={styles.placeholderText}>
              {preview.status === 'generating'
                ? 'Rendering your cat...'
                : 'Image arrives after CatBot finishes.'}
            </div>
          </div>
        )}
        {preview.status === 'generating' && (
          <div className={styles.progress}>
            <div className={styles.progressBar} style={{ width: `${preview.progress}%` }} />
            <div className={styles.progressLabel}>{preview.progress}%</div>
          </div>
        )}
      </div>
      <div className={styles.section}>
        <div className={styles.sectionLabel}>Pick a name</div>
        <div className={styles.names}>
          {preview.nameOptions.map((option) => (
            <label key={option} className={styles.nameOption}>
              <input
                type="radio"
                name="cat-name"
                value={option}
                checked={selectedName === option}
                onChange={() => onSelectName(option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
        <label className={styles.customName}>
          <span>Or type your own</span>
          <input
            type="text"
            placeholder="Captain Whiskertron"
            value={preview.customName ?? ''}
            onChange={(event) => onSelectName(event.target.value)}
          />
        </label>
      </div>
      <div className={styles.section}>
        <div className={styles.sectionLabel}>Description</div>
        <p className={styles.description}>{preview.description}</p>
      </div>
      <div className={styles.actions}>
        <button className={styles.secondaryButton} onClick={onRegenerate}>
          Regenerate Image
        </button>
        <button className={styles.secondaryButton} onClick={onRequestChanges}>
          Request Changes
        </button>
        <button className={styles.primaryButton} onClick={onSave}>
          Save Cat
        </button>
      </div>
    </div>
  );
}
