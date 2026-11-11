import { ArrowDownLeft, ArrowUpRight, Hash, Minus } from 'lucide-react';

export function ReportSummary({ report, compact = false }) {
  const items = [
    { label: 'Average', value: report?.average == null ? null : report.average.toFixed(1), icon: Minus },
    { label: 'Highest', value: report?.highest, icon: ArrowUpRight },
    { label: 'Lowest', value: report?.lowest, icon: ArrowDownLeft },
    { label: 'Readings', value: report?.count ?? 0, icon: Hash },
  ];
  return <dl className={`report-summary ${compact ? 'compact' : ''}`}>{items.map(({ label, value, icon: Icon }) => <div key={label}><dt><Icon size={13} aria-hidden="true" />{label}</dt><dd>{value ?? '—'}{label !== 'Readings' && value != null && <span>mg/dl</span>}</dd></div>)}</dl>;
}
