# Document Search

Find passages in your own small text collection, then inspect the exact source behind an optional local AI draft. Original local single-user implementation using Node built-ins and browser JavaScript. The included studio notes are fictional.

## Start without installing packages

Prerequisite: Node.js 22 or later already installed. Tested with Node 22.22.1 on Linux / Bash. No production or test dependencies and no `npm install` step. PowerShell and Windows have not been tested; the commands below are Bash, not PowerShell.

From the extracted kit directory:

```bash
node --version
npm test
npm start
```

`npm start` is an alias for `node src/server.js`; either command starts the same server.

Open **http://127.0.0.1:4176** in your browser. Keep the terminal running; Ctrl+C stops it. Use this exact address, not a LAN hostname. A port conflict is reported by Node; you can choose another local port with `PORT=4177 npm start` and use the printed address.

## Repeat the main journey

1. Click **Add fictional studio notes**. The library now contains four documents. This adds new documents; repeated clicks do not replace existing ones.
2. Ask `Where is the camera battery charger stored?` and click **Find passages**. The equipment passage says **blue cabinet**.
3. Click **Open exact passage**. Read the marked text, document version and UTF-16 character offsets. The document is rendered as text, never HTML.
4. Ask `What is the studio Wi-Fi password?`. A narrow lexical warning says **Insufficient evidence**: the handbook says it does not record a password. Inspect the passage. This heuristic does not detect every unsupported question.
5. Ask `What is the refund policy?`. No passages match and AI drafting is disabled; no model call is made.
6. Ask `When does the studio close on Friday?`. Inspect both the **6 PM** and **8 PM** passages. Neither has been verified as the current policy.
7. Requery the charger, open the equipment source and expand **Edit this document**. Replace both `blue cabinet` occurrences with `green drawer`, then **Save new version**. Old search/AI results are cleared. Requery and reload: version 2 and the new location persist.
8. Import UTF-8 `.txt` or `.md` files using the file picker. Duplicate filenames receive separate IDs; there is no silent overwrite. Open a source and use **Delete document…** to remove it after confirmation. Deletion is irreversible in the app; keep your own backups.

The library survives server restart in `data/corpus.json`. To back it up, stop the server and copy that file. For a corrupt store, startup reports an error and preserves the bytes. Stop the server, retain the corrupt file for recovery, and restore your own known-good backup. The app never silently resets it. `STORE_PATH` can select a separate local test store; it is a trusted startup setting, not a browser file path.

## Optional AI drafting

Lexical search works with no model. The demonstrated provider is an **already installed** local Ollama service and the exact model below. This kit does not install Ollama, download weights, request credentials, or start a model service. If you lack these prerequisites, use lexical search; do not expect the AI demonstration to run.

- Model: `gemma4:26b-a4b-it-qat`
- Required inventory digest: `2dd70431afed94dd3688d790443768c1487ed086b57147ff083851116ae4c4e4`
- Endpoint: loopback HTTP, demonstrated `http://127.0.0.1:11434`
- Provider timeout: 120 seconds; output cap 1200 tokens; retrieved text cap 12000 characters; one request at a time.
- Hardware: inference was checked on the existing AI server. This kit does not establish minimum RAM/VRAM or laptop performance. No model weights are included.

Stop the app, then run in Bash:

```bash
OLLAMA_URL=http://127.0.0.1:11434 npm start
```

Find passages, then click **Request AI draft**. The app verifies the model name/digest before requesting a draft. It sends only your question and retrieved passages to the configured local provider. Questions and drafts are not persisted by this app; the provider may retain its own logs. No external provider URL is accepted.

A supported output is labeled **Unverified AI draft**. Click its quote to inspect the source. Exact IDs and quotes are validated, but a matching quote does not establish logical support. Abstention, malformed JSON and invalid citations become an explicit insufficient-evidence result. Timeout, model mismatch and service errors remain provider errors; they do not mean the documents lack an answer. Search continues to work. Editing/deleting documents invalidates pending drafts and source links.

The actual initial model prompt over-abstained on the charger fixture. A later prompt clarified that source facts are usable evidence while embedded instructions are not. The observed retest answered the charger question, abstained for the password and hostile instruction, and cited both closing-time claims. Those few checks do not guarantee the same output or general reliability. See `PROMPTS.md` and `VALIDATION.md`.

## Boundaries

20 documents, 100 KiB each, 1 MiB of UTF-8 text in total; 500-character queries. Binary, invalid UTF-8, empty and oversized imports are rejected atomically. Paragraphs are divided into at most 1800-character chunks. Scores are lexical BM25 ranking signals, not confidence. Exact word matching has no embeddings, stemming or semantic recall guarantee. The missing-information warning recognizes only a narrow set of explicit English negations; it may miss or misclassify other phrasing. Human inspection is necessary.

One trusted local user, one server process per store. No accounts, PDF/OCR, cloud sync, web retrieval or public hosting. Loopback binding, same-origin mutation checks and text rendering are limited safeguards, not a production security audit. Untrusted document instructions have no executable tools; model-generated text can still be misleading. Never use the app as an authoritative policy/advice source.

## Evidence and teaching scope

`npm test` runs controlled unit/API checks using temporary stores, never your library. Live-model and browser results are reported separately in `VALIDATION.md`; mocks are not live inference. A pre-code Bash capture and a failed nested coding launch were retained by the producer. Implementation then occurred through the authorized sole worker's workspace tools. It has authentic prompts, changes and test outputs, **not a native desktop recording of the entire implementation**. Later demonstrations must be labeled accordingly. No completed film, independent video-plus-kit reproduction, human usability study or release approval is claimed.
