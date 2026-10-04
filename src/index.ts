#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { getConfig } from './config.js';
import { createServer } from './server.js';
import { SERVER_NAME, SERVER_VERSION } from './version.js';

const HELP = `${SERVER_NAME} v${SERVER_VERSION} — MCP server for the Revolut Business API.

This is a Model Context Protocol server that communicates over stdio. It is meant to
be launched by an MCP client (e.g. Claude Desktop), not run interactively.

Configuration (environment variables):
  REVOLUT_CLIENT_ID         (required) Client ID from the Revolut Business portal
  REVOLUT_PRIVATE_KEY_PATH  Path to the PEM private key that signs the JWT
  REVOLUT_PRIVATE_KEY       PEM contents (alternative to the path)
  REVOLUT_REDIRECT_URI      OAuth redirect URI (default: https://example.com/)
  REVOLUT_JWT_ISS           JWT issuer (defaults to the redirect URI host)
  TOKEN_STORE_PATH          Token store path (default: ./.tokens.json)
  REVOLUT_ENVIRONMENT       sandbox (default) or production

Docs: https://github.com/fingentic/revolut-mcp`;

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    // eslint-disable-next-line no-console
    console.log(HELP);
    return;
  }
  if (args.includes('--version') || args.includes('-v')) {
    // eslint-disable-next-line no-console
    console.log(`${SERVER_NAME} ${SERVER_VERSION}`);
    return;
  }

  const config = getConfig();
  const server = createServer(config);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // eslint-disable-next-line no-console
  console.error(`revolut-mcp connected (environment: ${config.environment}).`);
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Fatal error:', error);
  process.exit(1);
});
