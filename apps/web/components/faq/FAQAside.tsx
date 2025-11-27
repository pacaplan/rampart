import React from 'react';
import Link from 'next/link';
import styles from './FAQAside.module.css';

export default function FAQAside() {
  return (
    <aside className={styles.faqAside}>
      <div className={styles.asideSection}>
        <div className={styles.asideLabel}>About the human behind the cats</div>
        <div className={styles.asideText}>
          Hi, I'm the person who thought, "What if my portfolio pretended to be a whimsical cat store?" I build products that balance polish, clarity, and a slightly alarming number of puns.
        </div>
        <div className={styles.asidePillRow}>
          <div className={styles.asidePill}>Full‑stack / product‑minded</div>
          <div className={styles.asidePill}>Loves thoughtful UX</div>
          <div className={styles.asidePill}>Comfortable with AI tooling</div>
          <div className={styles.asidePill}>Enjoys silly side projects</div>
        </div>
      </div>
      <div className={styles.asideSection}>
        <div className={styles.asideLabel}>
          If you're a recruiter or hiring manager
        </div>
        <div className={styles.asideText}>
          You're very much in the target audience of this page. The Cat‑alog, CatBot flow, and mini‑cart are here to give you a quick read on how I think about systems, not just one‑off components.
        </div>
        <div className={styles.asideCta}>
          <div className={styles.asideCtaLink}>
            View the code on github.com/pacaplan/hexddd
          </div>
          <div className={styles.asideMeta}>
            Want to talk? You can open an issue, reach out via the contact info in the repo, or just mention the "imaginary cat store" in your message so I know how you found me.
          </div>
        </div>
      </div>
      <div className={styles.asideSection}>
        <div className={styles.asideLabel}>So what should I click next?</div>
        <div className={styles.asideText}>
          If you're a casual visitor, head back to the Cat‑alog to browse pre‑made cats. If you're evaluating this as a portfolio, explore the CatBot tab to see the custom builder flow in action.
        </div>
        <div className={styles.asideCta}>
          <Link href="/" className={styles.asideCtaLink}>
            Return to Cat‑alog
          </Link>
          <Link href="/catbot" className={styles.asideCtaLink}>
            Jump to CatBot flow
          </Link>
        </div>
      </div>
    </aside>
  );
}

