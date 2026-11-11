# Sweety patient journal

Mode: Operate.

The user records a daily glucose reading and reviews private daily/monthly reports.
Pinned direction: minimalist light theme, bold readable type, subtle animation,
mobile responsiveness. Reference: Awwwards' Oura Ring entry and its restrained
warm palette; no copied branding or medical outcome claims.

First viewport: date selection, all four daily slots, current values and direct
edit/add actions. At desktop width the reading form is beside the journal;
at mobile width it follows the journal and is reached by the Add action.

Visual system: Manrope, blue-white surfaces, cornflower blue, powder-blue selected
states, thin dividers and quiet geometry. The user explicitly replaced olive.
Motion: saved values settle, success notifications arrive, loading placeholders
breathe. Honor reduced motion. Navigation is familiar and task focused.
Report/history entry opens a focused dialog and returns to the original trigger.
Animated calendar and slot popups use accessible Radix primitives and DayPicker.
History groups complete days, including at pagination boundaries. Chart taps show
date, slot and value; arrow keys move between readings. Signup/login shows a short
animated welcome with rotating general encouragement while journal data loads.
Date changes never autofocus the glucose field; background report refreshes keep
existing rows and charts mounted.

Critical states: unauthenticated, expired session, loading, empty, API failure,
validation failure, full day, editing, delete confirmation, saved and deleted.

Verification: real Express API backed by disposable PGlite data for browser QA;
production API remains PostgreSQL. Browser widths 320, 390, 768, 1280 and 1440.
