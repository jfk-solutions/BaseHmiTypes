# Recipe stored source values

HmiRecipeDataSet.SourceValues (C#) / sourceValues (TypeScript) retains exact case-sensitive source keys and formatted values alongside the existing named-field Values view. It can preserve distinct source entries even when name, ID and encoded-key aliases map to one named field. TypeScript named-value dictionaries use no object prototype so special keys remain ordinary data.

Recipe HTML adds a Stored source values table when entries exist, with record name/number and escaped key/value text. Null values have null state and a Null label; empty strings remain present empty cells. Empty source collections add no table. Source entries use the existing scalar formatting; this is not a typed-value or array-expansion model. Array semantics, typed values and native/export comparison need further work.

Synthetic classic-family parser-to-HTML tests verify alias/case collisions, unmatched array-shaped keys, escaping, null/empty values and special keys. Base recipe regressions passed 12 C# and 11 TypeScript checks; both TypeScript builds and all Base framework builds passed.
