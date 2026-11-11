# Architecture

Perspective AI Engine is the backend core for building and running AI-powered
applications. It ships a service layer, an Express HTTP API and a small demo
entry point, all in TypeScript with no runtime framework beyond Express.

## Modules

| Module | Path | Responsibility |
|---|---|---|
| Composition root | `src/core/AppCore.ts` | Singleton wiring storage, encryption and every manager |
| Auth | `src/core/AuthManager.ts` | Registration, login and credential checks |
| Users | `src/core/UserManager.ts` | User records and profile updates |
| Projects | `src/core/ProjectManager.ts` | Project lifecycle and per-user lookup |
| Sessions | `src/core/SessionManager.ts` | Session creation, validation and expiry |
| AI engine | `src/core/AIEngine.ts` | Generates project output (markdown, documents, HTML reports) |
| Admin | `src/core/AdminManager.ts` | Dashboard statistics across users and projects |
| Storage | `src/utils/storage.ts` | JSON file-backed persistence |
| Encryption | `src/utils/encryption.ts` | AES encryption, deterministic hashing, password hashing, token generation |
| Validation | `src/utils/validators.ts` | Email, password, name, URL, JSON, project-name and output-format checks |
| Activity log | `src/utils/activity-logger.ts` | Append-only audit trail of user actions |
| HTTP API | `src/server.ts` | Express routes with bearer-token middleware |
| Demo | `src/index.ts` | End-to-end walkthrough: register → login → project → generate → stats |

## Request flow

1. `server.ts` installs the JSON body parser and the `authMiddleware`. Every
   protected route validates the bearer token against `SessionManager` before
   the handler runs.
2. Handlers resolve records through `AppCore`, which is the only place that
   constructs managers, so dependencies are explicit and testable.
3. Writes go through `StorageService`; secrets and tokens pass through
   `EncryptionService` first.
4. Every state change is appended to the activity log with the acting user.

## Trust boundaries

- Passwords are hashed, not stored; tokens are generated with a cryptographic
  source and validated per request.
- Inputs are validated before they reach a manager.
- Provider credentials and storage paths come from environment variables; the
  HTTP layer never echoes them.
- Admin routes require the `admin` role on the validated session.

## Verification

```bash
npx tsc -p tsconfig.test.json
node --test "dist-test/test/*.test.js"
```

The suite exercises the validator rules and the encryption contract
(round-trip, deterministic hashing, password hashing, unique tokens). CI runs
the same commands on Node 22 for every push and pull request.
