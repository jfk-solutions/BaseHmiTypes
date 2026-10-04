# Analog clock HTML preview

`HmiClock.Analog = true` now produces an SVG dial rather than digital text with
an analog metadata flag. The preview uses the same fixed sample as the digital
renderer: `2000-01-01T12:34:56`. It does not read PLC time, animate, evaluate
live tags, or apply product-specific date/time formats and time zones.

The dial keeps its circular aspect ratio in rectangular widgets. `ShowTime`,
`ShowHours`, `ShowMinutes`, `ShowSeconds`, `ShowDate` and `ShowTicks` control the
corresponding preview elements. Hours/minutes/ticks default on; seconds/date
default off. There are 60 ticks, with a larger mark every five ticks.

Hand outlines use `ForegroundColor`; interiors use `HandFillColor` (foreground
when absent). `OutlinedHands` removes the interior fill. Tick color uses
`TicksColor`, falling back to foreground. Colors and dimensions use static
values or retained tag fallback values, never live tag evaluation.

`HourHandLengthPercent`, `MinuteHandLengthPercent`, and
`SecondHandLengthPercent` are percentages of dial radius (defaults 50/70/80).
The corresponding `*HandHalfWidthPercent` properties are percentages of hand
length (defaults 10/8/2). The pointed polygon has its shoulders at 15% and base
at 1% of hand length. This construction follows the native classic Siemens
clock hand drawing formula, not a guess that native dimensions are pixels.
The fixed sample angles are 17, 204, and 336 degrees from twelve o'clock.

For bounded HTML geometry, percentages clamp to 0..100; nonfinite values use
defaults. Zero length or width hides that hand. Original source values should
remain available in the importing format's native model. Digital output is
unchanged. `NumberStyle` has no verified dial-label semantics and is not drawn.

This is a static neutral preview, not pixel-identical GDI/theme rendering.
Classic WinCC background modes, theme effects, focus rendering, custom pictures,
locale-dependent digital formatting and native-to-neutral clock projection are
not implemented by this feature. Native raw control state must remain preserved.
