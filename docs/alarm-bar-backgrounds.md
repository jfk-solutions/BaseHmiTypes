# Alarm bar background switches

HmiAlarmControl has optional UseToolbarBackgroundColor and UseStatusBarBackgroundColor properties in C# and TypeScript. Both HTML renderers retain switches and configured colors as metadata. Explicit false suppresses that configured bar CSS background override while leaving foreground/font styling and bar visibility independent. Missing switches preserve existing preview behavior. Source colors are not removed when disabled.

Synthetic Professional PDL-to-model-to-HTML tests cover all nine combinations of true, false and unspecified settings. Hosted suites passed 42 C# and 36 TypeScript checks; Base renderer suites passed 491 C# and 433 TypeScript checks. This does not establish native theme color defaults or engineering-preview fidelity.
