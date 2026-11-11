---
name: Sweety
description: A calm, minimalist personal glucose journal.
colors:
  bg: "#f7f9fd"
  surface: "#ffffff"
  panel: "#edf2fc"
  ink: "#29364d"
  muted: "#5d6c83"
  line: "#e1e6f0"
  accent: "#4d67c2"
  accent-hover: "#3c54a5"
  accent-soft: "#e4ebff"
  error: "#a2362e"
  error-bg: "#fff1ed"
  focus: "#6f86cf"
  chart-line: "#7e95d6"
  chart-grid: "#e1e6f0"
  sidebar: "#f0f3fb"
  nav-active: "#e1e9ff"
  field-line: "#d8e1f0"
  form-panel: "#edf2fc"
  error-hover: "#862b27"
  dialog-overlay: "rgb(32 47 68 / 0.28)"
  mobile-nav-active: "#edf2ff"
  glucose-line: "#cfdaef"
typography:
  display:
    fontFamily: "'Manrope Variable', sans-serif"
    fontSize: "54px"
    fontWeight: 650
    lineHeight: 1.13
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "'Manrope Variable', sans-serif"
    fontSize: "32px"
    fontWeight: 750
    lineHeight: 1.25
    letterSpacing: "-0.04em"
  title:
    fontFamily: "'Manrope Variable', sans-serif"
    fontSize: "16px"
    fontWeight: 750
    lineHeight: 1.5
    letterSpacing: "-0.025em"
  body:
    fontFamily: "'Manrope Variable', sans-serif"
    fontSize: "13px"
    lineHeight: 1.8
  label:
    fontFamily: "'Manrope Variable', sans-serif"
    fontSize: "12px"
    fontWeight: 750
  reading:
    fontFamily: "'Manrope Variable', sans-serif"
    fontSize: "22px"
    fontWeight: 650
    letterSpacing: "-0.03em"
rounded:
  panel: "14px"
  button: "9px"
  field: "8px"
  badge: "5px"
  slot: "11px"
  toast: "10px"
  dialog: "16px"
spacing:
  field-gap: "8px"
  button-gap: "9px"
  panel-inset: "24px"
  dashboard-gap: "26px"
  content-inline: "42px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface}"
    rounded: "{rounded.button}"
    padding: "11px 20px"
    typography: "{typography.body}"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.button}"
    padding: "11px 20px"
  button-danger-hover:
    backgroundColor: "{colors.error-hover}"
  button-danger:
    backgroundColor: "{colors.error}"
    textColor: "{colors.surface}"
    rounded: "{rounded.button}"
    padding: "11px 20px"
  panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.panel}"
    padding: "24px"
  field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "12px 13px"
  badge-complete:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent}"
    rounded: "{rounded.badge}"
    padding: "5px 8px"
  navigation-active:
    backgroundColor: "{colors.nav-active}"
    textColor: "{colors.accent}"
    rounded: "{rounded.field}"
    padding: "0 14px"
---

# Design System: Sweety

## Overview

**Creative North Star: "The Calm Journal"**

This descriptive name captures the implemented interface: a light, quiet place to record personal readings, with confident typography and a restrained cool palette. It describes the existing system rather than introducing a new brand direction.

The visual character comes from blue-white space, cornflower actions, powder-blue completion cues and thin dividers. Information is compact but clearly grouped; large reading values and bold headings establish hierarchy without decorative illustrations. Motion marks loading and successful actions without competing with the data.

**Key Characteristics:**

- Light surfaces with cool blue undertones.
- Self-hosted Manrope with strong heading and numeric hierarchy.
- Border-based panels and gently rounded controls.
- Responsive navigation, visible labels and explicit feedback.

## Colors

The palette is cool and restrained. The frontmatter records the normative values extracted from `client/src/styles.css`; recurring chart colors come from the chart component.

### Primary

- **Cornflower:** primary actions, brand, selected navigation text and recorded chart points. Accent Hover darkens enabled actions on hover.
- **Powder Blue:** completed daily counts, completed rhythm steps and text selection. It supports completion rather than indicating a medical target.
- **Chart Blue:** the fine line connecting recorded values.

### Neutral

- **Off-white:** application background; **White:** journal, report and history panels and ordinary fields.
- **Soft Panel:** authentication story and quiet hover surfaces; **Form Panel:** subtly distinct recording form background; **Sidebar:** the fixed navigation surface.
- **Ink:** headings and values; **Muted:** descriptions, units and placeholders. Placeholders retain the same readable muted tone as secondary text.
- **Line:** panel outlines and dividers; **Field Line:** form boundaries; **Chart Grid:** dashed horizontal guides.
- **Navigation Active:** selected desktop destination. **Focus:** the visible keyboard outline.

Error and Error Background form the feedback pair for validation, failed requests and destructive actions.

