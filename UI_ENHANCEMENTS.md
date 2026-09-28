# DebtLens visual redesign

DebtLens now uses a dark developer-workspace design: deep navy backgrounds, layered
blue-charcoal surfaces, cyan navigation and focus indicators, blue primary actions,
and distinct success, warning, critical, and indigo accents. No dependencies,
business features, navigation destinations, or mock data were added.

## Major visual changes

- **Page composition:** large page-title panels, generous section spacing, clearer
  grouping, and separate background, section, card, and interactive surfaces.
- **Metrics:** labels above prominent values, secondary supporting information,
  separate icon wells, restrained gradients, and existing status indicators.
- **Navigation:** redesigned dark sidebar, cyan selected-page marker, distinct icon
  containers, translucent top bars, inset search fields, and profile treatments.
- **Authentication:** framed visual panel with a quiet grid and cyan heading accent;
  dark form surfaces, stronger labels, larger inputs, focus glow, and readable
  feedback. Existing marketing text and static widgets remain unchanged.
- **Organizations:** framed sections, separated filter tabs, darker company cards,
  grouped repository information, and responsive wrapping of existing actions.
- **Tables/details:** darker column headers, stronger row hierarchy, status badges,
  horizontal scrolling, keyboard focus, and redesigned loading/empty/error surfaces.
- **Dialogs/reports:** blurred overlay, layered dark dialog, separate header/body/
  footer surfaces, readable severity badges, and animated existing score meters.
- **Motion:** 20px section entrances, sequential cards, 0.95-to-1 dialog entrances,
  hover elevation, and 0.97 press feedback. Entrances last 350–600ms and interactions
  about 200ms. Only real loading indicators loop. Reduced-motion disables motion.

## Files changed in this redesign

| File | Purpose |
| --- | --- |
| `src/polish.css` | Replaced the subtle light-theme polish with the shared dark design, layout, motion, and responsive system |
| `src/index.css` | Connects Tailwind semantic colors to shared design tokens, dark autofill, accessible success colors |
| `src/components/common/Input.tsx` | Dark input surfaces, stronger labels, larger fields, theme-aware focus |
| `src/components/common/Button.tsx` | Dark secondary and disabled surfaces, primary action colors, larger controls |
| `src/pages/LoginPage.tsx` | Auth composition hooks and dark presentation colors |
| `src/pages/RegisterPage.tsx` | Auth composition, dark colors, feedback, password-control labels |
| `src/pages/UserDashboard.tsx` | Page/section/card hooks, dark utility and inline colors, modal-control labels |
| `src/pages/SystemAdminDashboard.tsx` | Status-dot presentation follows the existing loading/health state |
| `src/pages/SystemAdminAnalysisJobs.tsx` | Readable company-name color on the dark table |
| `UI_ENHANCEMENTS.md` | Updated design and verification notes |

Earlier improvements to `App.tsx`, `main.tsx`, admin table components,
`configuration.test.ts`, and `tsconfig.app.json` remain in the working tree.

`polish.css` owns the design tokens and shared appearance. Tailwind semantic utilities
reference those tokens. Existing conditional status colors still derive from the
same backend values. Scroll reveals progressively enhance browsers that support
CSS view timelines; other browsers retain visible content without scroll motion.

## Functional preservation

A TypeScript AST comparison against the frontend at the start of this redesign
confirmed **32 fetch call sites**, **416 hook/auth/state calls**, and **434 visible
JSX text nodes** remain unchanged (normalizing line endings). Existing routes,
authentication, validation, state, data expressions, and action handlers were retained.
No product information, metrics, organizations, repositories, users, or notifications
were introduced. Existing static content was preserved.

## Verification

- `npm run build`: passes. Vite still warns that the main bundle exceeds 500kB.
- `npm test`: **9 passed, 1 failed**. All existing UI tests pass, including login,
  registration, password validation, role routing, company URL validation, and logout.
- The existing configuration test still fails because it requires
  `VITE_API_BASE_URL`, while the application uses localhost URLs. Those API endpoints
  were preserved as requested.
- `npm run lint`: **31 existing errors and 2 warnings**, the same totals as before
  this redesign. They concern existing business-code typing and React effect rules.
- Headless Edge layout checks at **320, 390, 768, 1024, and 1440px**: login,
  registration, isolated admin/user dashboards, and the create-company dialog fit
  without document horizontal overflow. Admin navigation was exercised in error states.
- Reduced-motion emulation: **zero running animations**.
- Before/after desktop and mobile screenshots are available locally in
  `../.ui-review/`; redesigned screenshots have the `dark-` prefix.
- Browser dashboard checks used isolated components without an authenticated Auth0
  session. Live authenticated backend operations, populated tables/reports, and
  data-dependent dialogs were not exercised. Their request and state code remains
  unchanged; full end-to-end verification needs a signed-in session and backend.
