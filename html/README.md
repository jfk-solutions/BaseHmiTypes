# Shared HTML controls

Run `npm run build` to compile the controls and regenerate the identical embedded
runtime module in the C# and TypeScript HTML converters. Run focused browser or
Node checks under `test/` after changing controls.

`hmi-trend-companion` displays the configured ruler, statistics-area or statistics
columns imported by the paired readers. Its `values` attribute accepts an array
of `{ values: { [infoBlock]: scalar } }` rows from the owning runtime. Each update
replaces that instance's displayed evaluation; missing values remain empty and
no preview samples are generated. The source-control ID and name identify the
associated trend within that screen instance. Live acquisition and evaluation
belong to the runtime data service rather than the HTML converter.

Runtime trend charts receive a `runtime-data` attribute containing measured
`series` (pen `number` and timestamped `points`), view bounds `from`/`to`, and
optional ruler/selection/statistics state. Its presence suppresses generated
preview curves, including for invalid or empty data. Bad-quality null points break
curves. Named trend windows inherit the same measured data without sharing mutable
state. The control emits composed `hmi-trend-action` (explicit native button ID)
and `hmi-trend-select` (normalized start/end fractions) events for the owning host.

The bundle replaces the SVG component's JavaScript evaluator with
`src/svg-expression.ts`. It parses bounded expressions with Acorn and permits
only arithmetic, comparisons, conditional expressions, parameter/local members
and known math, color and comparison helpers. Globals, prototype access,
assignments and arbitrary function calls are rejected. SVG path templates
interpolate each `{{expression}}` separately. The component's binding extraction
is adapted during bundling so source expressions are preserved, including
bindings with an opening marker and no closing marker. No `unsafe-eval` CSP
permission is needed; project scripts remain outside the SVG evaluator.
