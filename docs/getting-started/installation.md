# Installation

`revolut-mcp` is a [Model Context Protocol](https://modelcontextprotocol.io) server for the **Revolut Business API**. It is a TypeScript/Node application that communicates with an MCP client (Claude Desktop, Cursor, the MCP Inspector, etc.) over **stdio**.

This page covers prerequisites, the available install methods, and configuration via environment variables. Once installed and configured, complete the one-time browser sign-in described in the [Authentication guide](authentication.md).

---

## Prerequisites

- **Node.js 18 or newer** (`node --version` to check).
- A **Revolut Business account** with **sandbox** access. You can create one from the [Revolut Business sandbox](https://sandbox-business.revolut.com/).
- An **API certificate** registered in the Business portal under **Settings → APIs**:
  - You generate an X.509 key pair, upload the **public certificate** to the portal, and keep the matching **private key** locally. That private key signs the client-assertion JWT used at the token endpoint.
  - The portal gives you a **Client ID** for the certificate.
  - You register a **redirect URI** with the certificate. It must be a public **HTTPS** URL — Revolut's consent page rejects `localhost`. You never need to host anything there; you only copy the `code` query parameter back out of the URL, so a placeholder such as `https://example.com/` works fine.

> Generating the key pair and registering the certificate is part of the Revolut Business API onboarding. See the [Authentication guide](authentication.md) for the full walkthrough.

---

## Install options

Pick **one** of the following.

### (a) From npm

Install the package globally and run the bundled `revolut-mcp` binary:

```bash
npm install -g @jeff-nasseri/revolut-mcp
revolut-mcp
```

Or run it on demand without a global install (handy in MCP client configs):

```bash
npx @jeff-nasseri/revolut-mcp
```

Both expose the same stdio MCP server. Set the configuration environment variables (see [Configuration](#configuration)) before launching, or let your MCP client inject them via its `env` block.

### (b) From source

```bash
# Clone the repository
git clone https://github.com/fingentic/revolut-mcp.git
cd revolut-mcp

# Install dependencies
npm install

# Build (compiles TypeScript to dist/)
npm run build

# Run the server (stdio)
node dist/index.js
```

The build step produces `dist/index.js`, which is the entry point you point your MCP client at. During development you can skip the build and run the TypeScript directly with `npm run dev`.

### (c) Docker

A prebuilt image is published to the GitHub Container Registry as `ghcr.io/fingentic/revolut-mcp`. Because the server speaks stdio, run the container with `-i` (interactive) so the MCP client can attach to the process's stdin/stdout:

```bash
docker run -i --rm \
  -e REVOLUT_CLIENT_ID=your_client_id \
  -e REVOLUT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
...
-----END PRIVATE KEY-----" \
  -e REVOLUT_REDIRECT_URI=https://example.com/ \
  -e REVOLUT_ENVIRONMENT=sandbox \
  ghcr.io/fingentic/revolut-mcp
```

Passing the key inline with `REVOLUT_PRIVATE_KEY` avoids mounting a file. If you prefer a file, mount it and point `REVOLUT_PRIVATE_KEY_PATH` at the in-container path:

```bash
docker run -i --rm \
  -e REVOLUT_CLIENT_ID=your_client_id \
  -e REVOLUT_PRIVATE_KEY_PATH=/keys/privatekey.pem \
  -e REVOLUT_REDIRECT_URI=https://example.com/ \
  -v "$(pwd)/certs:/keys:ro" \
  ghcr.io/fingentic/revolut-mcp
```

> **Token persistence in Docker:** OAuth tokens are written to `TOKEN_STORE_PATH` (default `/app/.tokens.json` in the image). With `--rm` and no volume, that file is lost when the container exits, so you would have to re-authenticate each run. To keep tokens between runs, mount a volume and set `TOKEN_STORE_PATH` to a path inside it, e.g. `-v "$(pwd)/.revolut:/data" -e TOKEN_STORE_PATH=/data/.tokens.json`.

---

## Configuration

The server is configured entirely through environment variables. Set them in your shell, in a `.env` file (a starting point is provided in `.env.sandbox.template`), or in your MCP client's `env` block.

| Variable | Required | Default | Description |
|---|---|---|---|
| `REVOLUT_CLIENT_ID` | **Yes** | — | Client ID from the Revolut Business portal (**Settings → APIs**), shown on the API certificate you created. |
| `REVOLUT_PRIVATE_KEY_PATH` | One of these two | — | Path to the PEM private key that signs the client-assertion JWT. |
| `REVOLUT_PRIVATE_KEY` | One of these two | — | The PEM private key contents inline (takes precedence over the path; convenient in containers/CI). |
| `REVOLUT_REDIRECT_URI` | No | `https://example.com/` | The redirect URI registered with the certificate. Must be a public **HTTPS** URL — `localhost` is rejected by Revolut. |
| `REVOLUT_JWT_ISS` | No | host of the redirect URI | JWT issuer (`iss`) claim. Override only if your issuer differs from the redirect URI host. |
| `TOKEN_STORE_PATH` | No | `./.tokens.json` | Where OAuth access/refresh tokens are persisted between restarts. |
| `REVOLUT_ENVIRONMENT` | No | `sandbox` | Target environment: `sandbox` or `production`. Production requires a production certificate. |

> Provide **either** `REVOLUT_PRIVATE_KEY_PATH` **or** `REVOLUT_PRIVATE_KEY` — exactly one is needed. If both are set, the inline `REVOLUT_PRIVATE_KEY` wins.

> **Keep secrets out of version control.** Never commit your `.env`, your private key, or `.tokens.json`.

### Example `.env`

```env
REVOLUT_CLIENT_ID=your_client_id_here
REVOLUT_PRIVATE_KEY_PATH=./certs/privatekey.pem
REVOLUT_REDIRECT_URI=https://example.com/
TOKEN_STORE_PATH=./.tokens.json
REVOLUT_ENVIRONMENT=sandbox
```

---

## Next steps

The server starts unauthenticated. Before the account, transaction, payment, and other tools can reach Revolut, you must complete the one-time OAuth browser flow exposed as the `setup_auth` and `complete_auth` MCP tools.

➡️ Continue to the **[Authentication guide](authentication.md)**.

For trying the tools interactively, see [Using the MCP Inspector](../integrations/inspector.md) and the [usage examples](../examples/usage-examples.md).
