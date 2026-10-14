# Shared HTML controls

Run `npm run build` to compile the controls and regenerate the identical embedded
runtime module in the C# and TypeScript HTML converters. Run focused browser or
Node checks under `test/` after changing controls.

The bundle replaces the SVG component's JavaScript evaluator with
`src/svg-expression.ts`. It parses bounded expressions with Acorn and permits
only arithmetic, comparisons, conditional expressions, parameter/local members
and known math, color and comparison helpers. Globals, prototype access,
assignments and arbitrary function calls are rejected. SVG path templates
interpolate each `{{expression}}` separately. The component's binding extraction
is adapted during bundling so source expressions are preserved, including
bindings with an opening marker and no closing marker. No `unsafe-eval` CSP
permission is needed; project scripts remain outside the SVG evaluator.
