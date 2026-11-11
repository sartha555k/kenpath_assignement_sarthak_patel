# Sweety patient journal

Mode: Operate.

The user records a daily glucose reading and reviews private daily/monthly reports.
Pinned direction: minimalist light theme, bold readable type, subtle animation,
mobile responsiveness. Reference: Awwwards' Oura Ring entry and its restrained
warm palette; no copied branding or medical outcome claims.

First viewport: date selection, all four daily slots, current values and direct
edit/add actions. At desktop width the reading form is beside the journal;
at mobile width it follows the journal and is reached by the Add action.

Visual system: Manrope, off-white, olive, pale lime, thin dividers, quiet geometry.
Motion: saved values settle, success notifications arrive, loading placeholders
breathe. Honor reduced motion. Navigation is familiar and task focused.

Critical states: unauthenticated, expired session, loading, empty, API failure,
validation failure, full day, editing, delete confirmation, saved and deleted.

Verification: real Express API backed by disposable PGlite data for browser QA;
production API remains PostgreSQL. Browser widths 320, 390, 768, 1280 and 1440.
