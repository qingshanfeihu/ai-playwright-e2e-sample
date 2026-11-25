/** Call the MCP server's test_run tool — the same output a healer agent reads. */
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
(async () => {
  const client = new Client({ name: 'mcp-run-tests', version: '1.0.0' });
  await client.connect(new StdioClientTransport({
    command: 'npx', args: ['playwright', 'run-test-mcp-server'],
    env: { ...process.env, RUN_EXPERIMENTS: process.env.RUN_EXPERIMENTS ?? '' } as Record<string, string>,
  }));
  const r: any = await client.callTool({ name: 'test_run', arguments: { locations: process.argv.slice(2) } });
  console.log((r.content ?? []).map((c: any) => c.text).join('\n'));
  await client.close();
})();
