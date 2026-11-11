import { useEffect, useState } from "react";
import { Brand } from "./Brand.jsx";

export const thoughts = [
  "Small steps still move you forward.",
  "You don’t have to do everything. Start with one check-in.",
  "A little consistency can make your days feel clearer.",
  "This moment of care is time well spent.",
  "Your journal is a fresh start, whenever you need one.",
];

function nextThought() {
  const index =
    Number(sessionStorage.getItem("sweety-thought") || 0) % thoughts.length;
  sessionStorage.setItem("sweety-thought", String(index + 1));
  return index;
}

export function WelcomeScreen({ leaving = false }) {
  const [thought, setThought] = useState(nextThought);
  useEffect(() => {
    const timer = setInterval(() => {
      if (!document.hidden)
        setThought((current) => (current + 1) % thoughts.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);
  return (
    <div
      className={`welcome-screen ${leaving ? "leaving" : ""}`}
      role="status"
      aria-live="polite"
      aria-label="Opening your journal"
    >
      <div className="welcome-wordmark">
        <Brand />
      </div>
      <div className="welcome-content">
        <div className="welcome-emblem" aria-hidden="true">
          <Brand compact />
        </div>
        <h1>
          A little care,
          <br />
          <span>one day at a time.</span>
        </h1>
        <p className="welcome-thought" key={thought}>
          {thoughts[thought]}
        </p>
        <div className="welcome-steps" aria-hidden="true">
          {[0, 1, 2, 3].map((index) => (
            <span key={index} style={{ "--step": index }} />
          ))}
        </div>
        <p className="welcome-status">Opening your journal…</p>
      </div>
      <p className="welcome-footer">Your journal. Your pace.</p>
    </div>
  );
}
