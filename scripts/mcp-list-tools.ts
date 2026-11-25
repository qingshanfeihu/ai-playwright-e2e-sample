import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
(async () => {
  const transport = new StdioClientTransport({ command: 'npx', args: ['playwright', 'run-test-mcp-server'] });
  const client = new Client({ name: 'probe', version: '0.0.1' });
  await client.connect(transport);
  const { tools } = await client.listTools();
  for (const t of tools) console.log(t.name, '-', (t.description ?? '').split('\n')[0].slice(0, 90));
  await client.close();
})();
