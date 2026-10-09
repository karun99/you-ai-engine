# Perspective AI Engine

TypeScript/Express backend engine for Perspective AI — build and deploy AI-powered applications with a unique perspective.

## Structure

- `src/` — TypeScript source (core modules, types, utilities, server entry)
- `tsconfig.json` — TypeScript configuration
- `vercel.json` — Vercel deployment config

## Getting Started

```bash
npm install
npm run build    # compile TypeScript
npm start        # run compiled JS
npm run dev      # watch mode
```

## MCP server

This application ships a dependency-free [Model Context Protocol](https://modelcontextprotocol.io)
server (`mcp-server/server.mjs`) exposing its core operations to agentic clients.
It speaks JSON-RPC 2.0 over stdio and adds no runtime dependencies.

Add the repository's [`.mcp.json`](.mcp.json) to your MCP client, or run:

```bash
node mcp-server/server.mjs
```

Protocol smoke tests:

```bash
python3 -m unittest discover -s tests -p "test_mcp_server.py" -v
```

See [docs/MCP.md](docs/MCP.md) and [mcp-server/README.md](mcp-server/README.md).
