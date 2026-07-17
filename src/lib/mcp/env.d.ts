// Ambient declaration for `process.env` used inside MCP tool handlers.
// The MCP function runs on Deno, but tools are authored under src/lib/mcp/
// where Vite (browser) TS types are the default. This keeps type-checking happy
// without pulling @types/node into the browser build.
declare const process: { env: Record<string, string | undefined> };
