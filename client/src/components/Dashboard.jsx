import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, BookOpen, ChartNoAxesCombined, Check, ChevronLeft, ChevronRight, LayoutDashboard, LogOut, Plus, RefreshCw } from 'lucide-react';
import { Brand } from './Brand.jsx';
import { DatePicker } from './DatePicker.jsx';
import { ReadingForm } from './ReadingForm.jsx';
import { ReadingRows } from './ReadingRows.jsx';
import { ReportSummary } from './ReportSummary.jsx';
import { TrendChart } from './TrendChart.jsx';
import { api } from '../lib/api.js';
import { formatDate, slots, today } from '../lib/dates.js';

const navigation = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'history', label: 'Reading history', icon: BookOpen },
  { id: 'reports', label: 'Reports', icon: ChartNoAxesCombined },
];

async function getMonthReadings(date, signal) {
  const query = `from=${date.slice(0, 7)}-01&to=${date}&limit=100`;
  const first = await api(`/readings?${query}`, { signal });
  const remaining = await Promise.all(Array.from({ length: first.pagination.totalPages - 1 }, (_, index) => api(`/readings?${query}&page=${index + 2}`, { signal })));
  const order = (reading) => slots.findIndex((slot) => slot.id === reading.slot);
  return [...first.readings, ...remaining.flatMap((page) => page.readings)].sort((a, b) => a.date.localeCompare(b.date) || order(a) - order(b));
}

function LoadingJournal() {
  return <div className="journal-loading" role="status"><span className="sr-only">Loading your readings…</span><div className="skeleton" style={{ height: 44, width: '50%' }} />{[1, 2, 3, 4].map((index) => <div className="skeleton" style={{ height: 56 }} key={index} />)}</div>;
}

