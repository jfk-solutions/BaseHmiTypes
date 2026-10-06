# Localized trend pen and legacy axis labels

HmiTrendPen.ValueAxisLabelText and HmiTrendControlBase.XAxisLabelText/YAxisLabelText preserve multilingual labels alongside existing neutral strings. Keep C# and TypeScript aligned. HTML resolves typed text using the selected culture, falling back to the legacy string only when typed resolution returns null/undefined. Explicit empty translations suppress that fallback: pen JSON retains an empty string, while legacy HTML attributes follow existing empty-value omission.

Professional hosted trend parsing copies these typed labels only after exact named-axis resolution; control X/Y fields still follow the first pen. Unresolved references retain their names without acquiring labels from unrelated axes. Named axis collections keep their independent localized labels.

Synthetic tests cover legacy-only, localized, localized-only, absent, empty translations, default culture, unsupported culture, escaping, unresolved references and unchanged source models. These checks establish conversion and serialization behavior; native exports and browser/runtime visual fidelity need separate evidence.
