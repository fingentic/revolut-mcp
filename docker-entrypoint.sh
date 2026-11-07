#!/bin/sh
set -e

usage() {
    echo "Revolut MCP server (Revolut Business API)"
    echo ""
    echo "Configure via environment variables:"
    echo "  REVOLUT_CLIENT_ID         Client ID from the Revolut Business portal"
    echo "  REVOLUT_PRIVATE_KEY       PEM contents of the signing private key"
    echo "  REVOLUT_PRIVATE_KEY_PATH  Path to the signing private key file (alternative to above)"
    echo "  REVOLUT_REDIRECT_URI      OAuth redirect URI (default: https://example.com/)"
    echo "  REVOLUT_JWT_ISS           JWT issuer (defaults to the redirect URI host)"
    echo "  TOKEN_STORE_PATH          Token store path (default: /app/.tokens.json)"
    echo "  REVOLUT_ENVIRONMENT       sandbox (default) or production"
    echo ""
    echo "The server communicates over stdio (Model Context Protocol)."
}

case "${1:-}" in
    --help | -h)
        usage
        exit 0
        ;;
esac

# Sensible container defaults; any value already in the environment wins.
export TOKEN_STORE_PATH="${TOKEN_STORE_PATH:-/app/.tokens.json}"
export REVOLUT_ENVIRONMENT="${REVOLUT_ENVIRONMENT:-sandbox}"
export REVOLUT_REDIRECT_URI="${REVOLUT_REDIRECT_URI:-https://example.com/}"

if [ $# -eq 0 ]; then
    exec node /app/dist/index.js
else
    exec "$@"
fi
