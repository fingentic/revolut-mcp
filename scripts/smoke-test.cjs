// Smoke test for a built revolut-mcp server: starts it over stdio, performs the
// MCP initialize handshake and checks the advertised tools. Needs no network
// access and no real credentials; the server only needs a well-formed config
// to start. CI runs it against the packed npm tarball, so it proves the
// published artifact starts and registers its tools, not just the source tree.
//
// Usage: node scripts/smoke-test.cjs <server-entry.js> [min-tools]
const os = require('os');
const path = require('path');
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');

const REQUIRED_TOOLS = ['setup_auth', 'complete_auth', 'get_accounts', 'create_payment'];

async function main() {
  const [entry, minTools = '21'] = process.argv.slice(2);
  if (!entry) {
    console.error('usage: node scripts/smoke-test.cjs <server-entry.js> [min-tools]');
    process.exit(2);
  }

  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [path.resolve(entry)],
    env: {
      PATH: process.env.PATH || '',
      REVOLUT_CLIENT_ID: 'ci-smoke-test',
      REVOLUT_PRIVATE_KEY: 'not-a-real-key',
      REVOLUT_REDIRECT_URI: 'https://example.com/',
      REVOLUT_ENVIRONMENT: 'sandbox',
      TOKEN_STORE_PATH: path.join(os.tmpdir(), 'revolut-mcp-smoke-tokens.json'),
    },
  });
  const client = new Client({ name: 'ci-smoke', version: '1.0.0' }, { capabilities: {} });

  try {
    await client.connect(transport);
    const info = client.getServerVersion();
    const { tools } = await client.listTools();
    const names = tools.map((t) => t.name);
    console.log(`server: ${info.name} ${info.version}, ${names.length} tools`);

    const missing = REQUIRED_TOOLS.filter((n) => !names.includes(n));
    if (missing.length) throw new Error(`missing tools: ${missing.join(', ')}`);
    if (names.length < Number(minTools)) {
      throw new Error(`expected at least ${minTools} tools, got ${names.length}`);
    }
    console.log('smoke test passed');
  } finally {
    await client.close().catch(() => {});
  }
}

main().catch((error) => {
  console.error('smoke test failed:', error.message || error);
  process.exit(1);
});
