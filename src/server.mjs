import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { bootstrapEnv } from './env-bootstrap.mjs';
import { getCapabilityTier, isToolAllowed } from './capability.mjs';
import { listPrompts, getPromptContent } from './prompts-registry.mjs';
import { listResources, readResource } from './resources-registry.mjs';
import { buildCatalogTools, catalogToolCount, catalogCoreCount, catalogBulkCount } from './tool-catalog.mjs';
import { listToolsForSession, handleTool, formatToolResult } from './tools.mjs';

function getCatalog() {
  return buildCatalogTools();
}
const CATALOG_BY_NAME = () => new Map(getCatalog().map((t) => [t.name, t]));

export async function startMcpServer() {
  bootstrapEnv();

  const server = new Server(
    { name: 'ThejaD', version: '4.1.0' },
    {
      capabilities: {
        tools: {},
        prompts: {},
        resources: {},
      },
    },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const tier = getCapabilityTier();
    const named = listToolsForSession();
    const catalog = getCatalog().filter((t) => isToolAllowed(t.tier, tier)).map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
    }));
    const namedList = named.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
    }));
    return { tools: [...namedList, ...catalog] };
  });

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const tier = getCapabilityTier();
    const name = req.params.name;
    const args = req.params.arguments || {};

    const named = listToolsForSession().find((t) => t.name === name);
    if (named) {
      if (!isToolAllowed(named.tier || 'standard', tier)) {
        return {
          content: [{ type: 'text', text: 'Tool requires full access (mamaThejana or THEJAD_FULL_ACCESS=1).' }],
          isError: true,
        };
      }
      const data = await handleTool(name, args);
      if (data?.content) return data;
      if (data?.isError) return data;
      return formatToolResult(data);
    }

    const cat = CATALOG_BY_NAME().get(name);
    if (!cat) {
      return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
    }
    if (!isToolAllowed(cat.tier, tier)) {
      return {
        content: [{ type: 'text', text: 'Tool requires full access (mamaThejana or THEJAD_FULL_ACCESS=1).' }],
        isError: true,
      };
    }
    return handleCatalogTool(cat, args);
  });

  server.setRequestHandler(ListPromptsRequestSchema, async () => ({
    prompts: listPrompts(),
  }));

  server.setRequestHandler(GetPromptRequestSchema, async (req) => {
    const { name, arguments: args } = req.params;
    const body = getPromptContent(name, args || {});
    const text = typeof body === 'string' ? body : JSON.stringify(body, null, 2);
    return {
      messages: [
        {
          role: 'user',
          content: { type: 'text', text: `# ThejaD prompt: ${name}\n\n${text}` },
        },
      ],
    };
  });

  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: listResources().map(({ uri, name, description, mimeType }) => ({
      uri,
      name,
      description,
      mimeType,
    })),
  }));

  server.setRequestHandler(ReadResourceRequestSchema, async (req) => {
    const text = readResource(req.params.uri);
    if (text == null) {
      throw new Error(`Resource not found: ${req.params.uri}`);
    }
    return {
      contents: [
        {
          uri: req.params.uri,
          mimeType: 'text/plain',
          text,
        },
      ],
    };
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

async function handleCatalogTool(cat, args) {
  const { category, action } = cat;
  if (category === 'coordination' && action === 'claim') {
    return formatToolResult(await handleTool('coordination_claim', args));
  }
  if (category === 'coordination' && action === 'release') {
    return formatToolResult(await handleTool('coordination_release', args));
  }
  if (category === 'coordination' && action === 'list_claims') {
    return formatToolResult(await handleTool('coordination_list', args));
  }
  if (category === 'programme' && action === 'mvp_percent') {
    return formatToolResult(await handleTool('thejad_status', args));
  }
  if (category === 'ba' && action === 'story_lookup') {
    return formatToolResult(await handleTool('story_lookup', args));
  }
  if (category === 'ui' && action === 'route_map') {
    return formatToolResult(await handleTool('lahiru_ui_review', { route: args.route || '/home' }));
  }
  if (category === 'security' && action === 'white_hat_scan') {
    return formatToolResult(await handleTool('security_white_hat_scan', args));
  }
  if (category === 'qa' && action.startsWith('smoke_')) {
    const area = action.replace('smoke_', '').replace('phase', 'phase');
    return formatToolResult(await handleTool('smoke_hint', { area: area === 'phase1' ? 'phase1' : area }));
  }
  if (category === 'graphify' && action === 'index_repo') {
    return formatToolResult(await handleTool('graphify_hint', args));
  }
  if (category === 'device') {
    const map = {
      reindex: 'device_reindex',
      search: 'device_search',
      usable_summary: 'device_usable_summary',
      usable_search: 'device_usable_search',
      mcp_discover: 'device_usable_summary',
      ollama_models: 'device_usable_summary',
      fusionx_paths: 'device_usable_search',
    };
    const tool = map[action];
    if (tool === 'device_usable_search') {
      return formatToolResult(
        await handleTool(tool, { category: args.category || 'fusionxOrBanking', query: args.input || args.query || '' }),
      );
    }
    if (tool === 'device_search') {
      return formatToolResult(await handleTool(tool, { query: args.input || args.query || 'fusionx' }));
    }
    if (tool) return formatToolResult(await handleTool(tool, args));
  }
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            ok: true,
            tool: cat.name,
            category,
            action,
            hint: 'Use named ThejaD tools for live execution; catalog tool registered for Cursor discovery.',
            args,
          },
          null,
          2,
        ),
      },
    ],
  };
}

export function getServerStats() {
  const tier = getCapabilityTier();
  const named = listToolsForSession().filter((t) => isToolAllowed(t.tier || 'standard', tier));
  const catalog = getCatalog().filter((t) => isToolAllowed(t.tier, tier));
  return {
    tools: named.length + catalog.length,
    catalogTotal: catalogToolCount(),
    catalogCore: catalogCoreCount(),
    catalogBulk: catalogBulkCount(),
    prompts: listPrompts().length,
    resources: listResources().length,
    tier,
    version: '4.1.0',
  };
}
