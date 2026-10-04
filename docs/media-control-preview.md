# Media control HTML preview

Both C# and TypeScript screen renderers dispatch HmiMediaControl to a dedicated unloaded preview. Existing Source and AutoPlay properties survive as escaped metadata; source text and explicitly configured autoplay settings are also visible. Expressions remain engineering configuration, and missing autoplay remains unspecified. Common geometry, appearance and screen-item attributes use the shared renderer path.

The preview does not load or play media. Native media resources, runtime commands, bar configuration, video scaling, Unified URL source mapping and engineering-preview fidelity still need coverage. Synthetic tests exercise escaped source text, true/false/unspecified autoplay, expression fallback and unloaded output. Renderer regression suites passed 490 C# and 434 TypeScript checks.