**The Readable Feedback Rule.** Keep meaning visible in words and values; blue is not a glucose health classification, and errors include text rather than relying on color alone.

## Typography

**Display and Body Font:** Manrope Variable, with sans-serif fallback, bundled through `@fontsource-variable/manrope` in `client/src/main.jsx`. There is no separate display or monospace family.

The variable weights give headings confidence while keeping supporting copy quiet. Use sentence case; numerical readings and summaries use tabular numerals.

### Hierarchy

- **Display:** authentication story heading; reduces to (44px) at the tablet breakpoint and its story panel disappears on mobile.
- **Headline:** page heading; reduces to (28px) at and below the one-column breakpoint.
- **Title:** section heading. Recording-form titles are larger (18px); authentication form titles are (30px).
- **Body:** page and authentication introductions use the body role. Supporting chart, field-help and footer text uses the implemented smaller (10–12px) hierarchy; do not apply the body size indiscriminately to every caption.
- **Label:** visible form labels and row labels. Regular reading values use the reading role; summary values use (26px), with compact and mobile adjustments.
- **Glucose entry:** the large numeric field uses (43px), increasing to (48px) on mobile. Ordinary mobile form inputs use (16px).

The stylesheet's final readability overrides are authoritative over earlier declarations: section titles are (16px), primary buttons and navigation are (13px), and desktop field labels are (12px).

## Layout

Desktop uses a fixed sidebar (230px) and a matching main-content offset. The top bar is (84px) tall. Main content has a maximum width (1530px), centered inside the remaining space, with padding (38px 42px 20px). The dashboard pairs a flexible journal with a recording column (320px), separated by the dashboard gap. Standard panels use the panel inset; reports use (27px).

Responsive behavior follows the actual CSS cascade:

- At widths at least (1550px), the recording column expands to (360px), the gap to (34px) and main dashboard panels to (30px) padding.
- At widths at most (1200px), the sidebar narrows to (200px), the recording column to (285px), and panel padding to (20px).
- At widths at most (1000px), the sidebar is (185px) and the dashboard becomes one column. The recording form and month note share a two-column secondary region.
- At widths at most (700px), the sidebar disappears, main offset resets, and fixed bottom navigation takes over. The secondary region stacks; content includes (100px) bottom padding and navigation respects the device safe area. The top bar is (75px), panels generally use (20px 17px), and the recording panel uses (26px 23px). Authentication becomes a single form column.
- At widths at most (380px), reading-row slot icons disappear to preserve space for data and actions. The application supports a minimum width (320px).

## Elevation & Depth

Panels are flat: white or softly tinted backgrounds, thin borders and whitespace establish depth. There are no panel shadows or hover lifts. The transient success toast has a soft shadow (`0 8px 25px #293b6120`) so it separates from the journal beneath it. Popovers and dialogs use border and overlay separation rather than shadows. Focus uses a visible outline (3px), usually offset by (4px); the glucose field instead gains an accent underline and a (2px) bottom shadow when deliberately focused.

**The Quiet Surface Rule.** Preserve the border-based panel vocabulary; reserve the existing shadow for transient notification feedback.

## Shapes

Panels and the recording form use gently curved corners from the panel radius. Buttons have a tighter button radius; fields, icon buttons and navigation use the field radius. Completion badges are compact rounded rectangles, not capsules. Slot icons use their own softer radius, while avatars and rhythm markers are circles. Borders are thin (1px); reading rows divide through horizontal rules rather than separate floating cards.

## Components

### Buttons

Primary buttons are solid cornflower with white text, a minimum height (46px), bold weight (700) and inline icon gap from the spacing tokens. Enabled hover darkens the accent. Secondary buttons are white with an outline and soft panel hover. Danger buttons use error red and the deeper Error Hover on enabled hover. Text buttons underline on hover. Disabled buttons show reduced opacity (0.5) and a disabled cursor.

All interactive controls retain the visible focus outline. Global color, border and shadow transitions last (180ms). Icon-only controls have accessible names. Mobile row actions grow to (36px × 40px).

### Cards / Containers

Journal, trend, history and report panels use the white surface, panel radius and thin Line border. The recording form is tinted Form Panel, with no panel outline. Headings align with compact counts or actions. Flat dividers group readings and summaries within these containers.

### Inputs / Fields

Labels sit above white outlined controls with a field gap. Focus changes the border to Cornflower and retains the keyboard outline. Invalid fields use an error border, `aria-invalid`, linked explanatory text and an alert message. Placeholder text uses Muted. The glucose control is a large transparent numeric text field over a bottom rule, with the unit outside the editable value. Busy submissions disable the fieldset and show a saving label. Date changes, edits and form resets never autofocus glucose; manual focus adds the accent underline without moving the page.

