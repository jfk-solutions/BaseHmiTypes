# TypeScript Package Releases

- The TypeScript package uses date versions, such as `2026.10.6`, matching the TiaFileFormat TS release convention.
- Build `typescript/base-hmi-types` before running `npm pack`; its published files come from `dist`.
- The technology scheme editor consumes the archive from its `external/` directory. Update the core dependency and lockfile, plus the linked core dependency references in the app and tests lockfiles.
- Release matching BaseHmiTypes and TiaFileFormat builds when the file-format library imports new model types. Verify installed package versions, archive integrity, model exports, and editor compilation.
- Never replace an existing archive with changed contents under the same version. Append same-day revisions such as `2026.10.6-1`, matching the reader's date/revision convention.
- The coordinated release on 2026-10-06 uses BaseHmiTypes `2026.10.6-1` and TiaFileFormat TS `2026.10.6-8`. The reader's distributed dependency must use the exact BaseHmiTypes revision; its source checkout retains the development file link. No dependency override is needed when the versions agree.
