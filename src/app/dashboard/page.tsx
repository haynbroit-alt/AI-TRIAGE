import type { LeadRecord, Decision } from '@/inbox/types';
import { FeedbackButtons } from './FeedbackButtons';
import styles from './dashboard.module.css';

async function getLeads(decision?: string): Promise<LeadRecord[]> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const url = new URL('/api/leads', base);
  if (decision) url.searchParams.set('decision', decision);
  url.searchParams.set('limit', '100');

  const res = await fetch(url.toString(), { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

const DECISION_STYLES: Record<Decision, string> = {
  ACT: styles.badgeAct,
  WATCH: styles.badgeWatch,
  IGNORE: styles.badgeIgnore,
};

interface PageProps {
  searchParams: Promise<{ filter?: string }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filter = params.filter;
  const leads = await getLeads(filter);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1>Priorix</h1>
        <p className={styles.subtitle}>{leads.length} lead(s) affiché(s)</p>
      </header>

      <nav className={styles.filters}>
        <FilterLink href="/dashboard" label="Tous" active={!filter} />
        <FilterLink href="/dashboard?filter=ACT" label="ACT" active={filter === 'ACT'} />
        <FilterLink href="/dashboard?filter=WATCH" label="WATCH" active={filter === 'WATCH'} />
        <FilterLink href="/dashboard?filter=IGNORE" label="IGNORE" active={filter === 'IGNORE'} />
      </nav>

      {leads.length === 0 ? (
        <p className={styles.empty}>Aucun lead pour l&apos;instant.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Décision</th>
                <th>Score</th>
                <th>De</th>
                <th>Sujet</th>
                <th>Raison</th>
                <th>B</th>
                <th>U</th>
                <th>F</th>
                <th>Reçu</th>
                <th title="Correction humaine">Feedback</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className={styles.row}>
                  <td>
                    <span className={`${styles.badge} ${DECISION_STYLES[lead.decision]}`}>
                      {lead.decision}
                    </span>
                  </td>
                  <td className={styles.score}>{lead.score.toFixed(1)}</td>
                  <td className={styles.truncate}>{lead.sender}</td>
                  <td className={styles.truncate}>{lead.subject}</td>
                  <td className={styles.summary}>{lead.reason}</td>
                  <td>{lead.business}</td>
                  <td>{lead.urgency}</td>
                  <td>{lead.fit}</td>
                  <td className={styles.date}>
                    {new Date(lead.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td>
                    <FeedbackButtons
                      leadId={lead.id}
                      feedbackType={lead.feedback_type}
                      feedbackOverride={lead.feedback_override}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

function FilterLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <a href={href} className={`${styles.filterLink} ${active ? styles.filterActive : ''}`}>
      {label}
    </a>
  );
}