Dates use a Radix popover with an animated DayPicker calendar, selected-day styling, fixed weeks, a Go to today action and disabled future dates. Both the compact selected-date trigger and form date show day, abbreviated month and year (for example, 11 Nov 2026). Selecting a date closes the popover. Time slot uses an animated Radix Select with four fixed options, keyboard selection, highlighted/checked states and a check indicator; it preserves the Morning fasting label. Controls retain linked invalid/help text and use (16px) trigger text on mobile.

### Navigation

Desktop navigation is a vertical list: muted at rest, pale on hover, and tinted with Cornflower bold text and a small dot when active. Mobile uses three fixed bottom destinations with icons and captions; its active surface is a lighter tint (`#edf2ff`). The skip link becomes visible on focus. Logout is available in the desktop rail and mobile top bar.

### Completion badges and reading rows

Count badges combine text with small completion marks; full days use Powder Blue. Four daily rows preserve the fixed slots, including an em dash and an Add control for missing readings. Recorded values align right with explicit `mg/dl` units and direct edit/delete actions. Delete opens an inline confirmation under the same row with “Keep reading” and “Delete reading”; failure text stays beside the confirmation.

### Date-grouped history and contextual entry

History groups recorded rows beneath a softly tinted date header with weekday or Today, full date and a recorded-slot count. API pagination covers seven complete days per page, so a day never splits between pages. Same-date background refreshes keep existing rows and chart mounted instead of showing page-wide skeletons; changing the date or history page can show initial loading.

Overview entry scrolls to its adjacent recording form. Add/edit actions from history and reports open a Radix dialog over the current screen. The title receives initial focus, dismissal restores focus to the original opener, and saving blocks dismissal until the request settles. The dialog has a (440px) width constrained to the viewport, a scrollable body, a (16px) radius and a translucent blue-gray overlay. Its inner form is transparent and unpadded.

### Trends and reports

The trend is a responsive SVG (650 × 180 viewBox), a fine blue polyline (2px), Cornflower points (3.5px radius) and dashed horizontal guides (`3 5`). Its vertical bounds extend around actual readings in increments of twenty; three guide labels and up to three date labels keep it quiet. Points represent readings at equal index spacing, not continuous elapsed time. A single point is centered. Hover, focus, click or tap selects a reading and displays its exact date, slot and value inline beneath the chart, announced politely. Pointer presses inspect the nearest reading. A roving keyboard stop supports Left/Right, Home/End and Enter/Space; selected and keyboard-focused points gain an accent stroke and larger radius. Point titles retain exact details; an accessible chart title summarizes the range and directs users to Reading history. Empty charts show explanatory text rather than fabricated data. There are no medical target bands.

Summary order is Average, Highest, Lowest, Readings. Average always has one decimal; missing statistics use an em dash, count defaults to zero, and only glucose statistics carry `mg/dl`. Four columns use subtle vertical separators and tabular numerals. Reports label their date range explicitly.

### Motion and feedback

Saved values settle over (240ms) with a small translation and blur reduction. Toasts enter over (240ms) using the easing token recorded in the sidecar. Loading placeholders breathe over (1.4s); chart points grow on hover over (160ms). Calendar/slot popups enter over (200ms) and exit over (130ms); calendar month changes use (180ms). Dialog content enters over (260ms) and exits over (150ms), while its overlay fades over (220ms)/(150ms). Journal navigation uses short view transitions where supported and a (180ms) content entrance.

The encouraging welcome uses the wordmark, breathing emblem and four dots on the application background. During signup/login it remains visible for at least (1400ms), waits for initial journal data or a handled error, and leaves with a (180ms) fade. General encouragement rotates per visit and every (4500ms) while waiting in a visible tab. The underlying interface is inert while covered; session restoration also uses the welcome as its loading state.

The global reduced-motion preference disables animations and transitions, including view transitions, and restores automatic scroll behavior. Toasts sit above bottom navigation on mobile.

## Do's and Don'ts

### Do:

- **Do** use the frontmatter tokens and check the final CSS cascade when extending existing components.
- **Do** keep dates, slot names, units, empty states and error messages explicit.
- **Do** preserve tabular numerals, visible labels, keyboard focus and reduced-motion behavior.
- **Do** keep deletion confirmation inline with the affected reading.
- **Do** verify both the one-column dashboard and safe-area-aware mobile navigation.

### Don't:

- **Don't** add panel shadows, oversized pill buttons or decorative gradients to this flat system.
- **Don't** replace the cornflower accent with black or reintroduce the rejected natural green accent.
- **Don't** autofocus glucose after date changes or replace mounted journal data with loading placeholders during a background refresh.
- **Don't** replace missing readings with zeros or omit units from recorded glucose values.
- **Don't** introduce medical targets, health-status colors or treatment claims unsupported by the product.
- **Don't** shrink ordinary mobile form text below the implemented readable size or hide labels in placeholders.
