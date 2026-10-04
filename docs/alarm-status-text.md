# Alarm default status text and tooltips

HmiAlarmControl.StatusBarText is optional multilingual engineering text; ShowStatusBarTooltips is an optional Boolean property. Both C#/TS HTML renderers preserve selected plain text and tooltip-switch metadata. Empty configured translations retain an empty data-status-bar-text attribute; absent text omits it. Hidden status bars retain model/configuration metadata.

When no status panels are configured, the preview shows escaped default status text, or the existing Status placeholder if text is absent. Configured panels keep their existing preview layout. Explicit false suppresses panel title attributes while retaining Tooltip model data; absent switches preserve previous behavior.

Synthetic Professional PDL-to-HTML cases verify all languages, neutral fallback, empty/absent text, escaping, panel precedence, true/false/unspecified tooltips and hidden bars. Hosted suites passed 45 C# and 39 TypeScript checks; Base renderer suites passed 491 C# and 433 TypeScript checks. Native layout and runtime message substitution remain unverified.
