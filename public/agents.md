# Arcjet for coding agents

Arcjet is the runtime security platform that ships with your code. Use this page to discover how to connect, install skills, and choose the right API.

## Connect

- MCP server: `https://api.arcjet.com/mcp` (Streamable HTTP, OAuth). Discovery: [/.well-known/mcp.json](https://docs.arcjet.com/.well-known/mcp.json). Docs: [MCP server](https://docs.arcjet.com/mcp-server).
- Skills: `npx skills add arcjet/skills` ([github.com/arcjet/skills](https://github.com/arcjet/skills)).
- Full onboarding: [Agent get started](https://docs.arcjet.com/agent-get-started).

## `protect()` vs `guard()`

| | `protect()` | `guard()` |
| --- | --- | --- |
| Use for | HTTP route handlers, API endpoints, middleware | Tool calls, MCP handlers, queues, jobs |
| Request object | Required | Not needed |
| Bots, Shield, email, filters, IP | Yes | No |
| Rate limiting, prompt injection, sensitive info | Yes | Yes |

A single app can use both — `protect()` on HTTP routes and `guard()` inside tool handlers.

## Next

- [Agent get started](https://docs.arcjet.com/agent-get-started)
- [Agent guards](https://docs.arcjet.com/guards)
- [MCP server](https://docs.arcjet.com/mcp-server)
- [llms.txt](https://docs.arcjet.com/llms.txt)
