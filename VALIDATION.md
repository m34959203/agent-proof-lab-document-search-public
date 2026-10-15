# Validation scope — 2026-10-14

Producer checks, not independent acceptance or release approval. No human listening or human usability study was performed. Exact source and artifact hashes are retained in the private producer checkpoint; this document summarizes reproducible commands and limitations.

Run `npm test` in the kit directory. Thirteen Node tests cover multiple frozen acceptance cases with real temporary storage and an HTTP server. Provider fixtures are explicitly controlled; they are not claimed as live-model inference. The initial suite ran 12/13 because the missing-provider test inherited OLLAMA_URL. An explicit empty URL fixed the test setup. Subsequent suite: 13/13. Acceptance assertions were not weakened.

| Case | Producer result and scope |
|---|---|
| DS01 | Clean startup / no runtime packages: local UI served and empty corpus opened. Clean kit startup is also checked separately. |
| DS02 | Charger passage, exact source version and offsets checked in unit tests and Chromium. |
| DS03 | Missing-password lexical warning retains the source; real model and browser request abstained. This does not guarantee all absent questions are recognized. |
| DS04 | Refund question returned zero hits; provider invocation skipped; browser drafting disabled. |
| DS05 | Both 6 PM / 8 PM passages retained. Actual corrected model prompt cited both as conflicting, without selecting a verified time. |
| DS06 | New version / green drawer saved, stale results cleared and reload retained edit. |
| DS07 | Controlled delayed provider response after edit/delete rejected by API. Actual browser pending-edit test did not display the old response. Deleted source panel closed. |
| DS08 | Empty/query/file/Unicode/count/total-size failures checked; previous corpus remained unchanged. Browser invalid UTF-8 error visible. |
| DS09 | Duplicate names retained distinct IDs; malicious HTML rendered as literal text without script execution in Chromium. |
| DS10 | Controlled malformed JSON, unknown IDs, invented quotes and abstention rejected. A valid quote remains an unverified draft. |
| DS11 | Actual pinned model and digest checked through local inventory before inference. First prompt falsely abstained for the charger; corrected prompt returned a supported quote and abstained for absent password. Both attempts retained. |
| DS12 | Controlled connection, timeout, server and digest errors checked. Browser provider-error/timeout states kept lexical passages available and displayed no fake no-answer. |
| DS13 | Hostile fixture was not loaded by default. Actual model abstained when it was added. Adapter exposes no executable tools; only fixed local inventory/chat endpoints. This is not proof of universal injection resistance. |
| DS14 | Chromium 1.61.1 driver / installed headless shell: 390/768/2560px layout, question/search keyboard traversal, focused source opening, no horizontal overflow. Sampled visual inspection at 390px. No screen-reader/Windows/mobile-device certification. |
| DS15 | Reload/restart durable corpus; isolated corrupt JSON rejected without changing its bytes. |
| DS16 | **PENDING INDEPENDENT EXACT VIDEO + KIT REPRODUCTION.** A producer clean-kit run is partial evidence only. No exact video exists yet, and the author cannot sign the separate reviewer’s result. |

Model observations are small deterministic-setting samples, not a benchmark or a promise of identical output. Full browser test tooling was available in the producer environment and is not a runtime dependency of this kit. A viewer needs only Node and a browser for lexical search; optional AI prerequisites are explicit in README.

Teaching limitation: pre-code footage and the real failed CLI launch exist, but the direct worker implementation was not continuously filmed in a native terminal. Source diffs, actual prompt binding and tests are retained. Reconstructed footage must be labeled, and the teaching claim requires separate editorial review before release.
