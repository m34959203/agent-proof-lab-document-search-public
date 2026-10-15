# Changelog

## 1.0.0 — 2026-10-14 (producer candidate, not independently accepted)

- Original dependency-free local corpus, atomic storage, import/edit/delete, lexical retrieval and exact versioned source inspection.
- Optional pinned local model with structured drafts, validated quotes, explicit abstention/errors and corpus-revision invalidation.
- Responsive keyboard-accessible controls tested in Chromium at 390/768/2560px; no accessibility certification.
- Retained first test failure caused by inherited provider configuration; made the unconfigured-provider test explicit.
- Retained live-model over-abstention; clarified the evidence/instruction boundary and observed corrected fixture results.
- Added a limited lexical missing-information warning; source passages remain visible for inspection.
- Decode JSON request buffers as a single fatal UTF-8 stream to avoid splitting multibyte characters at network chunk boundaries.