export function Dashboard({ user, onLogout }) {
  const [view, setView] = useState('overview');
  const [date, setDate] = useState(today());
  const [reports, setReports] = useState(null);
  const [monthReadings, setMonthReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const [editing, setEditing] = useState(null);
  const [initialSlot, setInitialSlot] = useState('');
  const [formVersion, setFormVersion] = useState(0);
  const [focusRequest, setFocusRequest] = useState(0);
  const [toast, setToast] = useState('');
  const [page, setPage] = useState(1);
  const [history, setHistory] = useState(null);
  const [historyError, setHistoryError] = useState('');
  const [historyLoading, setHistoryLoading] = useState(false);
  const formRegion = useRef(null);
  const currentDate = today();

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError('');
    Promise.all([api(`/reports?date=${date}`, { signal: controller.signal }), getMonthReadings(date, controller.signal)])
      .then(([data, readings]) => { setReports(data.reports); setMonthReadings(readings); })
      .catch((failure) => { if (failure.name !== 'AbortError') setError(failure.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [date, revision]);

  useEffect(() => {
    if (view !== 'history') return;
    const controller = new AbortController();
    setHistoryLoading(true); setHistoryError('');
    api(`/readings?page=${page}&limit=12`, { signal: controller.signal }).then((data) => {
      if (page > 1 && !data.readings.length) { setPage(Math.max(1, data.pagination.totalPages)); return; }
      setHistory(data);
    }).catch((failure) => { if (failure.name !== 'AbortError') setHistoryError(failure.message); })
      .finally(() => { if (!controller.signal.aborted) setHistoryLoading(false); });
    return () => controller.abort();
  }, [view, page, revision]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  function selectDate(value) { setDate(value); setEditing(null); setInitialSlot(''); setFormVersion((version) => version + 1); }
  function resetForm() { setEditing(null); setInitialSlot(''); setFocusRequest(0); setFormVersion((version) => version + 1); }
  function navigate(value) { setView(value); setFocusRequest(0); window.scrollTo({ top: 0, behavior: 'instant' }); }
  function openForm(reading = null, slot = '') {
    if (view === 'history' || view === 'reports') setView('overview');
    if (reading && reading.date !== date) setDate(reading.date);
    setEditing(reading); setInitialSlot(slot); setFormVersion((version) => version + 1); setFocusRequest((count) => count + 1);
    requestAnimationFrame(() => formRegion.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'nearest' }));
  }

  async function saveReading(body, id) {
    await api(id ? `/readings/${id}` : '/readings', { method: id ? 'PUT' : 'POST', body });
    setToast(id ? 'Reading updated. Your reports are up to date.' : 'Reading saved. A little care goes a long way.');
    if (body.date !== date) selectDate(body.date);
    else resetForm();
    setRevision((value) => value + 1);
  }

  async function deleteReading(reading) {
    await api(`/readings/${reading.id}`, { method: 'DELETE' });
    if (editing?.id === reading.id) resetForm();
    setToast('Reading deleted. Your reports have been updated.');
    setRevision((value) => value + 1);
  }

  const dailyReadings = loading || error ? [] : reports?.daily.readings || [];
  const count = reports?.daily.count || 0;
  const firstName = user.name.trim().split(/\s+/)[0];
  const reportPeriods = [
    { id: 'daily', title: 'Daily', note: 'The selected day' },
    { id: 'monthToDate', title: 'Month to date', note: 'From the first of the month' },
    { id: 'monthly', title: 'Previous month', note: 'The whole previous calendar month' },
  ];

  return <div className="app-layout">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <aside className="sidebar">
      <a className="brand-link" href="#overview" aria-label="Sweety overview" onClick={(event) => { event.preventDefault(); navigate('overview'); }}><Brand /></a>
      <nav aria-label="Main navigation">{navigation.map(({ id, label, icon: Icon }) => <button key={id} className={`nav-item ${view === id ? 'active' : ''}`} aria-current={view === id ? 'page' : undefined} onClick={() => navigate(id)}><Icon size={18} strokeWidth={1.7} /><span>{label}</span>{view === id && <span className="nav-indicator" />}</button>)}</nav>
      <div className="sidebar-bottom"><div className="care-note"><Brand compact /><h2>A little care,<br />every day.</h2><p>A simple habit.<br />A journal that grows with you.</p><button className="text-button" onClick={() => openForm()}>Make a check-in <ArrowUpRight size={14} /></button></div><button className="logout" onClick={onLogout}><LogOut size={16} />Log out</button><span className="sidebar-caption">Your daily glucose journal</span></div>
    </aside>
    <div className="app-main">
      <header className="topbar"><div className="mobile-brand"><Brand /></div><span className="topbar-title">{navigation.find((item) => item.id === view).label}</span><div className="topbar-right"><span className="topbar-date">{formatDate(currentDate, { weekday: 'long', day: 'numeric', month: 'long' })}</span><span className="user-avatar" title={user.name}>{user.name.trim().slice(0, 1).toUpperCase()}</span><button className="mobile-logout icon-button" onClick={onLogout} aria-label="Log out"><LogOut size={17} /></button></div></header>
      <main id="main-content" className="main-content">
        <div className="page-heading"><div><h1>{view === 'overview' ? 'Your day, at a glance.' : view === 'history' ? 'Every reading, in one place.' : 'See the bigger picture.'}</h1><p>{view === 'overview' ? `Welcome back, ${firstName}. Let’s make time for a little care.` : view === 'history' ? 'Your check-ins, from the latest to the very first.' : 'Simple summaries to help you keep track over time.'}</p></div><button className="button add-reading-button" onClick={() => openForm()}><Plus size={17} />Add reading</button></div>
        {view !== 'history' && <div className="date-toolbar"><div className="day-label"><span>{date === currentDate ? 'Today' : formatDate(date, { weekday: 'long' })}</span>{date !== currentDate && <button className="text-button" onClick={() => selectDate(currentDate)}>Back to today</button>}</div><DatePicker date={date} onChange={selectDate} /></div>}
        {view !== 'history' && error && <div className="error-banner" role="alert">{error}<button className="text-button" onClick={() => setRevision((value) => value + 1)}><RefreshCw size={14} /> Try again</button></div>}
        {view === 'overview' && <div className="dashboard-grid">
          <div className="journal-column">
            <section className="daily-panel" aria-labelledby="daily-title"><div className="section-heading"><h2 id="daily-title">Daily readings</h2><span className={`count-badge ${count === 4 ? 'all-done' : ''}`}>{count === 4 && !loading && <Check size={12} />}{loading || error ? '—' : count} / 4 recorded</span></div>
              {loading ? <LoadingJournal /> : error ? <p className="empty-text">Your readings will appear here when the connection is restored.</p> : <><ReadingRows readings={dailyReadings} onEdit={openForm} onDelete={deleteReading} onAdd={(slot) => openForm(null, slot)} daily /><div className="daily-footer"><span className="small-dot" /><p>{count === 4 ? 'All four slots recorded. Your journal is up to date.' : count === 0 ? 'A fresh page. Start with your first reading.' : `${4 - count} ${4 - count === 1 ? 'slot' : 'slots'} left to record for this day.`}</p></div></>}
            </section>
            <section className="daily-summary-panel" aria-label="Daily summary">{loading ? <div className="skeleton" style={{ height: 61 }} /> : !error && <ReportSummary report={reports?.daily} compact />}</section>
            <section className="trend-panel" aria-labelledby="trend-title"><div className="section-heading"><div><h2 id="trend-title">Your month, so far.</h2><p className="section-description">{formatDate(`${date.slice(0, 7)}-01`, { day: 'numeric', month: 'short' })} – {formatDate(date)} · mg/dl</p></div><span className="chart-legend"><span className="small-dot" />Glucose</span></div>{loading ? <div className="skeleton" style={{ height: 160, marginTop: 24 }} /> : !error && <TrendChart readings={monthReadings} />}</section>
          </div>
          <div className="checkin-column" ref={formRegion}><ReadingForm key={`${date}-${formVersion}`} selectedDate={date} readings={dailyReadings} editing={editing} initialSlot={initialSlot} onSave={saveReading} onCancel={resetForm} focusRequest={focusRequest} /><section className="month-note"><div className="section-heading"><h2>One day at a time.</h2><ArrowUpRight size={19} /></div><p>Each reading adds a little context.<br />Your monthly reports bring it together.</p><button className="text-button" onClick={() => navigate('reports')}>Explore your reports <ArrowRight size={14} /></button></section></div>
        </div>}
        {view === 'history' && <section className="history-panel" aria-labelledby="history-title"><div className="section-heading"><h2 id="history-title">Reading history</h2><span className="muted history-count">{history?.pagination.total ?? '—'} readings</span></div>
          {historyLoading ? <LoadingJournal /> : historyError ? <div className="error-banner" role="alert">{historyError}<button className="text-button" onClick={() => setRevision((value) => value + 1)}>Try again</button></div> : history?.readings.length ? <ReadingRows readings={history.readings} showDates onEdit={openForm} onDelete={deleteReading} /> : <div className="empty-state"><BookOpen size={30} strokeWidth={1.3} /><h3>Your journal starts here.</h3><p>Save your first reading and find it here whenever you need it.</p><button className="button" onClick={() => openForm()}><Plus size={16} />Add your first reading</button></div>}
          {history && history.pagination.totalPages > 1 && <div className="pagination"><span>Page {page} of {history.pagination.totalPages}</span><div><button className="icon-button" aria-label="Previous page" disabled={page <= 1 || historyLoading} onClick={() => setPage(page - 1)}><ChevronLeft size={16} /></button><button className="icon-button" aria-label="Next page" disabled={page >= history.pagination.totalPages || historyLoading} onClick={() => setPage(page + 1)}><ChevronRight size={16} /></button></div></div>}
        </section>}
        {view === 'reports' && <div className="reports-view">{loading ? <LoadingJournal /> : !error && reportPeriods.map(({ id, title, note }) => {
          const report = reports?.[id];
          return report && <section className="report-panel" key={id}><div className="section-heading"><div><h2>{title}</h2><p className="section-description">{note}</p></div><span className="report-date-range">{report.startDate === report.endDate ? formatDate(report.startDate) : `${formatDate(report.startDate, { day: 'numeric', month: 'short' })} – ${formatDate(report.endDate)}`}</span></div><ReportSummary report={report} />{report.count === 0 && <p className="report-empty-note">{report.message}</p>}{id === 'daily' && report.count > 0 && <ReadingRows readings={report.readings} onEdit={openForm} onDelete={deleteReading} />}</section>;
        })}</div>}
        <footer className="page-footer"><span><span className="small-dot" />Your journal. Your pace.</span><span>Readings recorded in mg/dl.</span></footer>
      </main>
    </div>
    <nav className="mobile-nav" aria-label="Mobile navigation">{navigation.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => navigate(id)} aria-current={view === id ? 'page' : undefined} className={view === id ? 'active' : ''}><Icon size={20} strokeWidth={1.7} /><span>{id === 'history' ? 'History' : label}</span></button>)}</nav>
    {toast && <div className="toast" role="status"><Check size={17} /><span>{toast}</span><button aria-label="Dismiss notification" onClick={() => setToast('')}>×</button></div>}
  </div>;
}
