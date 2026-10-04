# Contributing

Thank you for your interest in contributing to revolut-mcp!

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- A Revolut Business **sandbox** account with an API certificate (see the
  [Authentication guide](docs/getting-started/authentication.md))

### Local Setup

```bash
git clone https://github.com/fingentic/revolut-mcp.git
cd revolut-mcp
npm install
cp .env.sandbox.template .env
# Fill in REVOLUT_CLIENT_ID, the private key path, and the redirect URI
```

### Common Commands

```bash
npm run build          # compile TypeScript → dist/
npm run dev            # run with ts-node
npm test               # unit tests
npm run test:coverage  # coverage report
npm run lint           # type-check only (tsc --noEmit)
```

The live integration tests are opt-in (they hit the sandbox and need a valid token store):

```bash
REVOLUT_RUN_INTEGRATION=1 npm run test:integration
```

## Architecture

```
src/
├── index.ts            # entrypoint (stdio transport)
├── server.ts           # builds the MCP server from all scopes
├── config.ts           # env-based configuration
├── version.ts          # server identity
├── client/             # auth (JWT client assertion) + HTTP client + token store
├── types/revolut.ts    # Business API response types
├── utils/              # tool registry, zod→JSON-Schema, formatting, errors
└── scope/
    ├── index.ts        # aggregates every scope
    └── <scope>/index.ts # one folder per scope, exporting a Scope of tools
```

Each scope exports a `Scope` (`{ name, description, tools }`). Each tool is built with `defineTool({
name, description, schema, annotations, handler })`, where `schema` is a Zod object and `handler`
receives the parsed input plus a `ToolContext` (`config`, `auth`, `client`).

## Adding a New Tool

1. Add (or extend) the client method in `src/client/revolut-client.ts`.
2. Add the tool to the relevant `src/scope/<scope>/index.ts` with a Zod input schema, a clear
   description, and appropriate `annotations` (`readOnlyHint`, `destructiveHint`, etc.).
3. If it's a new scope, create `src/scope/<scope>/index.ts` and register it in `src/scope/index.ts`.
4. Add unit tests in `tests/<scope>.test.ts` (use the mock client in `tests/mocks/`).
5. Document it in `docs/reference/<scope>/README.md`.
6. Update the Features table in `README.md`.

## Contribution Guidelines

### Branch Naming

| Prefix | Use |
|---|---|
| `feature/` | New tools or capabilities |
| `fix/` | Bug fixes |
| `docs/` | Documentation only |
| `chore/` | Maintenance, deps, CI |

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/) — GitVersion reads these to
determine the next version:

```
feat(payments): add scheduled payment support
fix(auth): preserve refresh token across refresh
docs(readme): clarify sandbox setup
```

| Prefix | Version bump |
|---|---|
| `feat:` | minor |
| `fix:`, `chore:`, `refactor:`, `perf:`, `ci:`, `test:`, `build:` | patch |
| `docs:` | no bump |
| `+semver: breaking` (footer) | major |

### Pull Requests

1. Fork and branch from `master`.
2. Add or update tests for any changed behaviour.
3. Make sure `npm run lint`, `npm run build`, and `npm test` pass.
4. Open a PR with a clear description; reference related issues with `Closes #N`.

## Code Style

- TypeScript strict mode is enforced.
- Avoid `any` (the one deliberate exception is the erased tool-collection element type — see
  `src/utils/tool.ts`).
- Prefer explicit return types on exported functions.
- Keep tool handlers pure — dependencies arrive via `ToolContext`, not globals.
- Comment *why*, not *what*, and only when non-obvious.

## Security

Never commit your private key, `.env`, or `.tokens.json`. See [SECURITY.md](SECURITY.md).

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
