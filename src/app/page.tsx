import type { Metadata } from 'next';
import styles from './landing.module.css';

export const metadata: Metadata = {
  title: 'Priorix — Vous savez instantanément quoi faire de chaque email.',
  description:
    'Priorix analyse chaque email et retourne une décision immédiate : ACT, WATCH ou IGNORE. Extension Gmail simple, un seul clic.',
};

const INSTALL_URL =
  'mailto:haynbroit@hotmail.com?subject=Demande%20d%27acc%C3%A8s%20beta%20Priorix&body=Bonjour%2C%0A%0AJe%20souhaite%20acc%C3%A9der%20%C3%A0%20la%20beta%20de%20Priorix.%0A%0AMon%20nom%20%3A%0AEntreprise%20%3A%0ANombre%20d%27emails%20par%20jour%20(environ)%20%3A%0ACas%20d%27usage%20%3A';

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <span className={styles.logo}>Priorix</span>
        <a href="/dashboard" className={styles.navLink}>
          Dashboard
        </a>
      </nav>

      <main className={styles.hero}>
        <span className={styles.badge}>
          <span className={styles.badgeDot} />
          Disponible pour Gmail
        </span>

        <h1 className={styles.headline}>
          Vous savez instantanément{' '}
          <em>quoi faire</em>{' '}
          de chaque email.
        </h1>

        <p className={styles.sub}>
          Priorix analyse chaque email en 1 clic et vous donne une décision claire :
          répondre maintenant, traiter plus tard, ou ignorer.
        </p>

        <a href={INSTALL_URL} className={styles.cta}>
          Demander l&apos;accès beta
        </a>
        <span className={styles.ctaSub}>Gratuit · 10 analyses / jour · Accès limité</span>

        <div className={styles.previewWrap}>
          <div className={styles.previewCard}>
            <div className={styles.previewHeader}>
              <div className={styles.previewDots}>
                <span className={styles.dot} />
                <span className={styles.dot} />
                <span className={styles.dot} />
              </div>
              <span className={styles.previewTitle}>Priorix</span>
            </div>
            <div className={styles.previewBody}>
              <div className={styles.previewDecision}>
                <span className={`${styles.decisionBadge} ${styles.decisionAct}`}>ACT</span>
                <span className={styles.decisionLabel}>Répondre maintenant</span>
              </div>
              <div className={styles.previewScores}>
                {[
                  { key: 'Business', val: 9 },
                  { key: 'Urgency', val: 8 },
                  { key: 'Fit', val: 9 },
                ].map(({ key, val }) => (
                  <div key={key} className={styles.scoreItem}>
                    <span className={styles.scoreKey}>{key}</span>
                    <span className={styles.scoreVal}>{val}</span>
                  </div>
                ))}
              </div>
              <p className={styles.previewReason}>
                &ldquo;Lead qualifié avec budget identifié et délai urgent.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </main>

      <section className={styles.features}>
        {[
          {
            icon: '⚡',
            title: 'Immédiat',
            desc: 'Décision en moins de 3 secondes par email.',
          },
          {
            icon: '🎯',
            title: 'Simple',
            desc: "ACT, WATCH ou IGNORE. Rien d'autre.",
          },
          {
            icon: '🔒',
            title: 'Privé',
            desc: 'Vos emails ne sont jamais stockés.',
          },
        ].map(({ icon, title, desc }) => (
          <div key={title} className={styles.feature}>
            <div className={styles.featureIcon}>{icon}</div>
            <div className={styles.featureTitle}>{title}</div>
            <div className={styles.featureDesc}>{desc}</div>
          </div>
        ))}
      </section>

      <footer className={styles.footer}>
        <span className={styles.footerLogo}>Priorix</span>
        <nav className={styles.footerLinks}>
          <a href="/dashboard" className={styles.footerLink}>Dashboard</a>
          <a href="/api/triage" className={styles.footerLink}>API</a>
        </nav>
      </footer>
    </div>
  );
}
