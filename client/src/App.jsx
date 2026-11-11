import { useCallback, useEffect, useState } from "react";
import { AuthScreen } from "./components/AuthScreen.jsx";
import { Brand } from "./components/Brand.jsx";
import { api, session } from "./lib/api.js";
import { Dashboard } from "./components/Dashboard.jsx";
import { WelcomeScreen } from './components/WelcomeScreen.jsx';

export function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(session.get()));
  const [message, setMessage] = useState("");
  const [connectionError, setConnectionError] = useState("");
  const [retry, setRetry] = useState(0);
  const [welcome, setWelcome] = useState(false);
  const [minimumShown, setMinimumShown] = useState(false);
  const [journalReady, setJournalReady] = useState(false);
  const [welcomeLeaving, setWelcomeLeaving] = useState(false);
  const ready = useCallback(()=>setJournalReady(true),[]);

  useEffect(()=>{
    if (!welcome) return;
    setMinimumShown(false);
    const timer=setTimeout(()=>setMinimumShown(true),1400);
    return ()=>clearTimeout(timer);
  },[welcome]);
  useEffect(()=>{
    if (!welcome || !minimumShown || !journalReady) return;
    setWelcomeLeaving(true);
    const timer = setTimeout(()=>{setWelcome(false);setWelcomeLeaving(false);},180);
    return ()=>clearTimeout(timer);
  },[welcome,minimumShown,journalReady]);

  useEffect(() => {
    const controller = new AbortController();
    if (!session.get()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setConnectionError("");
    setWelcome(false);
    setJournalReady(false);
    api("/auth/me", { signal: controller.signal })
      .then((data) => setUser(data.user))
      .catch((error) => {
        if (error.name !== "AbortError" && error.status !== 401)
          setConnectionError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [retry]);

  useEffect(() => {
    function expired() {
      setUser(null);
      setMessage("Your session has expired. Please log in again.");
    }
    window.addEventListener("sweety:session-expired", expired);
    return () => window.removeEventListener("sweety:session-expired", expired);
  }, []);

  function logout() {
    session.clear();
    setUser(null);
    setMessage("");
    setConnectionError("");
  }
  if (loading)
    return <WelcomeScreen />;
  if (connectionError)
    return (
      <main className="boot-screen">
        <Brand />
        <p role="alert">{connectionError}</p>
        <button className="button" onClick={() => setRetry(retry + 1)}>
          Try again
        </button>
        <button className="text-button" onClick={logout}>
          Back to login
        </button>
      </main>
    );
  return <><div inert={welcome} aria-hidden={welcome || undefined}>{!user ? (
      <AuthScreen
        onAuthenticating={busy=>{setWelcome(busy); if(busy)setJournalReady(false);}}
        onAuthenticated={(account) => {
          setUser(account);
          setMessage("");
        }}
        sessionMessage={message}
      />
    ) : <Dashboard user={user} onLogout={logout} onReady={ready} />}</div>{welcome && <WelcomeScreen leaving={welcomeLeaving} />}</>;
}
