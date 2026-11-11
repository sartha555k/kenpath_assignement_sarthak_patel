# Sweety

<!-- impeccable:product-schema 1 -->

## Platform
web

## Stack
React frontend; existing Express/Node.js API and PostgreSQL database.

## Users
Diabetes patients recording up to four blood glucose readings per day.

## Product Purpose
Record personal readings and review daily, month-to-date and previous-month summaries.

## Capabilities and Constraints
Signup/login, private reading CRUD, four fixed slots, integer values 40–600 mg/dl,
no future dates, no duplicate slots per day. Reports show count, min, max and
one-decimal average. Existing backend contract remains authoritative.

## Brand Commitments
Sweety. User requests a minimalist light interface, bold typography, animation,
and responsive mobile layouts, informed by award-winning references.
Latest feedback explicitly rejects the original olive palette and black as a
replacement accent. The revised implementation uses cornflower blue. Users need
stable editing without focus jumps or page-wide loading flashes, date-grouped
history, visible chart details, animated calendar/slot controls and an encouraging
welcome during signup/login. Report entry must preserve the current screen.

## Evidence on Hand
Actual backend and seeded demo data. No medical targets, treatment advice,
testimonials or outcome claims are supplied.

## Product Principles
Keep recording fast. Make dates and units unambiguous. Preserve user privacy.
Show understandable errors and helpful empty states.
