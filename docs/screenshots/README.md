# Application screenshots

These are screenshots of the implemented React client connected to the real
Express API, using a disposable PGlite database and synthetic demo readings.
They contain no patient data. Captured on 11 November 2026.

- Desktop captures: 1440px wide.
- Mobile captures: 390px wide, with an 844px viewport.
- The demo dashboard has three readings so the unrecorded slot is visible.
- Full-page mobile captures retain the fixed navigation at the viewport's bottom;
  it therefore appears partway down the tall image. In use it stays at the bottom
  of the screen while content scrolls underneath.

| Screen | Desktop | Mobile |
| --- | --- | --- |
| Login | [View](login-desktop.jpg) | [View](login-mobile.jpg) |
| Signup | [View](signup-desktop.jpg) | |
| Dashboard | [View](dashboard-desktop.jpg) | [View](dashboard-mobile.jpg) |
| Reports | [View](reports-desktop.jpg) | [View](reports-mobile.jpg) |
| Grouped history | [View](history-desktop.jpg) | [View](history-mobile.jpg) |
| Contextual reading form | [View](reading-form-desktop.jpg) | [View](reading-form-mobile.jpg) |
| Calendar | [View](calendar-desktop.jpg) | |
| Welcome | [View](welcome-desktop.jpg) | |

The open slot menu is covered by component tests and browser interaction checks.
The screenshot tool dismissed that transient menu during capture, so a misleading
partial-animation image is intentionally excluded.
