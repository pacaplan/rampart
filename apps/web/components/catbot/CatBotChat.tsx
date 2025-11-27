'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PersonalityMatch } from '@/data/quiz';
import { catbotHeaderArt } from '@/data/catbotResponses';
import ChatMessage from './ChatMessage';
import CatPreview from './CatPreview';
import { CatPreviewState, ChatMessage as ChatMessageType } from './types';
import styles from './CatBotChat.module.css';

type Props = {
  messages: ChatMessageType[];
  onSendMessage: (text: string) => void;
  isThinking: boolean;
  onSelectName: (name: string) => void;
  selectedName: string;
  catPreview: CatPreviewState | null;
  onRegenerate: () => void;
  onRequestChanges: () => void;
  onSave: () => void;
  personalityMatch?: PersonalityMatch | null;
};

export default function CatBotChat({
  messages,
  onSendMessage,
  isThinking,
  onSelectName,
  selectedName,
  catPreview,
  onRegenerate,
  onRequestChanges,
  onSave,
  personalityMatch,
}: Props) {
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const placeholder = useMemo(() => {
    if (personalityMatch) {
      return `Ask CatBot to build a ${personalityMatch.name.toLowerCase()}...`;
    }
    return 'Describe your dream cat or ask for a change...';
  }, [personalityMatch]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const value = draft.trim();
    if (!value) return;
    onSendMessage(value);
    setDraft('');
  };

  return (
    <div className={styles.chatShell}>
      <div className={styles.header}>
        <pre className={styles.ascii}>{catbotHeaderArt}</pre>
        <div className={styles.headerCopy}>
          <div className={styles.kicker}>CatBot chat</div>
          <h2>
            Let&apos;s build {personalityMatch ? `your ${personalityMatch.name}` : 'a cat'} together
          </h2>
          <p>Share vibes, pick a name, and I will conjure a preview with paw-level precision.</p>
        </div>
      </div>
      <div className={styles.layout}>
        <div className={styles.feed} ref={scrollRef}>
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onSelectName={onSelectName}
              selectedName={selectedName}
            />
          ))}
          {isThinking && (
            <div className={styles.thinking}>
              <div className={styles.paws}>🐾</div>
              <div className={styles.dots}>
                <span />
                <span />
                <span />
              </div>
              <div className={styles.thinkingLabel}>CatBot is thinking...</div>
            </div>
          )}
        </div>
        <div className={styles.previewColumn}>
          {catPreview && (
            <CatPreview
              preview={catPreview}
              onSelectName={onSelectName}
              onRegenerate={onRegenerate}
              onRequestChanges={onRequestChanges}
              onSave={onSave}
            />
          )}
        </div>
      </div>
      <form className={styles.inputBar} onSubmit={handleSubmit}>
        <div className={styles.inputShell}>
          <span className={styles.pawIcon}>🐾</span>
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={placeholder}
          />
        </div>
        <button type="submit" className={styles.sendButton} disabled={!draft.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
