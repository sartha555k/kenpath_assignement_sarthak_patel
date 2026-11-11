export function Brand({ compact = false }) {
  return (
    <span className="brand">
      <svg aria-hidden="true" width="34" height="34" viewBox="0 0 40 40">
        <g fill="currentColor">
          <ellipse cx="20" cy="12" rx="5" ry="9" />
          <ellipse cx="20" cy="28" rx="5" ry="9" />
          <ellipse cx="12" cy="20" rx="9" ry="5" />
          <ellipse cx="28" cy="20" rx="9" ry="5" />
        </g>
      </svg>
      {!compact && (
        <span>
          sweety<span className="brand-dot">.</span>
        </span>
      )}
    </span>
  );
}
